import { mkdir, chmod } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';
import { DatabaseSync } from 'node:sqlite';
export interface Database { query<T extends Record<string, unknown>>(sql: string, params?: (string | number | null)[]): Promise<T[]>; }
const schema = [
  `CREATE TABLE IF NOT EXISTS plugin_entries (name TEXT PRIMARY KEY, revision INTEGER NOT NULL DEFAULT 1, draft TEXT NOT NULL, archived INTEGER NOT NULL DEFAULT 0, published_version TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS plugin_releases (name TEXT NOT NULL REFERENCES plugin_entries(name), version TEXT NOT NULL, document TEXT NOT NULL, package TEXT NOT NULL, sha256 TEXT NOT NULL, visibility TEXT NOT NULL, revoked INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, PRIMARY KEY(name,version))`,
  `CREATE TABLE IF NOT EXISTS plugin_audit (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, action TEXT NOT NULL, revision INTEGER NOT NULL, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS plugin_login_attempts (bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL)`,
  `CREATE TRIGGER IF NOT EXISTS plugin_release_publish AFTER INSERT ON plugin_releases BEGIN UPDATE plugin_entries SET published_version=NEW.version, revision=revision+1, updated_at=NEW.created_at WHERE name=NEW.name; INSERT INTO plugin_audit(name,action,revision,created_at) SELECT NEW.name,'publish',revision,NEW.created_at FROM plugin_entries WHERE name=NEW.name; END`,
  `CREATE TRIGGER IF NOT EXISTS plugin_created AFTER INSERT ON plugin_entries BEGIN INSERT INTO plugin_audit(name,action,revision,created_at) VALUES(NEW.name,'create',NEW.revision,NEW.created_at); END`,
  `CREATE TRIGGER IF NOT EXISTS plugin_edited AFTER UPDATE ON plugin_entries WHEN NEW.published_version IS OLD.published_version BEGIN INSERT INTO plugin_audit(name,action,revision,created_at) VALUES(NEW.name,CASE WHEN NEW.archived!=OLD.archived THEN CASE WHEN NEW.archived=1 THEN 'archive' ELSE 'restore' END ELSE 'edit' END,NEW.revision,NEW.updated_at); END`,
  `CREATE TRIGGER IF NOT EXISTS plugin_release_revoked AFTER UPDATE ON plugin_releases WHEN NEW.revoked=1 AND OLD.revoked=0 BEGIN INSERT INTO plugin_audit(name,action,revision,created_at) SELECT NEW.name,'revoke',revision,unixepoch()*1000 FROM plugin_entries WHERE name=NEW.name; END`,
];
// Postgres functions and triggers preserve the same atomic publication and audit
// semantics as SQLite. CREATE OR REPLACE makes initialization safe to repeat.
const postgresSchema = [
  `CREATE TABLE IF NOT EXISTS plugin_entries (name TEXT PRIMARY KEY, revision INTEGER NOT NULL DEFAULT 1, draft TEXT NOT NULL, archived INTEGER NOT NULL DEFAULT 0, published_version TEXT, created_at BIGINT NOT NULL, updated_at BIGINT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS plugin_releases (name TEXT NOT NULL REFERENCES plugin_entries(name), version TEXT NOT NULL, document TEXT NOT NULL, package TEXT NOT NULL, sha256 TEXT NOT NULL, visibility TEXT NOT NULL, revoked INTEGER NOT NULL DEFAULT 0, created_at BIGINT NOT NULL, PRIMARY KEY(name,version))`,
  `CREATE TABLE IF NOT EXISTS plugin_audit (id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, action TEXT NOT NULL, revision INTEGER NOT NULL, created_at BIGINT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS plugin_login_attempts (bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, expires BIGINT NOT NULL)`,
  `CREATE OR REPLACE FUNCTION supercharge_plugin_publish() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN UPDATE plugin_entries SET published_version=NEW.version, revision=revision+1, updated_at=NEW.created_at WHERE name=NEW.name; INSERT INTO plugin_audit(name,action,revision,created_at) SELECT NEW.name,'publish',revision,NEW.created_at FROM plugin_entries WHERE name=NEW.name; RETURN NEW; END $$`,
  `CREATE OR REPLACE TRIGGER plugin_release_publish AFTER INSERT ON plugin_releases FOR EACH ROW EXECUTE FUNCTION supercharge_plugin_publish()`,
  `CREATE OR REPLACE FUNCTION supercharge_plugin_created() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO plugin_audit(name,action,revision,created_at) VALUES(NEW.name,'create',NEW.revision,NEW.created_at); RETURN NEW; END $$`,
  `CREATE OR REPLACE TRIGGER plugin_created AFTER INSERT ON plugin_entries FOR EACH ROW EXECUTE FUNCTION supercharge_plugin_created()`,
  `CREATE OR REPLACE FUNCTION supercharge_plugin_edited() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.published_version IS NOT DISTINCT FROM OLD.published_version THEN INSERT INTO plugin_audit(name,action,revision,created_at) VALUES(NEW.name,CASE WHEN NEW.archived<>OLD.archived THEN CASE WHEN NEW.archived=1 THEN 'archive' ELSE 'restore' END ELSE 'edit' END,NEW.revision,NEW.updated_at); END IF; RETURN NEW; END $$`,
  `CREATE OR REPLACE TRIGGER plugin_edited AFTER UPDATE ON plugin_entries FOR EACH ROW EXECUTE FUNCTION supercharge_plugin_edited()`,
  `CREATE OR REPLACE FUNCTION supercharge_plugin_revoked() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.revoked=1 AND OLD.revoked=0 THEN INSERT INTO plugin_audit(name,action,revision,created_at) SELECT NEW.name,'revoke',revision,(EXTRACT(EPOCH FROM clock_timestamp())*1000)::BIGINT FROM plugin_entries WHERE name=NEW.name; END IF; RETURN NEW; END $$`,
  `CREATE OR REPLACE TRIGGER plugin_release_revoked AFTER UPDATE ON plugin_releases FOR EACH ROW EXECUTE FUNCTION supercharge_plugin_revoked()`,
];
const cache = new Map<string, Promise<Database>>();
export async function database(): Promise<Database> {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID, id = process.env.PLUGIN_D1_DATABASE_ID, token = process.env.CLOUDFLARE_D1_API_TOKEN;
  const postgresUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  const anyD1 = account || id || token;
  if (!postgresUrl && anyD1 && !(account && id && token)) throw new Error('D1 configuration is incomplete');
  const file = process.env.PLUGIN_DATABASE_PATH || path.join(process.cwd(), '.data', 'plugins.sqlite');
  if (process.env.VERCEL && !postgresUrl && !anyD1) throw new Error('Connect a Postgres database for durable catalog storage on Vercel');
  const key = postgresUrl ? `postgres:${createHash('sha256').update(postgresUrl).digest('hex')}` : anyD1 ? `d1:${account}:${id}` : `sqlite:${file}`;
  if (!cache.has(key)) cache.set(key, (async () => {
    let db: Database;
    if (postgresUrl) {
      const pool = new Pool({ connectionString: postgresUrl, max: 4, idleTimeoutMillis: 5000, connectionTimeoutMillis: 10000 });
      if (process.env.VERCEL) attachDatabasePool(pool);
      try {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await client.query('SELECT pg_advisory_xact_lock(721438964216)');
          for (const sql of postgresSchema) await client.query(sql);
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally { client.release(); }
      } catch (error) { await pool.end(); throw error; }
      db = { async query<T>(sql: string, params: (string | number | null)[] = []) {
        // The shared statements use SQLite placeholders. They contain no literal question marks.
        let index = 0;
        let statement = sql.replace(/\?/g, () => `$${++index}`).replace('DO UPDATE SET count=count+1', 'DO UPDATE SET count=plugin_login_attempts.count+1');
        // Lock the draft row until its immutable release and revision are committed.
        if (statement.startsWith('INSERT INTO plugin_releases(')) statement = statement.replace(' ON CONFLICT(name,version)', ' FOR UPDATE ON CONFLICT(name,version)');
        const result = await pool.query(statement, params);
        return result.rows as T[];
      } };
    } else if (anyD1) {
      if (!/^[a-f0-9]{32}$/i.test(account!) || !/^[a-f0-9-]{36}$/i.test(id!)) throw new Error('Invalid D1 account or database identity');
      db = { async query<T>(sql: string, params: (string | number | null)[] = []) {
        const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${id}/query`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ sql, params }), cache: 'no-store', signal: AbortSignal.timeout(15000) });
        const body = await r.json() as { success?: boolean; result?: { success: boolean; results: T[] }[] };
        if (!r.ok || !body.success || !body.result?.[0]?.success) throw new Error('D1 query failed');
        return body.result[0].results;
      } };
    } else {
      await mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
      const sqlite = new DatabaseSync(file);
      sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
      await chmod(file, 0o600);
      db = { async query<T>(sql: string, params: (string | number | null)[] = []) { return sqlite.prepare(sql).all(...params) as T[]; } };
    }
    if (!postgresUrl) for (const sql of schema) await db.query(sql);
    return db;
  })().catch((error) => { cache.delete(key); throw error; }));
  return cache.get(key)!;
}

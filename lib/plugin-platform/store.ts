import { createHash } from 'node:crypto';
import { database } from './database';
import { packageText, type PluginDocument, type PluginRecord } from './schema';
export class PlatformError extends Error { constructor(public status: number, message: string) { super(message); } }
type Row = Record<string, unknown>;
function record(r: Row): PluginRecord { return { name: String(r.name), revision: Number(r.revision), draft: JSON.parse(String(r.draft)), archived: !!r.archived, publishedVersion: r.published_version as string | null, publishedRevoked: !!r.published_revoked, createdAt: Number(r.created_at), updatedAt: Number(r.updated_at) }; }
export async function entries() { return (await (await database()).query('SELECT p.*, COALESCE((SELECT revoked FROM plugin_releases r WHERE r.name=p.name AND r.version=p.published_version),0) AS published_revoked FROM plugin_entries p ORDER BY updated_at DESC')).map(record); }
export async function entry(name: string) { const r = await (await database()).query('SELECT p.*, COALESCE((SELECT revoked FROM plugin_releases r WHERE r.name=p.name AND r.version=p.published_version),0) AS published_revoked FROM plugin_entries p WHERE name=?', [name]); if (!r[0]) throw new PlatformError(404, 'Plugin not found'); return record(r[0]); }
export async function create(document: PluginDocument) {
  const db = await database(), now = Date.now();
  const rows = await db.query('INSERT INTO plugin_entries(name,draft,created_at,updated_at) VALUES(?,?,?,?) ON CONFLICT(name) DO NOTHING RETURNING name', [document.name, JSON.stringify(document), now, now]);
  if (!rows.length) throw new PlatformError(409, 'This plugin name already exists; edit or restore it instead');
  return entry(document.name);
}
export async function update(name: string, revision: number, document: PluginDocument) {
  if (document.name !== name) throw new PlatformError(400, 'A plugin name is immutable; create a new plugin to rename it');
  const rows = await (await database()).query('UPDATE plugin_entries SET draft=?, revision=revision+1, updated_at=? WHERE name=? AND revision=? RETURNING name', [JSON.stringify(document), Date.now(), name, revision]);
  if (!rows.length) throw new PlatformError(409, 'This plugin changed in another session; reload before saving');
  return entry(name);
}
export async function archive(name: string, revision: number, archived = true) {
  const rows = await (await database()).query('UPDATE plugin_entries SET archived=?, revision=revision+1, updated_at=? WHERE name=? AND revision=? RETURNING name', [Number(archived), Date.now(), name, revision]);
  if (!rows.length) throw new PlatformError(409, 'This plugin changed; reload before continuing');
  return entry(name);
}
export async function publish(name: string, revision: number) {
  const p = await entry(name);
  if (p.revision !== revision || p.archived) throw new PlatformError(409, 'Reload this plugin or restore it before publishing');
  const body = packageText(p.draft), digest = createHash('sha256').update(body).digest('hex');
  if (Buffer.byteLength(body) + Buffer.byteLength(JSON.stringify(p.draft)) > 1500000) throw new PlatformError(400, 'This package is too large to publish; shorten the skill instructions');
  // INSERT SELECT + trigger is one atomic statement on SQLite and D1. Concurrent editors cannot publish stale drafts.
  const rows = await (await database()).query(`INSERT INTO plugin_releases(name,version,document,package,sha256,visibility,created_at) SELECT name,?,?,?, ?,?,? FROM plugin_entries WHERE name=? AND revision=? AND archived=0 ON CONFLICT(name,version) DO NOTHING RETURNING name`, [p.draft.version, JSON.stringify(p.draft), body, digest, p.draft.visibility, Date.now(), name, revision]);
  if (!rows.length) throw new PlatformError(409, 'Version already published or draft changed; reload and use a new version');
  return entry(name);
}
export async function releases(name: string) { return (await (await database()).query('SELECT version,sha256,visibility,revoked,created_at FROM plugin_releases WHERE name=? ORDER BY created_at DESC', [name])).map((r) => ({ version: String(r.version), sha256: String(r.sha256), visibility: String(r.visibility), revoked: !!r.revoked, createdAt: Number(r.created_at) })); }
export async function revoke(name: string, version: string) {
  const rows = await (await database()).query('UPDATE plugin_releases SET revoked=1 WHERE name=? AND version=? AND revoked=0 RETURNING version', [name, version]);
  if (!rows.length) throw new PlatformError(409, 'Release not found or already revoked');
}
export async function catalog(privateAccess: boolean) {
  return (await (await database()).query(`SELECT r.* FROM plugin_entries p JOIN plugin_releases r ON r.name=p.name AND r.version=p.published_version WHERE p.archived=0 AND r.revoked=0 ${privateAccess ? '' : "AND r.visibility='public'"} ORDER BY r.name`)).map((r) => releaseMetadata(r));
}
function releaseMetadata(r: Row) {
  const d = JSON.parse(String(r.document)) as PluginDocument;
  return { name: d.name, displayName: d.displayName, version: d.version, description: d.description, source: `catalog:${d.name}@${d.version}`, sha256: String(r.sha256), endpoint: Object.values(d.mcpServers)[0]?.url ?? 'Plugin tools and skills', authentication: 'configured_by_plugin', skillCount: d.skills.length, serverCount: Object.keys(d.mcpServers).length };
}
export async function release(name: string, version: string, privateAccess: boolean) {
  const rows = await (await database()).query(`SELECT r.* FROM plugin_releases r JOIN plugin_entries p ON p.name=r.name WHERE r.name=? AND r.version=? AND p.archived=0 ${privateAccess ? '' : "AND r.visibility='public'"}`, [name, version]);
  const r = rows[0]; if (!r) throw new PlatformError(404, 'Published plugin not found');
  if (r.revoked) throw new PlatformError(410, 'This release has been revoked');
  return { metadata: releaseMetadata(r), package: String(r.package) };
}
export async function audit() { return (await (await database()).query('SELECT * FROM plugin_audit ORDER BY id DESC LIMIT 100')).map((r) => ({ id: Number(r.id), name: String(r.name), action: String(r.action), revision: Number(r.revision), createdAt: Number(r.created_at) })); }

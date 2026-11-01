import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { handlePluginApi } from '../../lib/plugin-platform/api';

const url = process.env.TEST_PLUGIN_POSTGRES_URL;
test('Postgres supports authentication, concurrent edits and the complete release lifecycle', { skip: !url }, async () => {
  const host = new URL(url!).hostname;
  assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(host), 'Use an isolated local test database');
  process.env.POSTGRES_URL = url;
  process.env.PLUGIN_ADMIN_KEY = 'postgres-test-admin-key-with-at-least-32-characters';
  process.env.PLUGIN_SESSION_SECRET = 'postgres-test-session-secret-with-at-least-32-characters';
  process.env.PLUGIN_CATALOG_READ_TOKEN = 'postgres-test-catalog-token-with-at-least-32-characters';
  process.env.PLUGIN_PUBLIC_ORIGIN = 'http://localhost:3000';
  const name = `postgres-test-${Date.now()}`;
  const doc = { name, displayName: 'Postgres test', version: '1.0.0', description: 'Test Postgres storage', author: 'Supercharge', visibility: 'private', mcpServers: {}, skills: [{ name: 'test-skill', description: 'Test a plugin', instructions: 'Produce a draft.' }] };
  async function request(path: string, method = 'GET', body?: unknown, token = process.env.PLUGIN_ADMIN_KEY!) {
    return handlePluginApi(new Request(`http://localhost:3000/api/plugins/v1${path}`, { method, headers: { Origin: 'http://localhost:3000', Authorization: `Bearer ${token}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }));
  }
  try {
    assert.equal((await request('/admin/session', 'POST', { key: process.env.PLUGIN_ADMIN_KEY })).status, 200);
    const created = await request('/admin/plugins', 'POST', { document: doc });
    assert.equal(created.status, 201); const initial = await created.json();
    const edits = await Promise.all(['first', 'second'].map(description => request(`/admin/plugins/${name}`, 'PUT', { revision: initial.revision, document: { ...doc, description } })));
    assert.deepEqual(edits.map(r => r.status).sort(), [200, 409]);
    let current = await (await request(`/admin/plugins/${name}`)).json();
    const published = await request(`/admin/plugins/${name}/publish`, 'POST', { revision: current.revision });
    assert.equal(published.status, 200); current = await published.json();
    assert.equal(current.publishedVersion, '1.0.0');
    const catalog = await (await request('/plugins', 'GET', undefined, process.env.PLUGIN_CATALOG_READ_TOKEN)).json();
    const release = catalog.plugins.find((p: {name: string}) => p.name === name);
    assert.ok(release);
    const body = await (await request(`/plugins/${name}/releases/1.0.0/package`, 'GET', undefined, process.env.PLUGIN_CATALOG_READ_TOKEN)).text();
    assert.equal(createHash('sha256').update(body).digest('hex'), release.sha256);
    assert.equal((await request(`/admin/plugins/${name}/publish`, 'POST', { revision: current.revision })).status, 409);
    const archived = await request(`/admin/plugins/${name}`, 'DELETE', { revision: current.revision });
    assert.equal(archived.status, 200); current = await archived.json();
    assert.equal((await request(`/plugins/${name}/releases/1.0.0/package`, 'GET', undefined, process.env.PLUGIN_CATALOG_READ_TOKEN)).status, 404);
    const restored = await request(`/admin/plugins/${name}/restore`, 'POST', { revision: current.revision });
    assert.equal(restored.status, 200);
    assert.equal((await request(`/admin/plugins/${name}/revoke`, 'POST', { version: '1.0.0' })).status, 200);
    assert.equal((await request(`/plugins/${name}/releases/1.0.0/package`, 'GET', undefined, process.env.PLUGIN_CATALOG_READ_TOKEN)).status, 410);
    const events = (await (await request('/admin/audit')).json()).events.filter((event: {name: string}) => event.name === name);
    assert.deepEqual(new Set(events.map((event: {action: string}) => event.action)), new Set(['create', 'edit', 'publish', 'archive', 'restore', 'revoke']));
  } finally {
    const { database } = await import('../../lib/plugin-platform/database');
    const db = await database();
    await db.query('DELETE FROM plugin_audit WHERE name=?', [name]);
    await db.query('DELETE FROM plugin_releases WHERE name=?', [name]);
    await db.query('DELETE FROM plugin_entries WHERE name=?', [name]);
  }
});

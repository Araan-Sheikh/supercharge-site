import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { handlePluginApi } from '../../lib/plugin-platform/api';
import { pluginDocument, packageText, type PluginDocument, type PluginRecord } from '../../lib/plugin-platform/schema';
import { starters } from '../../lib/plugin-platform/starters';
const dir = mkdtempSync(join(tmpdir(), 'supercharge-platform-test-'));
process.env.PLUGIN_DATABASE_PATH = join(dir, 'catalog.sqlite');
process.env.PLUGIN_ADMIN_KEY = 'test-only-admin-key-with-at-least-thirty-two-characters';
process.env.PLUGIN_SESSION_SECRET = 'test-only-session-secret-distinct-from-admin-key-123';
process.env.PLUGIN_CATALOG_READ_TOKEN = 'test-only-catalog-token-distinct-from-admin-key-123';
process.env.PLUGIN_PUBLIC_ORIGIN = 'http://localhost:3000';
delete process.env.CLOUDFLARE_ACCOUNT_ID; delete process.env.PLUGIN_D1_DATABASE_ID; delete process.env.CLOUDFLARE_D1_API_TOKEN;
after(async () => { await rm(dir, { recursive: true, force: true }); });
const sample: PluginDocument = { name: 'test-plugin', displayName: 'Test plugin', version: '1.0.0', description: 'Test release workflows', author: 'Supercharge', visibility: 'private', mcpServers: { 'test-service': { url: 'https://example.com/mcp' } }, skills: [{ name: 'release-brief', description: 'Use for release briefs', instructions: 'Read changes and produce a sourced draft.' }] };
async function req(path: string, method = 'GET', data?: unknown, auth: 'admin'|'catalog'|'none' = 'admin', extra: Record<string,string> = {}) {
  const headers: Record<string,string> = { Origin: 'http://localhost:3000', ...extra };
  if (auth !== 'none') headers.Authorization = `Bearer ${auth === 'admin' ? process.env.PLUGIN_ADMIN_KEY : process.env.PLUGIN_CATALOG_READ_TOKEN}`;
  if (data !== undefined) headers['Content-Type'] = 'application/json';
  return handlePluginApi(new Request(`http://localhost:3000/api/plugins/v1${path}`, { method, headers, body: data === undefined ? undefined : JSON.stringify(data) }));
}
type TestResponse = PluginRecord & { plugins: (PluginRecord & { sha256: string; authentication: string })[]; events: { action: string }[] };
async function json(response: Response): Promise<TestResponse> { return await response.json(); }
test('admin authentication, same-origin sessions and secret-free responses', async () => {
  assert.equal((await req('/admin/plugins','GET',undefined,'none')).status,401);
  assert.equal((await req('/admin/session','POST',{key:process.env.PLUGIN_ADMIN_KEY},'none',{Origin:'https://evil.example'})).status,403);
  assert.equal((await req('/admin/session','POST',{key:'wrong'},'none')).status,401);
  const response=await req('/admin/session','POST',{key:process.env.PLUGIN_ADMIN_KEY},'none');
  assert.equal(response.status,200);
  const cookie=response.headers.get('set-cookie')!;
  assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Strict/);
  assert.doesNotMatch(cookie,/test-only-admin/);
  const blocked=await req('/admin/seed','POST',{},'none',{Cookie:cookie, Origin:'https://evil.example',Authorization:'Bearer wrong'});
  assert.equal(blocked.status,403);
  assert.equal((await req('/admin/plugins','GET',undefined,'none',{Cookie:cookie})).status,200);
});
test('admin accepts a short non-empty password', async () => {
  const previous = process.env.PLUGIN_ADMIN_KEY;
  process.env.PLUGIN_ADMIN_KEY = 'a';
  try {
    const response = await req('/admin/session','POST',{key:'a'},'none');
    assert.equal(response.status, 200);
    assert.equal((await req('/admin/plugins','GET',undefined,'none',{Cookie:response.headers.get('set-cookie')!})).status, 200);
    assert.equal((await req('/admin/session','POST',{key:'b'},'none')).status, 401);
    process.env.PLUGIN_ADMIN_KEY = 'a'.repeat(513);
    assert.equal((await req('/admin/session','POST',{key:process.env.PLUGIN_ADMIN_KEY},'none')).status, 200);
  } finally { process.env.PLUGIN_ADMIN_KEY = previous; }
});
test('admin sessions work with only an administrator key configured', async () => {
  const previous = process.env.PLUGIN_SESSION_SECRET;
  delete process.env.PLUGIN_SESSION_SECRET;
  try {
    const response = await req('/admin/session','POST',{key:process.env.PLUGIN_ADMIN_KEY},'none');
    assert.equal(response.status, 200);
    const cookie = response.headers.get('set-cookie')!;
    assert.equal((await req('/admin/plugins','GET',undefined,'none',{Cookie:cookie})).status, 200);
  } finally { process.env.PLUGIN_SESSION_SECRET = previous; }
});
test('schema refuses traversal, executable URL schemes and pasted common secrets', () => {
  assert.equal(pluginDocument.safeParse({...sample,name:'../escape'}).success,false);
  assert.equal(pluginDocument.safeParse({...sample,mcpServers:{x:{url:'http://example.com/mcp'}}}).success,false);
  assert.equal(pluginDocument.safeParse({...sample,mcpServers:{x:{url:'https://example.com/mcp',headers:{Authorization:'Bearer raw-token'}}}}).success,false);
  assert.equal(pluginDocument.safeParse({...sample,mcpServers:{x:{command:'node',env:{API_KEY:'raw-secret'}}}}).success,false);
  assert.equal(pluginDocument.safeParse({...sample,mcpServers:{x:{command:'node',env:{API_KEY:'${SERVICE_KEY}'}}}}).success,true);
  const packageBody=JSON.parse(packageText(sample));
  assert.ok(packageBody.files['skills/release-brief/SKILL.md'].startsWith('---\nname:'));
});
test('draft CRUD, optimistic revisions, immutable publication, private access, revocation and restore', async () => {
  let r=await req('/admin/plugins','POST',{document:sample});assert.equal(r.status,201);let p=await json(r);
  assert.equal((await req('/admin/plugins','POST',{document:sample})).status,409);
  assert.deepEqual((await json(await req('/plugins','GET',undefined,'catalog'))).plugins,[]);
  const changes=await Promise.all([req('/admin/plugins/test-plugin','PUT',{revision:p.revision,document:{...sample,description:'Changed description'}}),req('/admin/plugins/test-plugin','PUT',{revision:p.revision,document:{...sample,description:'Other description'}})]);
  assert.deepEqual(changes.map((r)=>r.status).sort(),[200,409]);
  p=await json(await req('/admin/plugins/test-plugin'));
  r=await req('/admin/plugins/test-plugin/publish','POST',{revision:p.revision});assert.equal(r.status,200);p=await json(r);
  assert.equal(p.publishedVersion,'1.0.0');
  assert.deepEqual((await json(await req('/plugins','GET',undefined,'none'))).plugins,[]);
  assert.equal((await req('/plugins/test-plugin/releases/1.0.0/package','GET',undefined,'none')).status,404);
  const catalog=await json(await req('/plugins','GET',undefined,'catalog'));assert.equal(catalog.plugins.length,1);
  const downloaded=await (await req('/plugins/test-plugin/releases/1.0.0/package','GET',undefined,'catalog')).text();
  assert.equal(createHash('sha256').update(downloaded).digest('hex'),catalog.plugins[0].sha256);
  p=await json(await req('/admin/plugins/test-plugin','PUT',{revision:p.revision,document:{...sample,description:'Edited draft only'}}));
  assert.equal(await (await req('/plugins/test-plugin/releases/1.0.0/package','GET',undefined,'catalog')).text(),downloaded);
  assert.equal((await req('/admin/plugins/test-plugin/publish','POST',{revision:p.revision})).status,409);
  p=await json(await req('/admin/plugins/test-plugin','DELETE',{revision:p.revision}));assert.equal(p.archived,true);
  assert.equal((await req('/plugins/test-plugin/releases/1.0.0/package','GET',undefined,'catalog')).status,404);
  p=await json(await req('/admin/plugins/test-plugin/restore','POST',{revision:p.revision}));assert.equal(p.archived,false);
  assert.equal((await req('/admin/plugins/test-plugin/revoke','POST',{version:'1.0.0'})).status,200);
  assert.equal((await req('/plugins/test-plugin/releases/1.0.0/package','GET',undefined,'catalog')).status,410);
  assert.deepEqual((await json(await req('/plugins','GET',undefined,'catalog'))).plugins,[]);
  const events=(await json(await req('/admin/audit'))).events;
  assert.ok(events.some((e)=>e.action==='revoke'));assert.ok(events.some((e)=>e.action==='publish'));assert.ok(events.some((e)=>e.action==='archive'));
});
test('starter packages have unique valid identities, server URLs and skills', () => {
  assert.ok(starters.length >= 16);
  assert.equal(new Set(starters.map(p => p.name)).size, starters.length);
  for (const starter of starters) {
    const validated = pluginDocument.parse(starter);
    assert.equal(validated.visibility, 'private');
    assert.equal(validated.version, '1.0.0');
    assert.ok(validated.authentication);
    assert.ok(validated.skills.length > 0);
    for (const server of Object.values(validated.mcpServers)) assert.equal(new URL(server.url!).protocol, 'https:');
    const generated = JSON.parse(packageText(validated));
    assert.equal(JSON.parse(generated.files['plugin.json']).name, starter.name);
    for (const skill of starter.skills) assert.ok(generated.files[`skills/${skill.name}/SKILL.md`]);
  }
});
test('starter import is idempotent and produces only private drafts', async () => {
  await req('/admin/seed','POST',{});const first=await json(await req('/admin/plugins'));
  const github = first.plugins.find(p => p.name === 'github')!;
  assert.equal((await req('/admin/plugins/github','PUT',{revision:github.revision,document:{...github.draft,description:'Owner custom description'}})).status,200);
  await req('/admin/seed','POST',{});const second=await json(await req('/admin/plugins'));
  assert.equal(first.plugins.length,second.plugins.length);
  assert.equal(second.plugins.find(p => p.name === 'github')?.draft.description,'Owner custom description');
  for (const starter of starters) assert.ok(second.plugins.some(p => p.name === starter.name));
  for (const p of second.plugins.filter((p)=>p.name!=='test-plugin')) {assert.equal(p.draft.visibility,'private');assert.equal(p.publishedVersion,null);}
  const docs=second.plugins.find(p=>p.name==='cloudflare-docs')!;
  assert.equal((await req('/admin/plugins/cloudflare-docs/publish','POST',{revision:docs.revision})).status,200);
  const catalog=await json(await req('/plugins','GET',undefined,'catalog'));
  assert.equal(catalog.plugins.find(p=>p.name==='cloudflare-docs')?.authentication,'none');
  const exported=await (await req('/admin/export')).text();
  assert.ok(!exported.includes(process.env.PLUGIN_ADMIN_KEY!));assert.ok(!exported.includes(process.env.PLUGIN_SESSION_SECRET!));
});
test('D1 adapter uses Cloudflare query transport with bound parameters', async () => {
  const { DatabaseSync } = await import('node:sqlite');
  const { database } = await import('../../lib/plugin-platform/database');
  const sqlite = new DatabaseSync(':memory:');
  const originalFetch = globalThis.fetch;
  const remoteToken = 'test-only-cloudflare-d1-api-token';
  process.env.CLOUDFLARE_ACCOUNT_ID = 'a'.repeat(32);
  process.env.PLUGIN_D1_DATABASE_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  process.env.CLOUDFLARE_D1_API_TOKEN = remoteToken;
  let calls = 0;
  globalThis.fetch = async (input, init) => {
    calls++;
    assert.equal(String(input),`https://api.cloudflare.com/client/v4/accounts/${'a'.repeat(32)}/d1/database/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/query`);
    assert.equal(new Headers(init?.headers).get('authorization'),`Bearer ${remoteToken}`);
    const query = JSON.parse(String(init?.body));
    const rows = sqlite.prepare(query.sql).all(...query.params);
    return Response.json({success:true,result:[{success:true,results:rows}]});
  };
  try {
    const db = await database();
    const rows = await db.query('SELECT ? AS value', ["bound ' value"]);
    assert.equal(rows[0].value,"bound ' value");
    assert.ok(calls>=7);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.CLOUDFLARE_ACCOUNT_ID; delete process.env.PLUGIN_D1_DATABASE_ID; delete process.env.CLOUDFLARE_D1_API_TOKEN;
    sqlite.close();
  }
});

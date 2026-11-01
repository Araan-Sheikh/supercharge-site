import { z, ZodError } from 'zod';
import { cookie, isAdmin, login, privateAccess, requireAdmin } from './auth';
import { pluginDocument, slug, version } from './schema';
import * as store from './store';
import { starters } from './starters';
import { openapi } from './openapi';
const revisionSchema = z.number().int().positive();
async function body(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new store.PlatformError(415, 'Send application/json');
  const reader = request.body?.getReader(); if (!reader) throw new store.PlatformError(400, 'JSON body required');
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 1000000) { await reader.cancel(); throw new store.PlatformError(413, 'Request exceeds 1 MB'); } chunks.push(value); }
  try { const bytes = Buffer.concat(chunks); const value = JSON.parse(bytes.toString()); if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error(); return value; } catch { throw new store.PlatformError(400, 'Invalid JSON object'); }
}
function json(data: unknown, status = 200, extra: Record<string, string> = {}) { return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra } }); }
export async function handlePluginApi(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url), prefix = '/api/plugins/v1';
    const segments = url.pathname.slice(prefix.length).split('/').filter(Boolean).map(decodeURIComponent);
    const [area, name, operation, releaseVersion, download] = segments;
    if (area === 'openapi.json' && request.method === 'GET') return json(openapi);
    if (area === 'health' && request.method === 'GET') return json({ service: 'supercharge-plugin-platform', version: 1 });
    if (area === 'admin') {
      if (name === 'session') {
        if (request.method === 'GET') return json({ authenticated: isAdmin(request) });
        if (request.method === 'POST') { const input = await body(request); const key = z.string().min(1).parse(input.key); return json({ authenticated: true }, 200, { 'Set-Cookie': await login(request, key) }); }
        if (request.method === 'DELETE') { requireAdmin(request); return json({ authenticated: false }, 200, { 'Set-Cookie': cookie(request, '', 0) }); }
      }
      requireAdmin(request);
      if (name === 'audit' && request.method === 'GET') return json({ events: await store.audit() });
      if (name === 'export' && request.method === 'GET') {
        const plugins = await store.entries();
        return json({ format: 'supercharge-catalog-export-v1', exportedAt: Date.now(), plugins: await Promise.all(plugins.map(async (p) => ({ ...p, releases: await store.releases(p.name) }))) }, 200, { 'Content-Disposition': 'attachment; filename="supercharge-plugin-catalog.json"' });
      }
      if (name === 'seed' && request.method === 'POST') {
        const existing = new Set((await store.entries()).map((p) => p.name));
        for (const d of starters) if (!existing.has(d.name)) await store.create(pluginDocument.parse(d));
        return json({ plugins: await store.entries() });
      }
      if (name === 'plugins') {
        const pluginName = operation ? slug.parse(operation) : undefined;
        if (!pluginName && request.method === 'GET') return json({ plugins: await store.entries() });
        if (!pluginName && request.method === 'POST') return json(await store.create(pluginDocument.parse((await body(request)).document)), 201);
        if (pluginName && segments.length === 3) {
          if (request.method === 'GET') return json({ ...await store.entry(pluginName), releases: await store.releases(pluginName) });
          const input = await body(request), revision = revisionSchema.parse(input.revision);
          if (request.method === 'PUT') return json(await store.update(pluginName, revision, pluginDocument.parse(input.document)));
          if (request.method === 'DELETE') return json(await store.archive(pluginName, revision));
        }
        if (pluginName && request.method === 'POST') {
          const input = await body(request);
          if (releaseVersion === 'publish') return json(await store.publish(pluginName, revisionSchema.parse(input.revision)));
          if (releaseVersion === 'restore') return json(await store.archive(pluginName, revisionSchema.parse(input.revision), false));
          if (releaseVersion === 'revoke') { await store.revoke(pluginName, version.parse(input.version)); return json({ revoked: true }); }
        }
      }
    }
    const privateRead = privateAccess(request);
    if (request.headers.has('authorization') && !privateRead) throw new store.PlatformError(401, 'Invalid catalog read token');
    if (area === 'plugins' && request.method === 'GET') {
      if (!name && segments.length === 1) return json({ plugins: await store.catalog(privateRead) });
      const pluginName = slug.parse(name);
      if (operation === 'releases' && releaseVersion) {
        const r = await store.release(pluginName, version.parse(releaseVersion), privateRead);
        if (download === 'package' && segments.length === 5) return new Response(r.package, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', ETag: `"${r.metadata.sha256}"` } });
        if (segments.length === 4) return json(r.metadata);
      }
    }
    return json({ error: 'Endpoint not found' }, 404);
  } catch (e) {
    if (e instanceof ZodError) return json({ error: e.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') }, 400);
    if (e instanceof store.PlatformError) return json({ error: e.message }, e.status);
    console.error('Plugin API operation failed', e instanceof Error ? e.name : 'Unknown error');
    return json({ error: 'The plugin service could not complete this request. Check server configuration and retry.' }, 500);
  }
}

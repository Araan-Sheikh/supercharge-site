import assert from 'node:assert/strict';

// Run against a production server: npm run build && npm start
// SEO_BASE_URL can target a preview deployment instead of localhost.
const base = process.env.SEO_BASE_URL || 'http://localhost:3000';
const canonicalOrigin = 'https://www.superchargeai.in';
async function get(path) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, `${path} must return 200`);
  return { response, html: await response.text() };
}
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(match => [match[1], match[2]]));
}
function metadata(html) {
  return [...html.matchAll(/<meta\b[^>]*>/g)].map(match => attributes(match[0]));
}
const { html: robots } = await get('/robots.txt');
assert.ok(robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`));
const { html: sitemap } = await get('/sitemap.xml');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
assert.ok(urls.length > 4, 'Sitemap must include documentation');
assert.equal(new Set(urls).size, urls.length);
for (const url of urls) {
  assert.equal(new URL(url).origin, canonicalOrigin);
  const path = new URL(url).pathname;
  assert.ok(!/^\/(admin|api|donate\/result|docs-md)(\/|$)/.test(path));
  const { html } = await get(path);
  const links = [...html.matchAll(/<link\b[^>]*>/g)].map(match => attributes(match[0]));
  assert.deepEqual(links.filter(link => link.rel === 'canonical').map(link => new URL(link.href).href), [url], `${path}: canonical`);
  const meta = metadata(html);
  assert.ok(meta.some(item => item.name === 'description' && item.content.length > 20), `${path}: description`);
  assert.ok(meta.some(item => item.property === 'og:url' && new URL(item.content).href === url), `${path}: OG URL`);
  assert.ok(meta.some(item => item.name === 'twitter:card' && item.content === 'summary_large_image'));
  assert.ok(!meta.some(item => /^(robots|googlebot)$/.test(item.name) && item.content.includes('noindex')), `${path}: indexable`);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(match => JSON.parse(match[1]));
  if (path === '/') {
    assert.deepEqual(schemas[0]['@graph'].map(node => node['@type']), ['Organization', 'WebSite', 'SoftwareApplication']);
  } else if (path.startsWith('/docs')) {
    assert.ok(schemas.some(schema => schema['@type'] === 'BreadcrumbList'));
  }
}
for (const path of ['/admin', '/admin/plugins', '/donate/result?status=success', '/docs-md/install', '/llms-full.txt']) {
  const { response, html } = await get(path);
  assert.ok(response.headers.get('x-robots-tag')?.includes('noindex'), `${path}: noindex header`);
  if (!path.startsWith('/docs-md') && !path.endsWith('.txt')) {
    assert.ok(metadata(html).some(item => item.name === 'robots' && item.content.includes('noindex')));
  }
}
for (const path of ['/og/site', '/og/docs/install/image.png']) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200);
  assert.ok(response.headers.get('content-type')?.startsWith('image/png'));
  const image = new DataView(await response.arrayBuffer());
  assert.equal(image.getUint32(16), 1200);
  assert.equal(image.getUint32(20), 630);
}
const missing = await fetch(new URL('/does-not-exist-seo-check', base));
assert.equal(missing.status, 404);
console.log(`SEO checks passed: ${urls.length} canonical pages, sitemap, robots, structured data, private-page exclusion, 404, and social images.`);

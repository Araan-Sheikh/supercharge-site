import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { database } from './database';
import { PlatformError } from './store';
const COOKIE = 'supercharge_plugin_admin';
function equal(a: string, b: string) { return timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest()); }
function configured() { const key = process.env.PLUGIN_ADMIN_KEY, session = process.env.PLUGIN_SESSION_SECRET; if (!key || key.length < 32 || !session || session.length < 32) throw new PlatformError(503, 'Set PLUGIN_ADMIN_KEY and PLUGIN_SESSION_SECRET to separate random values of at least 32 characters on the site server'); return { key, session }; }
export function origin(request: Request) {
  const raw = process.env.PLUGIN_PUBLIC_ORIGIN || new URL(request.url).origin;
  const u = new URL(raw);
  if (u.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(u.hostname)) throw new PlatformError(503, 'Configure an HTTPS PLUGIN_PUBLIC_ORIGIN');
  return u.origin;
}
export function sameOrigin(request: Request) { if (request.headers.get('origin') !== origin(request)) throw new PlatformError(403, 'Cross-origin admin requests are not allowed'); }
function bearerAdmin(request: Request, key: string) { const bearer = request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1]; return !!bearer && equal(bearer, key); }
export function isAdmin(request: Request): boolean {
  const { key, session } = configured();
  if (bearerAdmin(request, key)) return true;
  const raw = request.headers.get('cookie')?.split(';').map((s) => s.trim()).find((s) => s.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!raw || raw.length > 1024) return false;
  const [payload, signature, extra] = raw.split('.');
  if (!payload || !signature || extra) return false;
  if (!equal(signature, createHmac('sha256', session).update(payload).digest('base64url'))) return false;
  try { const data = JSON.parse(Buffer.from(payload, 'base64url').toString()); return typeof data.exp === 'number' && data.exp > Date.now() && data.exp < Date.now() + 9 * 60 * 60 * 1000; } catch { return false; }
}
export function requireAdmin(request: Request) {
  if (!isAdmin(request)) throw new PlatformError(401, 'Sign in with your administrator access key');
  if (!['GET', 'HEAD'].includes(request.method) && !bearerAdmin(request, configured().key)) sameOrigin(request);
}
export function privateAccess(request: Request) {
  const token = process.env.PLUGIN_CATALOG_READ_TOKEN;
  const bearer = request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (token && token.length >= 32 && bearer && equal(bearer, token)) return true;
  try { return isAdmin(request); } catch { return false; }
}
export async function login(request: Request, key: string) {
  sameOrigin(request);
  const config = configured();
  const db = await database();
  await db.query('CREATE TABLE IF NOT EXISTS plugin_login_attempts (bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL)');
  const now = Date.now(), expires = Math.floor(now / 600000) * 600000 + 600000;
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || 'site';
  const bucket = createHmac('sha256', config.session).update(`${ip}:${expires}`).digest('hex');
  await db.query('DELETE FROM plugin_login_attempts WHERE expires < ?', [now]);
  const rows = await db.query('INSERT INTO plugin_login_attempts(bucket,count,expires) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count', [bucket, expires]);
  if (Number(rows[0]?.count) > 10) throw new PlatformError(429, 'Too many sign-in attempts; try again in ten minutes');
  if (!equal(key, config.key)) throw new PlatformError(401, 'Invalid administrator access key');
  const payload = Buffer.from(JSON.stringify({ exp: now + 8 * 60 * 60 * 1000, nonce: randomBytes(16).toString('hex') })).toString('base64url');
  const signature = createHmac('sha256', config.session).update(payload).digest('base64url');
  return cookie(request, `${payload}.${signature}`, 8 * 60 * 60);
}
export function cookie(request: Request, value: string, age: number) { return `${COOKIE}=${value}; Path=/api/plugins/v1; HttpOnly; SameSite=Strict; Max-Age=${age}${origin(request).startsWith('https:') ? '; Secure' : ''}`; }

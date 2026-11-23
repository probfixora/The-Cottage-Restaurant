// Admin login: password check and signed session tokens (JWT, HS256)
// using the Web Crypto API built into Cloudflare Workers.
import { HttpError } from './http.js';

const enc = new TextEncoder();
const TOKEN_HOURS = 12;

export function adminEnabled(env) {
  const pw = env.ADMIN_PASSWORD || '';
  const secret = env.JWT_SECRET || '';
  return pw.length >= 10 && secret.length >= 24;
}

const NOT_SET_UP =
  'Admin login is not set up yet. Add ADMIN_PASSWORD and JWT_SECRET as secrets on the Cloudflare Worker.';

async function sha256(text) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(text)));
}

/** Constant-time comparison of the typed password with the stored one. */
export async function passwordMatches(env, input) {
  if (!adminEnabled(env)) return false;
  const [a, b] = await Promise.all([sha256(String(input ?? '')), sha256(env.ADMIN_PASSWORD)]);
  return crypto.subtle.timingSafeEqual(a, b);
}

const b64url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (s) => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

function hmacKey(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function issueToken(env) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const payload = b64url(enc.encode(JSON.stringify({ role: 'admin', iat: now, exp: now + TOKEN_HOURS * 3600 })));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(env.JWT_SECRET), enc.encode(`${header}.${payload}`));
  return `${header}.${payload}.${b64url(sig)}`;
}

/** Throws HttpError unless the request carries a valid admin token. */
export async function requireAdmin(request, env) {
  if (!adminEnabled(env)) throw new HttpError(503, NOT_SET_UP);
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const parts = token.split('.');
  const expired = new HttpError(401, 'Your session has ended. Please log in again.');
  if (parts.length !== 3) throw expired;
  try {
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(env.JWT_SECRET), fromB64url(parts[2]), enc.encode(`${parts[0]}.${parts[1]}`));
    if (!ok) throw expired;
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(parts[1])));
    if (payload.role !== 'admin' || !payload.exp || payload.exp < Date.now() / 1000) throw expired;
  } catch {
    throw expired;
  }
}

export { NOT_SET_UP };

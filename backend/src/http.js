// Small HTTP helpers for the Worker API.

export class HttpError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store',
};

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...SECURITY_HEADERS, ...extraHeaders },
  });
}

export function noContent() {
  return new Response(null, { status: 204, headers: SECURITY_HEADERS });
}

export function error(status, message, fields) {
  return json(fields ? { error: message, fields } : { error: message }, status);
}

/** Read a JSON body (max 20 KB). Throws HttpError on bad input. */
export async function readJson(request) {
  const type = request.headers.get('Content-Type') || '';
  if (!type.includes('application/json')) throw new HttpError(415, 'Please send JSON.');
  const text = await request.text();
  if (text.length > 20_000) throw new HttpError(413, 'That message is too long.');
  try {
    const data = JSON.parse(text || '{}');
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('not an object');
    return data;
  } catch {
    throw new HttpError(400, 'The request was not valid JSON.');
  }
}

/** Returns true when this visitor has gone over the limit. Skips quietly if the binding is missing. */
export async function isRateLimited(limiter, request, scope) {
  if (!limiter) return false;
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const { success } = await limiter.limit({ key: `${scope}:${ip}` });
  return !success;
}

/** Positive integer id from a URL segment, or null. */
export function toId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Routes the website calls: menu, table bookings, messages.
import { json, error, readJson, isRateLimited } from '../http.js';
import { toMenuItem } from '../db.js';
import { validateReservation, validateMessage } from '../validation.js';

const TOO_MANY = 'Too many requests from this device. Please wait a minute or call us.';

export async function handlePublic(request, env, path) {
  const { method } = request;

  if (path === '/health' && method === 'GET') return json({ ok: true });

  if (path === '/menu' && method === 'GET') {
    const { results } = await env.DB.prepare(
      `SELECT id, category, name, description, price, unit, is_signature, is_available, is_sample, sort_order
         FROM menu_items WHERE is_available = 1 ORDER BY category, sort_order, id`,
    ).all();
    const items = results.map(toMenuItem);
    const categories = { restaurant: [], bakery: [], sweets: [] };
    for (const item of items) categories[item.category]?.push(item);
    return json({ categories, hasSamples: items.some((i) => i.is_sample) }, 200, { 'Cache-Control': 'public, max-age=60' });
  }

  if (path === '/reservations' && method === 'POST') {
    if (await isRateLimited(env.FORM_LIMITER, request, 'form')) return error(429, TOO_MANY);
    const body = await readJson(request);
    if (body.website) return json({ ok: true }, 201); // bot filled the hidden field: pretend success
    const { data, fields } = validateReservation(body);
    if (fields) return error(422, 'Please check the highlighted fields.', fields);
    const res = await env.DB.prepare(
      `INSERT INTO reservations (name, phone, email, date, time, guests, occasion, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(data.name, data.phone, data.email, data.date, data.time, data.guests, data.occasion, data.notes)
      .run();
    return json({ ok: true, id: res.meta.last_row_id }, 201);
  }

  if (path === '/messages' && method === 'POST') {
    if (await isRateLimited(env.FORM_LIMITER, request, 'form')) return error(429, TOO_MANY);
    const body = await readJson(request);
    if (body.website) return json({ ok: true }, 201);
    const { data, fields } = validateMessage(body);
    if (fields) return error(422, 'Please check the highlighted fields.', fields);
    const res = await env.DB.prepare(`INSERT INTO messages (name, phone, email, topic, message) VALUES (?, ?, ?, ?, ?)`)
      .bind(data.name, data.phone, data.email, data.topic, data.message)
      .run();
    return json({ ok: true, id: res.meta.last_row_id }, 201);
  }

  return null; // not a public route
}

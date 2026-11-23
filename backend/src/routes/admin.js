// Staff panel routes: login, bookings, messages, menu editing.
import { json, error, noContent, readJson, isRateLimited, toId } from '../http.js';
import { toMenuItem } from '../db.js';
import { adminEnabled, passwordMatches, issueToken, requireAdmin, NOT_SET_UP } from '../auth.js';
import { validateMenuItem, RES_STATUSES, MSG_STATUSES } from '../validation.js';

const IST_TODAY = `date('now','+330 minutes')`;

export async function handleAdmin(request, env, path, url) {
  const { method } = request;
  const db = env.DB;

  /* ---------- login (no token needed) ---------- */
  if (path === '/login' && method === 'POST') {
    if (!adminEnabled(env)) return error(503, NOT_SET_UP);
    if (await isRateLimited(env.LOGIN_LIMITER, request, 'login')) return error(429, 'Too many login attempts. Try again in a minute.');
    const body = await readJson(request);
    if (!(await passwordMatches(env, body.password))) return error(401, 'That password is not correct.');
    return json({ token: await issueToken(env) });
  }

  await requireAdmin(request, env);

  /* ---------- overview ---------- */
  if (path === '/summary' && method === 'GET') {
    const count = (sql) => db.prepare(sql).first('n');
    const [newReservations, upcoming, newMessages, menuItems, sampleItems] = await Promise.all([
      count(`SELECT COUNT(*) AS n FROM reservations WHERE status = 'new'`),
      count(`SELECT COUNT(*) AS n FROM reservations WHERE status IN ('new','confirmed') AND date >= ${IST_TODAY}`),
      count(`SELECT COUNT(*) AS n FROM messages WHERE status = 'new'`),
      count(`SELECT COUNT(*) AS n FROM menu_items`),
      count(`SELECT COUNT(*) AS n FROM menu_items WHERE is_sample = 1`),
    ]);
    return json({ newReservations, upcoming, newMessages, menuItems, sampleItems, emailAlerts: false });
  }

  /* ---------- reservations ---------- */
  if (path === '/reservations' && method === 'GET') {
    const status = url.searchParams.get('status');
    const when = url.searchParams.get('when');
    const where = [];
    const binds = [];
    if (status && status !== 'all' && RES_STATUSES.includes(status)) {
      where.push('status = ?');
      binds.push(status);
    }
    if (when === 'upcoming') where.push(`date >= ${IST_TODAY}`);
    if (when === 'past') where.push(`date < ${IST_TODAY}`);
    const order = when === 'past' ? 'date DESC, time DESC' : 'date ASC, time ASC';
    const sql = `SELECT * FROM reservations ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${order} LIMIT 500`;
    const { results } = await db.prepare(sql).bind(...binds).all();
    return json(results);
  }

  let m = path.match(/^\/reservations\/([^/]+)$/);
  if (m) {
    const id = toId(m[1]);
    if (!id) return error(400, 'Invalid id.');
    if (method === 'PATCH') {
      const { status } = await readJson(request);
      if (!RES_STATUSES.includes(status)) return error(422, 'Unknown status.');
      const res = await db.prepare('UPDATE reservations SET status = ? WHERE id = ?').bind(status, id).run();
      if (!res.meta.changes) return error(404, 'Booking not found.');
      return json(await db.prepare('SELECT * FROM reservations WHERE id = ?').bind(id).first());
    }
    if (method === 'DELETE') {
      const res = await db.prepare('DELETE FROM reservations WHERE id = ?').bind(id).run();
      if (!res.meta.changes) return error(404, 'Booking not found.');
      return noContent();
    }
  }

  /* ---------- messages ---------- */
  if (path === '/messages' && method === 'GET') {
    const status = url.searchParams.get('status');
    const stmt =
      status && status !== 'all' && MSG_STATUSES.includes(status)
        ? db.prepare('SELECT * FROM messages WHERE status = ? ORDER BY created_at DESC LIMIT 500').bind(status)
        : db.prepare('SELECT * FROM messages ORDER BY created_at DESC LIMIT 500');
    const { results } = await stmt.all();
    return json(results);
  }

  m = path.match(/^\/messages\/([^/]+)$/);
  if (m) {
    const id = toId(m[1]);
    if (!id) return error(400, 'Invalid id.');
    if (method === 'PATCH') {
      const { status } = await readJson(request);
      if (!MSG_STATUSES.includes(status)) return error(422, 'Unknown status.');
      const res = await db.prepare('UPDATE messages SET status = ? WHERE id = ?').bind(status, id).run();
      if (!res.meta.changes) return error(404, 'Message not found.');
      return json(await db.prepare('SELECT * FROM messages WHERE id = ?').bind(id).first());
    }
    if (method === 'DELETE') {
      const res = await db.prepare('DELETE FROM messages WHERE id = ?').bind(id).run();
      if (!res.meta.changes) return error(404, 'Message not found.');
      return noContent();
    }
  }

  /* ---------- menu ---------- */
  if (path === '/menu' && method === 'GET') {
    const { results } = await db.prepare('SELECT * FROM menu_items ORDER BY category, sort_order, id').all();
    return json(results.map(toMenuItem));
  }

  if (path === '/menu' && method === 'POST') {
    const { data, fields } = validateMenuItem(await readJson(request));
    if (fields) return error(422, 'Please check the highlighted fields.', fields);
    const row = await db
      .prepare(
        `INSERT INTO menu_items (category, name, description, price, unit, is_signature, is_available, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      )
      .bind(data.category, data.name, data.description, data.price, data.unit, data.is_signature, data.is_available, data.sort_order)
      .first();
    return json(toMenuItem(row), 201);
  }

  m = path.match(/^\/menu\/([^/]+)$/);
  if (m) {
    const id = toId(m[1]);
    if (!id) return error(400, 'Invalid id.');
    if (method === 'PUT') {
      const { data, fields } = validateMenuItem(await readJson(request));
      if (fields) return error(422, 'Please check the highlighted fields.', fields);
      const row = await db
        .prepare(
          `UPDATE menu_items SET category = ?, name = ?, description = ?, price = ?, unit = ?, is_signature = ?,
             is_available = ?, sort_order = ?, is_sample = 0, updated_at = datetime('now')
           WHERE id = ? RETURNING *`,
        )
        .bind(data.category, data.name, data.description, data.price, data.unit, data.is_signature, data.is_available, data.sort_order, id)
        .first();
      if (!row) return error(404, 'Menu item not found.');
      return json(toMenuItem(row));
    }
    if (method === 'DELETE') {
      const res = await db.prepare('DELETE FROM menu_items WHERE id = ?').bind(id).run();
      if (!res.meta.changes) return error(404, 'Menu item not found.');
      return noContent();
    }
  }

  return error(404, 'Not found.');
}

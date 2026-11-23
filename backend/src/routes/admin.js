// Admin panel routes: login, bookings, messages, menu editing.
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { db, toMenuItem } from '../db.js';
import { adminEnabled } from '../config.js';
import { passwordMatches, issueToken, requireAdmin } from '../auth.js';
import { menuItemSchema, statusSchemas, fieldErrors } from '../validation.js';
import { emailAlertsEnabled } from '../notify.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 6,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

router.post('/login', loginLimiter, (req, res) => {
  if (!adminEnabled) {
    return res.status(503).json({ error: 'Admin login is not set up. Add ADMIN_PASSWORD and JWT_SECRET to backend/.env.' });
  }
  if (!passwordMatches(req.body?.password ?? '')) {
    return res.status(401).json({ error: 'That password is not correct.' });
  }
  res.json({ token: issueToken() });
});

router.use(requireAdmin);

const idParam = (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Invalid id.' });
    return null;
  }
  return id;
};

/* ---------- overview ---------- */
router.get('/summary', (_req, res) => {
  const one = (sql) => db.prepare(sql).get().n;
  res.json({
    newReservations: one(`SELECT COUNT(*) n FROM reservations WHERE status = 'new'`),
    upcoming: one(`SELECT COUNT(*) n FROM reservations WHERE status IN ('new','confirmed') AND date >= date('now','+330 minutes')`),
    newMessages: one(`SELECT COUNT(*) n FROM messages WHERE status = 'new'`),
    menuItems: one(`SELECT COUNT(*) n FROM menu_items`),
    sampleItems: one(`SELECT COUNT(*) n FROM menu_items WHERE is_sample = 1`),
    emailAlerts: emailAlertsEnabled,
  });
});

/* ---------- reservations ---------- */
router.get('/reservations', (req, res) => {
  const { status, when } = req.query;
  const where = [];
  const params = {};
  if (typeof status === 'string' && status !== 'all') {
    where.push('status = $status');
    params.status = status;
  }
  if (when === 'upcoming') where.push(`date >= date('now','+330 minutes')`);
  if (when === 'past') where.push(`date < date('now','+330 minutes')`);
  const order = when === 'past' ? 'date DESC, time DESC' : 'date ASC, time ASC';
  const rows = db
    .prepare(`SELECT * FROM reservations ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${order} LIMIT 500`)
    .all(params);
  res.json(rows);
});

router.patch('/reservations/:id', (req, res) => {
  const id = idParam(req, res);
  if (!id) return;
  const parsed = statusSchemas.reservation.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(422).json({ error: 'Unknown status.' });
  const info = db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(parsed.data.status, id);
  if (!info.changes) return res.status(404).json({ error: 'Booking not found.' });
  res.json(db.prepare('SELECT * FROM reservations WHERE id = ?').get(id));
});

router.delete('/reservations/:id', (req, res) => {
  const id = idParam(req, res);
  if (!id) return;
  const info = db.prepare('DELETE FROM reservations WHERE id = ?').run(id);
  if (!info.changes) return res.status(404).json({ error: 'Booking not found.' });
  res.status(204).end();
});

/* ---------- messages ---------- */
router.get('/messages', (req, res) => {
  const { status } = req.query;
  const rows =
    typeof status === 'string' && status !== 'all'
      ? db.prepare('SELECT * FROM messages WHERE status = ? ORDER BY created_at DESC LIMIT 500').all(status)
      : db.prepare('SELECT * FROM messages ORDER BY created_at DESC LIMIT 500').all();
  res.json(rows);
});

router.patch('/messages/:id', (req, res) => {
  const id = idParam(req, res);
  if (!id) return;
  const parsed = statusSchemas.message.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(422).json({ error: 'Unknown status.' });
  const info = db.prepare('UPDATE messages SET status = ? WHERE id = ?').run(parsed.data.status, id);
  if (!info.changes) return res.status(404).json({ error: 'Message not found.' });
  res.json(db.prepare('SELECT * FROM messages WHERE id = ?').get(id));
});

router.delete('/messages/:id', (req, res) => {
  const id = idParam(req, res);
  if (!id) return;
  const info = db.prepare('DELETE FROM messages WHERE id = ?').run(id);
  if (!info.changes) return res.status(404).json({ error: 'Message not found.' });
  res.status(204).end();
});

/* ---------- menu ---------- */
router.get('/menu', (_req, res) => {
  res.json(db.prepare('SELECT * FROM menu_items ORDER BY category, sort_order, id').all().map(toMenuItem));
});

const menuParams = (d) => ({
  category: d.category,
  name: d.name,
  description: d.description,
  price: d.price,
  unit: d.unit,
  is_signature: d.is_signature ? 1 : 0,
  is_available: d.is_available ? 1 : 0,
  sort_order: d.sort_order,
});

router.post('/menu', (req, res) => {
  const parsed = menuItemSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(422).json({ error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) });
  const info = db
    .prepare(
      `INSERT INTO menu_items (category, name, description, price, unit, is_signature, is_available, sort_order)
       VALUES ($category, $name, $description, $price, $unit, $is_signature, $is_available, $sort_order)`,
    )
    .run(menuParams(parsed.data));
  res.status(201).json(toMenuItem(db.prepare('SELECT * FROM menu_items WHERE id = ?').get(info.lastInsertRowid)));
});

router.put('/menu/:id', (req, res) => {
  const id = idParam(req, res);
  if (!id) return;
  const parsed = menuItemSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(422).json({ error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) });
  const info = db
    .prepare(
      `UPDATE menu_items SET category = $category, name = $name, description = $description, price = $price,
         unit = $unit, is_signature = $is_signature, is_available = $is_available, sort_order = $sort_order,
         is_sample = 0, updated_at = datetime('now')
       WHERE id = $id`,
    )
    .run({ ...menuParams(parsed.data), id });
  if (!info.changes) return res.status(404).json({ error: 'Menu item not found.' });
  res.json(toMenuItem(db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id)));
});

router.delete('/menu/:id', (req, res) => {
  const id = idParam(req, res);
  if (!id) return;
  const info = db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
  if (!info.changes) return res.status(404).json({ error: 'Menu item not found.' });
  res.status(204).end();
});

export default router;

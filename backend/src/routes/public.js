// Routes the website calls: menu, table bookings, messages.
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { db, toMenuItem } from '../db.js';
import { reservationSchema, messageSchema, fieldErrors } from '../validation.js';
import { notifyReservation, notifyMessage } from '../notify.js';

const router = Router();

// Each visitor can send up to 8 forms per 15 minutes.
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests from this device. Please wait a few minutes or call us.' },
});

const menuQuery = db.prepare(
  `SELECT id, category, name, description, price, unit, is_signature, is_available, is_sample, sort_order
     FROM menu_items WHERE is_available = 1 ORDER BY category, sort_order, id`,
);

router.get('/health', (_req, res) => res.json({ ok: true }));

router.get('/menu', (_req, res) => {
  const items = menuQuery.all().map(toMenuItem);
  const grouped = { restaurant: [], bakery: [], sweets: [] };
  for (const item of items) grouped[item.category].push(item);
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ categories: grouped, hasSamples: items.some((i) => i.is_sample) });
});

const insertReservation = db.prepare(
  `INSERT INTO reservations (name, phone, email, date, time, guests, occasion, notes)
   VALUES ($name, $phone, $email, $date, $time, $guests, $occasion, $notes)`,
);

router.post('/reservations', formLimiter, (req, res) => {
  const parsed = reservationSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(422).json({ error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) });
  const { website, ...r } = parsed.data;
  if (website) return res.status(201).json({ ok: true }); // bot filled the hidden field: pretend success
  const info = insertReservation.run({ ...r, occasion: r.occasion === 'none' ? null : r.occasion });
  notifyReservation(r);
  res.status(201).json({ ok: true, id: Number(info.lastInsertRowid) });
});

const insertMessage = db.prepare(
  `INSERT INTO messages (name, phone, email, topic, message) VALUES ($name, $phone, $email, $topic, $message)`,
);

router.post('/messages', formLimiter, (req, res) => {
  const parsed = messageSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(422).json({ error: 'Please check the highlighted fields.', fields: fieldErrors(parsed.error) });
  const { website, ...m } = parsed.data;
  if (website) return res.status(201).json({ ok: true });
  const info = insertMessage.run({ ...m, phone: m.phone ?? null });
  notifyMessage(m);
  res.status(201).json({ ok: true, id: Number(info.lastInsertRowid) });
});

export default router;

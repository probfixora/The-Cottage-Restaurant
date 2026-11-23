// Input checking for every form. Each validator returns { data } or { fields }.

export const BOOKING_FIRST = '09:00';
export const BOOKING_LAST = '22:30';
export const MAX_GUESTS = 40;

const RES_OCCASIONS = ['none', 'birthday', 'anniversary', 'family', 'business', 'other'];
const MSG_TOPICS = ['general', 'cake', 'sweets', 'party', 'feedback'];
const CATEGORIES = ['restaurant', 'bakery', 'sweets'];
export const RES_STATUSES = ['new', 'confirmed', 'seated', 'cancelled'];
export const MSG_STATUSES = ['new', 'read', 'done'];

const str = (v) => (typeof v === 'string' ? v : v === undefined || v === null ? '' : String(v));
const clean = (v) => str(v).replace(/\s+/g, ' ').trim();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Indian mobile: 10 digits starting 6–9, optional +91 / 0. Returns "+91XXXXXXXXXX" or null. */
function normalisePhone(v) {
  const digits = str(v).replace(/[\s\-()]/g, '');
  if (!/^(?:\+?91|0)?[6-9]\d{9}$/.test(digits)) return null;
  return '+91' + digits.slice(-10);
}

function todayInIndia() {
  const now = new Date();
  return new Date(now.getTime() + 330 * 60000).toISOString().slice(0, 10);
}
function addDays(ymd, days) {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const isFilled = (body, key) => str(body[key]).trim() !== '';

export function validateReservation(body) {
  const f = {};
  const name = clean(body.name);
  if (name.length < 2) f.name = 'Please enter your name.';
  else if (name.length > 80) f.name = 'Name is too long.';

  const phone = normalisePhone(body.phone);
  if (!phone) f.phone = 'Enter a 10-digit mobile number, like 98765 43210.';

  const email = clean(body.email);
  if (email && (!EMAIL_RE.test(email) || email.length > 120)) f.email = 'That email address doesn’t look right.';

  const date = str(body.date);
  const today = todayInIndia();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) f.date = 'Please choose a date.';
  else if (date < today) f.date = 'Please choose today or a later date.';
  else if (date > addDays(today, 90)) f.date = 'We take bookings up to 90 days ahead.';

  const time = str(body.time);
  if (!/^\d{2}:\d{2}$/.test(time)) f.time = 'Please choose a time.';
  else if (time < BOOKING_FIRST || time > BOOKING_LAST) f.time = 'We take bookings from 9:00 AM to 10:30 PM.';

  const guests = Number(body.guests);
  if (!Number.isInteger(guests) || guests < 1) f.guests = 'At least 1 guest.';
  else if (guests > MAX_GUESTS) f.guests = `For more than ${MAX_GUESTS} guests, please call us.`;

  const occasion = isFilled(body, 'occasion') ? str(body.occasion) : 'none';
  if (!RES_OCCASIONS.includes(occasion)) f.occasion = 'Please choose an occasion from the list.';

  const notes = str(body.notes).trim();
  if (notes.length > 500) f.notes = 'Please keep this under 500 characters.';

  if (Object.keys(f).length) return { fields: f };
  return {
    data: {
      name, phone, email: email || null, date, time, guests,
      occasion: occasion === 'none' ? null : occasion,
      notes: notes || null,
    },
  };
}

export function validateMessage(body) {
  const f = {};
  const name = clean(body.name);
  if (name.length < 2) f.name = 'Please enter your name.';
  else if (name.length > 80) f.name = 'Name is too long.';

  let phone = null;
  if (isFilled(body, 'phone')) {
    phone = normalisePhone(body.phone);
    if (!phone) f.phone = 'Enter a 10-digit mobile number, like 98765 43210.';
  }
  const email = clean(body.email);
  if (email && (!EMAIL_RE.test(email) || email.length > 120)) f.email = 'That email address doesn’t look right.';
  if (!phone && !email && !f.phone) f.phone = 'Add a phone number or email so we can reply.';

  const topic = isFilled(body, 'topic') ? str(body.topic) : 'general';
  if (!MSG_TOPICS.includes(topic)) f.topic = 'Please choose a topic from the list.';

  const message = str(body.message).trim();
  if (message.length < 5) f.message = 'Please write a little more.';
  else if (message.length > 2000) f.message = 'Please keep it under 2000 characters.';

  if (Object.keys(f).length) return { fields: f };
  return { data: { name, phone, email: email || null, topic, message } };
}

const toBool = (v, fallback) => (v === undefined ? fallback : v === true || v === 'true' || v === 1 || v === '1' || v === 'on');

export function validateMenuItem(body) {
  const f = {};
  const category = str(body.category);
  if (!CATEGORIES.includes(category)) f.category = 'Choose a section.';

  const name = clean(body.name);
  if (name.length < 2) f.name = 'Name is required.';
  else if (name.length > 80) f.name = 'Name is too long.';

  const description = str(body.description).trim();
  if (description.length > 240) f.description = 'Please keep this under 240 characters.';

  let price = null;
  if (body.price !== undefined && body.price !== null && str(body.price).trim() !== '') {
    price = Number(body.price);
    if (!Number.isInteger(price) || price < 0 || price > 100000) f.price = 'Enter a whole number of rupees, like 320.';
  }

  const unit = clean(body.unit);
  if (unit.length > 30) f.unit = 'Keep the unit short, like "per plate".';

  const sortOrder = body.sort_order === undefined || body.sort_order === '' ? 0 : Number(body.sort_order);
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 9999) f.sort_order = 'Use a number from 0 to 9999.';

  if (Object.keys(f).length) return { fields: f };
  return {
    data: {
      category, name, description: description || null, price, unit: unit || null,
      is_signature: toBool(body.is_signature, false) ? 1 : 0,
      is_available: toBool(body.is_available, true) ? 1 : 0,
      sort_order: sortOrder,
    },
  };
}

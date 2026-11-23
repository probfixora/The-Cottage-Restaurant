import { z } from 'zod';

// Restaurant hours: 9:00 AM – 11:30 PM. Last table booking 10:30 PM.
export const BOOKING_FIRST = '09:00';
export const BOOKING_LAST = '22:30';
export const MAX_GUESTS = 40;

const clean = (s) => s.replace(/\s+/g, ' ').trim();

const name = z
  .string({ required_error: 'Please enter your name.' })
  .transform(clean)
  .pipe(z.string().min(2, 'Please enter your name.').max(80, 'Name is too long.'));

// Indian mobile numbers: 10 digits starting 6–9, optional +91 / 0 prefix.
const phone = z
  .string({ required_error: 'Please enter your phone number.' })
  .transform((s) => s.replace(/[\s\-()]/g, ''))
  .pipe(
    z
      .string()
      .regex(/^(?:\+?91|0)?[6-9]\d{9}$/, 'Enter a 10-digit mobile number, like 98765 43210.')
      .transform((s) => '+91' + s.slice(-10)),
  );

const email = z
  .string()
  .transform(clean)
  .pipe(z.union([z.literal(''), z.string().email('That email address doesn’t look right.').max(120)]))
  .optional()
  .transform((v) => v || null);

const optionalText = (max) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().max(max, `Please keep this under ${max} characters.`))
    .optional()
    .transform((v) => v || null);

function todayInIndia() {
  const now = new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000);
  return now.toISOString().slice(0, 10);
}

export const reservationSchema = z
  .object({
    name,
    phone,
    email,
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose a date.'),
    time: z.string().regex(/^\d{2}:\d{2}$/, 'Please choose a time.'),
    guests: z.coerce
      .number({ invalid_type_error: 'How many guests?' })
      .int()
      .min(1, 'At least 1 guest.')
      .max(MAX_GUESTS, `For more than ${MAX_GUESTS} guests, please call us.`),
    occasion: z.enum(['none', 'birthday', 'anniversary', 'family', 'business', 'other']).default('none'),
    notes: optionalText(500),
    website: z.string().max(0).optional(), // honeypot: real people leave this empty
  })
  .superRefine((v, ctx) => {
    const today = todayInIndia();
    if (v.date < today) ctx.addIssue({ path: ['date'], code: 'custom', message: 'Please choose today or a later date.' });
    const max = new Date(today);
    max.setDate(max.getDate() + 90);
    if (v.date > max.toISOString().slice(0, 10))
      ctx.addIssue({ path: ['date'], code: 'custom', message: 'We take bookings up to 90 days ahead.' });
    if (v.time < BOOKING_FIRST || v.time > BOOKING_LAST)
      ctx.addIssue({ path: ['time'], code: 'custom', message: 'We take bookings from 9:00 AM to 10:30 PM.' });
  });

export const messageSchema = z
  .object({
    name,
    phone: phone.optional().or(z.literal('').transform(() => undefined)),
    email,
    topic: z.enum(['general', 'cake', 'sweets', 'party', 'feedback']).default('general'),
    message: z
      .string({ required_error: 'Please write a message.' })
      .transform((s) => s.trim())
      .pipe(z.string().min(5, 'Please write a little more.').max(2000, 'Please keep it under 2000 characters.')),
    website: z.string().max(0).optional(),
  })
  .refine((v) => v.phone || v.email, {
    path: ['phone'],
    message: 'Add a phone number or email so we can reply.',
  });

export const menuItemSchema = z.object({
  category: z.enum(['restaurant', 'bakery', 'sweets']),
  name: z.string().transform(clean).pipe(z.string().min(2, 'Name is required.').max(80)),
  description: optionalText(240),
  price: z
    .union([z.coerce.number().int().min(0).max(100000), z.literal(''), z.null()])
    .optional()
    .transform((v) => (v === '' || v === undefined ? null : v)),
  unit: optionalText(30),
  is_signature: z.coerce.boolean().default(false),
  is_available: z.coerce.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});

export const statusSchemas = {
  reservation: z.object({ status: z.enum(['new', 'confirmed', 'seated', 'cancelled']) }),
  message: z.object({ status: z.enum(['new', 'read', 'done']) }),
};

/** Format zod errors as { field: message } for the form. */
export function fieldErrors(error) {
  const out = {};
  for (const issue of error.issues) {
    const key = issue.path[0] ?? 'form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

// Optional email alerts. Does nothing unless SMTP settings are in .env.
import nodemailer from 'nodemailer';
import { config } from './config.js';

const { smtp } = config;
const enabled = Boolean(smtp.host && smtp.user && smtp.pass && smtp.notify);

const transport = enabled
  ? nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.pass },
    })
  : null;

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function table(rows) {
  return `<table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${rows
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `<tr><td style="color:#555">${esc(k)}</td><td><b>${esc(v)}</b></td></tr>`)
    .join('')}</table>`;
}

/** Fire-and-forget: never blocks or fails the guest's request. */
function send(subject, html) {
  if (!transport) return;
  transport
    .sendMail({ from: `"The Cottage website" <${smtp.user}>`, to: smtp.notify, subject, html })
    .catch((err) => console.error('[notify] email failed:', err.message));
}

export function notifyReservation(r) {
  send(
    `New table request: ${r.name}, ${r.guests} guests, ${r.date} ${r.time}`,
    `<h2>New table request</h2>${table([
      ['Name', r.name], ['Phone', r.phone], ['Email', r.email], ['Date', r.date], ['Time', r.time],
      ['Guests', r.guests], ['Occasion', r.occasion], ['Notes', r.notes],
    ])}<p>Open the admin panel to confirm it.</p>`,
  );
}

export function notifyMessage(m) {
  send(
    `New message (${m.topic}) from ${m.name}`,
    `<h2>New message from the website</h2>${table([
      ['Name', m.name], ['Phone', m.phone], ['Email', m.email], ['Topic', m.topic], ['Message', m.message],
    ])}`,
  );
}

export const emailAlertsEnabled = enabled;

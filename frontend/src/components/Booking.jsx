import { useMemo, useState } from 'react';
import { CalendarCheck, MessageSquareText, Loader2, CheckCircle2, Phone } from 'lucide-react';
import { api } from '../lib/api.js';
import { site } from '../data/site.js';
import { scrollToTarget } from '../lib/scroll.js';
import Field from './Field.jsx';

/* ---------- helpers ---------- */
function istNow() {
  const now = new Date();
  return new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
}
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function timeSlots() {
  const out = [];
  for (let m = 9 * 60; m <= 22 * 60 + 30; m += 30) {
    const h = Math.floor(m / 60);
    const mm = String(m % 60).padStart(2, '0');
    const label = `${((h + 11) % 12) + 1}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
    out.push({ value: `${String(h).padStart(2, '0')}:${mm}`, label, minutes: m });
  }
  return out;
}
const SLOTS = timeSlots();

const formatDate = (s) =>
  new Date(`${s}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

/* ---------- the reservation form ---------- */
function ReservationForm() {
  const today = istNow();
  const minDate = ymd(today);
  const maxDate = ymd(new Date(today.getTime() + 90 * 86400000));

  const [values, setValues] = useState({ name: '', phone: '', date: minDate, time: '', guests: '2', occasion: 'none', notes: '', website: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [formError, setFormError] = useState('');

  const slots = useMemo(() => {
    if (values.date !== minDate) return SLOTS;
    const nowMin = today.getHours() * 60 + today.getMinutes() + 30; // at least 30 minutes ahead
    return SLOTS.filter((s) => s.minutes >= nowMin);
  }, [values.date, minDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  async function submit(e) {
    e.preventDefault();
    const local = {};
    if (values.name.trim().length < 2) local.name = 'Please enter your name.';
    if (values.phone.replace(/\D/g, '').length < 10) local.phone = 'Enter a 10-digit mobile number, like 98765 43210.';
    if (!values.time) local.time = 'Please choose a time.';
    if (Object.keys(local).length) {
      setErrors(local);
      document.getElementById(`res-${Object.keys(local)[0]}`)?.focus();
      return;
    }
    setStatus('sending');
    setFormError('');
    try {
      await api('/reservations', { method: 'POST', body: values });
      setStatus('done');
      requestAnimationFrame(() => scrollToTarget('#book'));
    } catch (err) {
      setStatus('error');
      setErrors(err.fields || {});
      setFormError(err.message);
    }
  }

  if (status === 'done') {
    return (
      <div className="form-done" role="status">
        <CheckCircle2 size={40} strokeWidth={1.5} aria-hidden="true" />
        <h3>Request sent</h3>
        <p>
          Table for {values.guests} on {formatDate(values.date)} at {SLOTS.find((s) => s.value === values.time)?.label}. We’ll
          call you on {values.phone} to confirm.
        </p>
        <button
          type="button"
          className="btn btn--sage"
          onClick={() => {
            setValues((v) => ({ ...v, time: '', notes: '' }));
            setStatus('idle');
          }}
        >
          Book another table
        </button>
      </div>
    );
  }

  const sending = status === 'sending';
  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="form__row">
        <Field id="res-name" label="Your name" error={errors.name}>
          {(p) => <input {...p} type="text" autoComplete="name" value={values.name} onChange={set('name')} />}
        </Field>
        <Field id="res-phone" label="Mobile number" error={errors.phone}>
          {(p) => <input {...p} type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" value={values.phone} onChange={set('phone')} />}
        </Field>
      </div>
      <div className="form__row form__row--3">
        <Field id="res-date" label="Date" error={errors.date}>
          {(p) => <input {...p} type="date" min={minDate} max={maxDate} value={values.date} onChange={set('date')} />}
        </Field>
        <Field id="res-time" label="Time" error={errors.time}>
          {(p) => (
            <select {...p} value={values.time} onChange={set('time')}>
              <option value="">{slots.length ? 'Choose a time' : 'No times left today'}</option>
              {slots.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field id="res-guests" label="Guests" error={errors.guests}>
          {(p) => (
            <select {...p} value={values.guests} onChange={set('guests')}>
              {Array.from({ length: 20 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i === 0 ? 'guest' : 'guests'}
                </option>
              ))}
              <option value="30">21–30 guests</option>
              <option value="40">31–40 guests</option>
            </select>
          )}
        </Field>
      </div>
      <Field id="res-occasion" label="Occasion (optional)" error={errors.occasion}>
        {(p) => (
          <select {...p} value={values.occasion} onChange={set('occasion')}>
            <option value="none">Just dinner</option>
            <option value="birthday">Birthday</option>
            <option value="anniversary">Anniversary</option>
            <option value="family">Family gathering</option>
            <option value="business">Business meal</option>
            <option value="other">Something else</option>
          </select>
        )}
      </Field>
      <Field id="res-notes" label="Anything we should know? (optional)" error={errors.notes} hint="Seating, a cake for the table, a high chair…">
        {(p) => <textarea {...p} rows={3} maxLength={500} value={values.notes} onChange={set('notes')} />}
      </Field>
      <div className="hp" aria-hidden="true">
        <label htmlFor="res-website">Leave this empty</label>
        <input id="res-website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
      </div>
      {formError && (
        <p className="form__error" role="alert">
          {formError}
        </p>
      )}
      <button type="submit" className="btn btn--brass btn--wide" disabled={sending}>
        {sending ? <Loader2 className="spin" size={18} aria-hidden="true" /> : <CalendarCheck size={18} aria-hidden="true" />}
        {sending ? 'Sending request…' : 'Request this table'}
      </button>
      <p className="form__small">We call every booking to confirm. No payment needed.</p>
    </form>
  );
}

/* ---------- the message form ---------- */
function MessageForm() {
  const [values, setValues] = useState({ name: '', phone: '', email: '', topic: 'cake', message: '', website: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [formError, setFormError] = useState('');

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  async function submit(e) {
    e.preventDefault();
    const local = {};
    if (values.name.trim().length < 2) local.name = 'Please enter your name.';
    if (!values.phone.trim() && !values.email.trim()) local.phone = 'Add a phone number or email so we can reply.';
    if (values.message.trim().length < 5) local.message = 'Please write a little more.';
    if (Object.keys(local).length) {
      setErrors(local);
      document.getElementById(`msg-${Object.keys(local)[0]}`)?.focus();
      return;
    }
    setStatus('sending');
    setFormError('');
    try {
      await api('/messages', { method: 'POST', body: values });
      setStatus('done');
      requestAnimationFrame(() => scrollToTarget('#book'));
    } catch (err) {
      setStatus('error');
      setErrors(err.fields || {});
      setFormError(err.message);
    }
  }

  if (status === 'done') {
    return (
      <div className="form-done" role="status">
        <CheckCircle2 size={40} strokeWidth={1.5} aria-hidden="true" />
        <h3>Message sent</h3>
        <p>Thank you, {values.name.split(' ')[0]}. We’ll get back to you soon.</p>
        <button
          type="button"
          className="btn btn--sage"
          onClick={() => {
            setValues((v) => ({ ...v, message: '' }));
            setStatus('idle');
          }}
        >
          Send another message
        </button>
      </div>
    );
  }

  const sending = status === 'sending';
  return (
    <form className="form" onSubmit={submit} noValidate>
      <Field id="msg-topic" label="What is it about?" error={errors.topic}>
        {(p) => (
          <select {...p} value={values.topic} onChange={set('topic')}>
            <option value="cake">Ordering a cake</option>
            <option value="sweets">Sweets or gift hampers</option>
            <option value="party">A party or large group</option>
            <option value="feedback">Feedback on a visit</option>
            <option value="general">Something else</option>
          </select>
        )}
      </Field>
      <Field id="msg-name" label="Your name" error={errors.name}>
        {(p) => <input {...p} type="text" autoComplete="name" value={values.name} onChange={set('name')} />}
      </Field>
      <div className="form__row">
        <Field id="msg-phone" label="Mobile number" error={errors.phone}>
          {(p) => <input {...p} type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" value={values.phone} onChange={set('phone')} />}
        </Field>
        <Field id="msg-email" label="Email (optional)" error={errors.email}>
          {(p) => <input {...p} type="email" autoComplete="email" value={values.email} onChange={set('email')} />}
        </Field>
      </div>
      <Field id="msg-message" label="Your message" error={errors.message} hint="For cakes: the date, size or weight, and the message to write on it.">
        {(p) => <textarea {...p} rows={5} maxLength={2000} value={values.message} onChange={set('message')} />}
      </Field>
      <div className="hp" aria-hidden="true">
        <label htmlFor="msg-website">Leave this empty</label>
        <input id="msg-website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
      </div>
      {formError && (
        <p className="form__error" role="alert">
          {formError}
        </p>
      )}
      <button type="submit" className="btn btn--brass btn--wide" disabled={sending}>
        {sending ? <Loader2 className="spin" size={18} aria-hidden="true" /> : <MessageSquareText size={18} aria-hidden="true" />}
        {sending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}

/* ---------- section ---------- */
export default function Booking() {
  const [mode, setMode] = useState('table');

  return (
    <section className="booking stripes" id="book" aria-labelledby="book-title">
      <div className="container booking__grid">
        <div className="booking__intro">
          <h2 className="h2" id="book-title">
            Book a table
          </h2>
          <p className="lede">Tell us when you’re coming and we’ll keep a table ready. For cakes, mithai orders and parties, send us a message.</p>
          <div className="booking__call">
            <p>Prefer to talk?</p>
            <a href={site.phoneHref} className="booking__phone">
              <Phone size={20} strokeWidth={1.8} aria-hidden="true" />
              {site.phoneDisplay}
            </a>
            <p>{site.hoursText}</p>
          </div>
        </div>

        <div className="panel">
          <div className="segmented" role="tablist" aria-label="Choose a form">
            <button type="button" role="tab" aria-selected={mode === 'table'} aria-controls="booking-form" onClick={() => setMode('table')}>
              Book a table
            </button>
            <button type="button" role="tab" aria-selected={mode === 'message'} aria-controls="booking-form" onClick={() => setMode('message')}>
              Cakes, sweets &amp; parties
            </button>
          </div>
          <div id="booking-form" role="tabpanel">
            {mode === 'table' ? <ReservationForm /> : <MessageForm />}
          </div>
        </div>
      </div>
    </section>
  );
}

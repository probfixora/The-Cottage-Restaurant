import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, RefreshCw, Loader2, Trash2, Plus, Pencil, X, Phone, Mail, Star } from 'lucide-react';
import '../styles/admin.css';
import { api } from '../lib/api.js';
import { ArchMark } from '../components/Icons.jsx';

const TOKEN_KEY = 'cottage-admin-token';
const readToken = () => {
  try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
};
const writeToken = (t) => {
  try { t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY); } catch { /* private mode */ }
};

const fmtDate = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtTime = (t) => {
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
const fmtStamp = (s) => new Date(s.replace(' ', 'T') + 'Z').toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/* ================= login ================= */
function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token } = await api('/admin/login', { method: 'POST', body: { password } });
      onLogin(token);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="adm-login">
      <form className="adm-login__card" onSubmit={submit}>
        <ArchMark className="adm-login__mark" />
        <h1>Staff login</h1>
        <p>Bookings, messages and the menu for The Cottage.</p>
        <label htmlFor="adm-pass">Password</label>
        <input id="adm-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required />
        {error && <p className="adm-error" role="alert">{error}</p>}
        <button className="adm-btn adm-btn--primary" type="submit" disabled={busy || !password}>
          {busy && <Loader2 size={16} className="spin" aria-hidden="true" />} Log in
        </button>
        <Link to="/" className="adm-back">Back to the website</Link>
      </form>
    </main>
  );
}

/* ================= bookings ================= */
const RES_STATUSES = [
  ['new', 'New'],
  ['confirmed', 'Confirmed'],
  ['seated', 'Seated'],
  ['cancelled', 'Cancelled'],
];

function Bookings({ token, onAuthError, onChange }) {
  const [when, setWhen] = useState('upcoming');
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setRows(await api(`/admin/reservations?when=${when}`, { token }));
    } catch (err) {
      if (err.status === 401) onAuthError();
      else setError(err.message);
    }
  }, [when, token, onAuthError]);

  useEffect(() => { setRows(null); load(); }, [load]);

  async function setStatus(id, status) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    try { await api(`/admin/reservations/${id}`, { method: 'PATCH', body: { status }, token }); onChange(); }
    catch (err) { setError(err.message); load(); }
  }
  async function remove(r) {
    if (!window.confirm(`Delete the booking for ${r.name} on ${fmtDate(r.date)}? This can't be undone.`)) return;
    try { await api(`/admin/reservations/${r.id}`, { method: 'DELETE', token }); setRows((x) => x.filter((y) => y.id !== r.id)); onChange(); }
    catch (err) { setError(err.message); }
  }

  return (
    <section aria-labelledby="bk-title">
      <div className="adm-toolbar">
        <h2 id="bk-title">Table bookings</h2>
        <div className="adm-filter" role="group" aria-label="Show">
          {[['upcoming', 'Upcoming'], ['past', 'Past'], ['all', 'All']].map(([v, l]) => (
            <button key={v} type="button" aria-pressed={when === v} onClick={() => setWhen(v)}>{l}</button>
          ))}
        </div>
      </div>
      {error && <p className="adm-error" role="alert">{error}</p>}
      {rows === null ? <p className="adm-muted">Loading bookings…</p> : rows.length === 0 ? (
        <div className="adm-empty">
          <p>No {when === 'all' ? '' : when} bookings yet.</p>
          <p className="adm-muted">New requests from the website appear here. Call the guest, then mark it confirmed.</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>When</th><th>Guest</th><th>Party</th><th>Notes</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={`is-${r.status}`}>
                  <td><b>{fmtDate(r.date)}</b><br />{fmtTime(r.time)}</td>
                  <td>
                    <b>{r.name}</b><br />
                    <a href={`tel:${r.phone}`}><Phone size={13} aria-hidden="true" /> {r.phone}</a>
                    {r.email && <><br /><a href={`mailto:${r.email}`}><Mail size={13} aria-hidden="true" /> {r.email}</a></>}
                  </td>
                  <td>{r.guests}{r.occasion && <><br /><span className="adm-tag">{r.occasion}</span></>}</td>
                  <td className="adm-notes">{r.notes || <span className="adm-muted">None</span>}</td>
                  <td>
                    <select aria-label={`Status for ${r.name}`} value={r.status} onChange={(e) => setStatus(r.id, e.target.value)} className={`adm-status adm-status--${r.status}`}>
                      {RES_STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </td>
                  <td><button type="button" className="adm-icon-btn" onClick={() => remove(r)} aria-label={`Delete booking for ${r.name}`}><Trash2 size={17} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ================= messages ================= */
const TOPICS = { general: 'General', cake: 'Cake order', sweets: 'Sweets / hampers', party: 'Party / group', feedback: 'Feedback' };

function Messages({ token, onAuthError, onChange }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try { setRows(await api('/admin/messages', { token })); }
    catch (err) { if (err.status === 401) onAuthError(); else setError(err.message); }
  }, [token, onAuthError]);
  useEffect(() => { load(); }, [load]);

  async function setStatus(id, status) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    try { await api(`/admin/messages/${id}`, { method: 'PATCH', body: { status }, token }); onChange(); }
    catch (err) { setError(err.message); load(); }
  }
  async function remove(m) {
    if (!window.confirm(`Delete the message from ${m.name}? This can't be undone.`)) return;
    try { await api(`/admin/messages/${m.id}`, { method: 'DELETE', token }); setRows((x) => x.filter((y) => y.id !== m.id)); onChange(); }
    catch (err) { setError(err.message); }
  }

  return (
    <section aria-labelledby="msg-title">
      <div className="adm-toolbar"><h2 id="msg-title">Messages</h2></div>
      {error && <p className="adm-error" role="alert">{error}</p>}
      {rows === null ? <p className="adm-muted">Loading messages…</p> : rows.length === 0 ? (
        <div className="adm-empty"><p>No messages yet.</p><p className="adm-muted">Cake orders, sweets enquiries and feedback from the website land here.</p></div>
      ) : (
        <ul className="adm-messages">
          {rows.map((m) => (
            <li key={m.id} className={`adm-msg is-${m.status}`}>
              <div className="adm-msg__head">
                <div>
                  <b>{m.name}</b> <span className="adm-tag">{TOPICS[m.topic] || m.topic}</span>
                  <div className="adm-msg__contact">
                    {m.phone && <a href={`tel:${m.phone}`}><Phone size={13} aria-hidden="true" /> {m.phone}</a>}
                    {m.email && <a href={`mailto:${m.email}`}><Mail size={13} aria-hidden="true" /> {m.email}</a>}
                  </div>
                </div>
                <span className="adm-muted">{fmtStamp(m.created_at)}</span>
              </div>
              <p className="adm-msg__body">{m.message}</p>
              <div className="adm-msg__actions">
                <select aria-label={`Status for message from ${m.name}`} value={m.status} onChange={(e) => setStatus(m.id, e.target.value)} className={`adm-status adm-status--${m.status}`}>
                  <option value="new">New</option><option value="read">Read</option><option value="done">Replied</option>
                </select>
                <button type="button" className="adm-icon-btn" onClick={() => remove(m)} aria-label={`Delete message from ${m.name}`}><Trash2 size={17} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ================= menu ================= */
const CATS = [['restaurant', 'Restaurant'], ['bakery', 'Bakery'], ['sweets', 'Tribhog Sweets']];
const blank = { category: 'restaurant', name: '', description: '', price: '', unit: '', is_signature: false, is_available: true, sort_order: 0 };

function MenuEditor({ token, onAuthError, onChange }) {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null); // null | item (id 0 = new)
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { setItems(await api('/admin/menu', { token })); }
    catch (err) { if (err.status === 401) onAuthError(); else setError(err.message); }
  }, [token, onAuthError]);
  useEffect(() => { load(); }, [load]);

  const open = (item) => { setErrors({}); setError(''); setEditing(item ? { ...item, price: item.price ?? '', unit: item.unit ?? '', description: item.description ?? '' } : { ...blank, id: 0 }); };
  const set = (k) => (e) => setEditing((v) => ({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const { id, ...body } = editing;
    try {
      await api(id ? `/admin/menu/${id}` : '/admin/menu', { method: id ? 'PUT' : 'POST', body, token });
      setEditing(null);
      await load();
      onChange();
    } catch (err) {
      setErrors(err.fields || {});
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(item) {
    if (!window.confirm(`Remove "${item.name}" from the menu? This can't be undone.`)) return;
    try { await api(`/admin/menu/${item.id}`, { method: 'DELETE', token }); setItems((x) => x.filter((y) => y.id !== item.id)); onChange(); }
    catch (err) { setError(err.message); }
  }

  return (
    <section aria-labelledby="menu-ed-title">
      <div className="adm-toolbar">
        <h2 id="menu-ed-title">Menu</h2>
        <button type="button" className="adm-btn adm-btn--primary" onClick={() => open(null)}><Plus size={16} aria-hidden="true" /> Add a dish</button>
      </div>
      {items?.some((i) => i.is_sample) && (
        <p className="adm-notice">Items marked <span className="adm-tag adm-tag--sample">Starter</span> were added as examples and show no price. Edit each one to set the real name and price, or delete it.</p>
      )}
      {error && !editing && <p className="adm-error" role="alert">{error}</p>}
      {items === null ? <p className="adm-muted">Loading menu…</p> : CATS.map(([cat, label]) => {
        const list = items.filter((i) => i.category === cat);
        return (
          <div key={cat} className="adm-menu-group">
            <h3>{label} <span className="adm-muted">({list.length})</span></h3>
            {list.length === 0 ? <p className="adm-muted">No dishes in this section yet.</p> : (
              <ul className="adm-dishes">
                {list.map((i) => (
                  <li key={i.id} className={i.is_available ? '' : 'is-hidden'}>
                    <div>
                      <b>{i.name}</b>
                      {i.is_signature && <Star size={13} fill="currentColor" strokeWidth={0} className="adm-star" aria-label="House favourite" />}
                      {i.is_sample && <span className="adm-tag adm-tag--sample">Starter</span>}
                      {!i.is_available && <span className="adm-tag">Hidden</span>}
                      {i.description && <p className="adm-muted">{i.description}</p>}
                    </div>
                    <span className="adm-price">{i.price !== null ? `₹${i.price}${i.unit ? ` ${i.unit}` : ''}` : <span className="adm-muted">No price</span>}</span>
                    <div className="adm-row-actions">
                      <button type="button" className="adm-icon-btn" onClick={() => open(i)} aria-label={`Edit ${i.name}`}><Pencil size={16} /></button>
                      <button type="button" className="adm-icon-btn" onClick={() => remove(i)} aria-label={`Delete ${i.name}`}><Trash2 size={16} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {editing && (
        <div className="adm-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" onKeyDown={(e) => e.key === 'Escape' && setEditing(null)}>
          <div className="adm-drawer__scrim" onClick={() => setEditing(null)} />
          <form className="adm-drawer__panel" onSubmit={save}>
            <div className="adm-drawer__head">
              <h2 id="drawer-title">{editing.id ? 'Edit dish' : 'Add a dish'}</h2>
              <button type="button" className="adm-icon-btn" onClick={() => setEditing(null)} aria-label="Close"><X size={20} /></button>
            </div>
            <label htmlFor="ed-cat">Section</label>
            <select id="ed-cat" value={editing.category} onChange={set('category')}>{CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            <label htmlFor="ed-name">Name</label>
            <input id="ed-name" value={editing.name} onChange={set('name')} autoFocus aria-invalid={errors.name ? true : undefined} />
            {errors.name && <p className="adm-error">{errors.name}</p>}
            <label htmlFor="ed-desc">Description (optional)</label>
            <textarea id="ed-desc" rows={3} value={editing.description} onChange={set('description')} maxLength={240} />
            <div className="adm-2col">
              <div>
                <label htmlFor="ed-price">Price in ₹ (optional)</label>
                <input id="ed-price" inputMode="numeric" value={editing.price} onChange={set('price')} placeholder="Leave empty to hide" aria-invalid={errors.price ? true : undefined} />
                {errors.price && <p className="adm-error">{errors.price}</p>}
              </div>
              <div>
                <label htmlFor="ed-unit">Unit (optional)</label>
                <input id="ed-unit" value={editing.unit} onChange={set('unit')} placeholder="per plate, per kg" />
              </div>
            </div>
            <label htmlFor="ed-order">Order in the list</label>
            <input id="ed-order" type="number" min="0" value={editing.sort_order} onChange={set('sort_order')} />
            <label className="adm-check"><input type="checkbox" checked={editing.is_signature} onChange={set('is_signature')} /> House favourite</label>
            <label className="adm-check"><input type="checkbox" checked={editing.is_available} onChange={set('is_available')} /> Show on the website</label>
            {error && <p className="adm-error" role="alert">{error}</p>}
            <div className="adm-drawer__foot">
              <button type="button" className="adm-btn" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="adm-btn adm-btn--primary" disabled={busy}>{busy && <Loader2 size={16} className="spin" aria-hidden="true" />} Save dish</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

/* ================= shell ================= */
export default function Admin() {
  const [token, setToken] = useState(readToken);
  const [tab, setTab] = useState('bookings');
  const [summary, setSummary] = useState(null);

  const logout = useCallback(() => { writeToken(''); setToken(''); }, []);
  const loadSummary = useCallback(() => {
    if (!token) return;
    api('/admin/summary', { token }).then(setSummary).catch((err) => err.status === 401 && logout());
  }, [token, logout]);

  useEffect(() => { document.title = 'Staff · The Cottage'; loadSummary(); }, [loadSummary]);

  if (!token) return <Login onLogin={(t) => { writeToken(t); setToken(t); }} />;

  const tabs = [
    ['bookings', 'Bookings', summary?.newReservations],
    ['messages', 'Messages', summary?.newMessages],
    ['menu', 'Menu', null],
  ];
  const props = { token, onAuthError: logout, onChange: loadSummary };

  return (
    <div className="adm">
      <header className="adm-bar">
        <Link to="/" className="adm-brand"><ArchMark className="adm-brand__mark" /> The Cottage <span>Staff</span></Link>
        <nav className="adm-tabs" aria-label="Sections">
          {tabs.map(([id, label, count]) => (
            <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>
              {label}{count ? <span className="adm-count" aria-label={`${count} new`}>{count}</span> : null}
            </button>
          ))}
        </nav>
        <div className="adm-bar__right">
          <button type="button" className="adm-icon-btn" onClick={() => { loadSummary(); setTab((t) => t); }} aria-label="Refresh counts"><RefreshCw size={17} /></button>
          <button type="button" className="adm-btn" onClick={logout}><LogOut size={16} aria-hidden="true" /> Log out</button>
        </div>
      </header>
      <main className="adm-main">
        {summary && (
          <p className="adm-summary">
            <b>{summary.upcoming}</b> upcoming {summary.upcoming === 1 ? 'booking' : 'bookings'}, <b>{summary.newReservations}</b> waiting for a call, <b>{summary.newMessages}</b> new {summary.newMessages === 1 ? 'message' : 'messages'}.
            {!summary.emailAlerts && <span className="adm-muted"> Email alerts for new bookings aren’t set up yet; check this panel for new requests.</span>}
          </p>
        )}
        {tab === 'bookings' && <Bookings {...props} />}
        {tab === 'messages' && <Messages {...props} />}
        {tab === 'menu' && <MenuEditor {...props} />}
      </main>
    </div>
  );
}

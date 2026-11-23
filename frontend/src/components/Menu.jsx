import { useEffect, useRef, useState } from 'react';
import { Star, Phone } from 'lucide-react';
import { api } from '../lib/api.js';
import { VegMark } from './Icons.jsx';
import { site } from '../data/site.js';

const tabs = [
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'bakery', label: 'Bakery' },
  { id: 'sweets', label: 'Tribhog Sweets' },
];

const rupees = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function Menu({ tab, onTab }) {
  const [state, setState] = useState({ status: 'loading', data: null, error: '' });
  const tabRefs = useRef([]);

  useEffect(() => {
    const ctrl = new AbortController();
    api('/menu', { signal: ctrl.signal })
      .then((data) => setState({ status: 'ready', data, error: '' }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ status: 'error', data: null, error: err.message });
      });
    return () => ctrl.abort();
  }, []);

  // Arrow keys move between tabs, as screen-reader users expect.
  const onKeyDown = (e, i) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    onTab(tabs[next].id);
    tabRefs.current[next]?.focus();
  };

  const items = state.data?.categories?.[tab] ?? [];

  return (
    <section className="menu" id="menu" aria-labelledby="menu-title">
      <div className="container">
        <div className="menu__head">
          <h2 className="h2" id="menu-title">
            On the menu
          </h2>
          {state.data?.hasSamples && (
            <p className="menu__note">
              A first look at what we serve. Call <a href={site.phoneHref}>{site.phoneDisplay}</a> for today’s prices
              and specials.
            </p>
          )}
        </div>

        <div className="tabs" role="tablist" aria-label="Menu sections">
          {tabs.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => (tabRefs.current[i] = el)}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls="menu-panel"
              tabIndex={tab === t.id ? 0 : -1}
              className="tabs__tab"
              onClick={() => onTab(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div id="menu-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="menu__panel" aria-busy={state.status === 'loading'}>
          {state.status === 'loading' && (
            <ul className="dishes" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="dish dish--skeleton">
                  <span />
                  <span />
                </li>
              ))}
            </ul>
          )}

          {state.status === 'error' && (
            <div className="menu__empty">
              <p>The menu didn’t load just now.</p>
              <a className="btn btn--sage" href={site.phoneHref}>
                <Phone size={17} aria-hidden="true" /> Call {site.phoneDisplay}
              </a>
            </div>
          )}

          {state.status === 'ready' && items.length === 0 && (
            <div className="menu__empty">
              <p>We’re still adding this part of the menu. Ask us what’s fresh today.</p>
              <a className="btn btn--sage" href={site.phoneHref}>
                <Phone size={17} aria-hidden="true" /> Call {site.phoneDisplay}
              </a>
            </div>
          )}

          {state.status === 'ready' && items.length > 0 && (
            <ul className="dishes">
              {items.map((d) => (
                <li key={d.id} className="dish">
                  <div className="dish__line">
                    <VegMark className="dish__veg" />
                    <h3 className="dish__name">{d.name}</h3>
                    {d.price !== null && (
                      <>
                        <span className="dish__leader" aria-hidden="true" />
                        <span className="dish__price">
                          {rupees(d.price)}
                          {d.unit && <small> {d.unit}</small>}
                        </span>
                      </>
                    )}
                  </div>
                  {d.description && <p className="dish__desc">{d.description}</p>}
                  {d.is_signature && (
                    <span className="dish__fav">
                      <Star size={13} fill="currentColor" strokeWidth={0} aria-hidden="true" /> House favourite
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

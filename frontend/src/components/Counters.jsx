import { useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { gsap, useGSAP } from '../lib/gsap.js';
import { counters } from '../data/site.js';
import { scrollToTarget, revealElement } from '../lib/scroll.js';

// The same centred 4:5 photos as the gallery.
const src = (id) => `/images/gallery/${id}.webp`;
const srcSet = (id) => `/images/gallery/${id}-480.webp 480w, /images/gallery/${id}.webp 960w`;

export default function Counters({ onPickMenu }) {
  const root = useRef(null);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(null);

  const { contextSafe } = useGSAP({ scope: root });

  // Motion that answers the choice: the new photo wipes up inside the arch,
  // over the one that was showing.
  const choose = contextSafe((i) => {
    if (i === active) return;
    setPrev(active);
    setActive(i);
    // The previous panel closes and the page shifts up; keep the chosen one in view.
    requestAnimationFrame(() => requestAnimationFrame(() => revealElement(root.current?.querySelectorAll('.counter')[i])));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const next = root.current.querySelectorAll('.counters__frame img')[i];
    gsap.fromTo(
      next,
      { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.12 },
      { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.1, ease: 'expo.out', overwrite: true },
    );
  });

  const seeMenu = (id) => {
    onPickMenu(id);
    scrollToTarget('#menu');
  };

  return (
    <section className="counters" id="counters" ref={root} aria-labelledby="counters-title">
      <div className="container counters__grid">
        <div className="counters__intro">
          <h2 className="h2" id="counters-title">
            Three counters, one roof
          </h2>
          <p className="lede">Tribhog means three offerings. Choose one to see it.</p>
        </div>

        <div className="counters__frame arch" aria-hidden="true">
          {counters.map((c, i) => (
            <img key={c.id} src={src(c.photo)} srcSet={srcSet(c.photo)} sizes="40vw" width="960" height="1200" alt="" loading="lazy" decoding="async" className={i === active ? 'is-active' : i === prev ? 'is-prev' : ''} />
          ))}
        </div>

        <ul className="counters__list">
          {counters.map((c, i) => {
            const isActive = i === active;
            return (
              <li key={c.id} className={`counter ${isActive ? 'is-active' : ''}`}>
                <button
                  type="button"
                  className="counter__btn"
                  aria-expanded={isActive}
                  aria-controls={`counter-${c.id}`}
                  onClick={() => choose(i)}
                >
                  <span className="counter__title">{c.title}</span>
                </button>
                <div className="counter__body" id={`counter-${c.id}`} hidden={!isActive}>
                  {/* Phones: a wide 4:3 photo, so it never fills more than half the screen */}
                  <img
                    className="counter__photo"
                    src={`/images/gallery/c-${c.id}.webp`}
                    srcSet={`/images/gallery/c-${c.id}-640.webp 640w, /images/gallery/c-${c.id}.webp 1200w`}
                    sizes="92vw"
                    width="1200"
                    height="900"
                    alt={c.alt}
                    loading="lazy"
                    decoding="async"
                  />
                  <p>{c.text}</p>
                  <p className="counter__good">
                    <strong>Good for:</strong> {c.good}
                  </p>
                  <button type="button" className="link-btn" onClick={() => seeMenu(c.id)}>
                    See the {c.id === 'sweets' ? c.title : c.title.toLowerCase()} menu
                    <ArrowDown size={16} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

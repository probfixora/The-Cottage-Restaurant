import { useRef, useState } from 'react';
import { ArrowRight, MoveHorizontal } from 'lucide-react';
import { gsap, useGSAP } from '../lib/gsap.js';
import { spaces } from '../data/site.js';
import { photo } from '../lib/photo.js';
import { scrollToTarget } from '../lib/scroll.js';

export default function Spaces() {
  const root = useRef(null);
  const track = useRef(null);
  const bar = useRef(null);
  const [current, setCurrent] = useState(1);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Larger screens: the row slides sideways while the section is pinned,
      // and a thin brass line shows how far along you are.
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const distance = () => Math.max(0, track.current.scrollWidth - document.documentElement.clientWidth);
        gsap.to(track.current, {
          x: () => -distance(),
          ease: 'none',
          force3D: true,
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => '+=' + distance(),
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => gsap.set(bar.current, { scaleX: self.progress }),
          },
        });
      });
    },
    { scope: root },
  );

  // Phones and tablets: native swipe, with a "2 of 5" counter.
  const onScroll = () => {
    const el = track.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const cards = el.querySelectorAll('.space');
    const mid = el.scrollLeft + el.clientWidth * 0.35;
    let idx = 0;
    cards.forEach((c, i) => {
      if (c.offsetLeft <= mid) idx = i;
    });
    setCurrent(Math.min(idx + 1, spaces.length));
  };

  return (
    <section className="spaces" id="spaces" ref={root} aria-labelledby="spaces-title">
      <div className="spaces__pin">
        <div className="container spaces__head">
          <div>
            <h2 className="h2" id="spaces-title">
              A room for every kind of evening
            </h2>
            <p className="lede">
              Dinner in the courtyard when the lights come on, a quiet family table in the lounge, or tea by the
              arched windows.
            </p>
          </div>
          <p className="spaces__hint" aria-hidden="true">
            <MoveHorizontal size={18} strokeWidth={1.8} /> Swipe to look around
            <span className="spaces__count">
              {current} / {spaces.length}
            </span>
          </p>
        </div>

        <ul className="spaces__track" ref={track} onScroll={onScroll}>
          {spaces.map((s) => (
            <li key={s.title} className={`space space--${s.shape}`}>
              <figure>
                <div className="space__img">
                  <img
                    {...photo(s.image)}
                    sizes={s.shape === 'wide' ? '(max-width: 899px) 86vw, 46vw' : '(max-width: 899px) 70vw, 26vw'}
                    alt={s.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption>
                  <span className="space__title">{s.title}</span>
                  <span className="space__text">{s.text}</span>
                </figcaption>
              </figure>
            </li>
          ))}
          <li className="space space--end">
            <p>Pick your table and we’ll keep it ready.</p>
            <a
              href="#book"
              className="btn btn--brass"
              onClick={(e) => {
                e.preventDefault();
                scrollToTarget('#book');
              }}
            >
              Book a table <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </a>
          </li>
        </ul>

        <div className="container">
          <div className="spaces__progress" aria-hidden="true">
            <span ref={bar} />
          </div>
        </div>
      </div>
    </section>
  );
}

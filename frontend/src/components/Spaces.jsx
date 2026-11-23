import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { gallery } from '../data/site.js';

// A slide-able photo row: swipe on phones, arrow buttons everywhere,
// arrow keys when the row is focused. Every photo is the same 4:5 size.
export default function Spaces() {
  const track = useRef(null);
  const [index, setIndex] = useState(0); // first visible photo
  const [progress, setProgress] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const card = el.querySelector('.slide');
    const step = card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || 0) : 1;
    setIndex(Math.min(gallery.length - 1, Math.round(el.scrollLeft / step)));
    setProgress(max > 0 ? el.scrollLeft / max : 1);
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft > max - 8 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);

  const slide = (dir) => {
    const el = track.current;
    const card = el.querySelector('.slide');
    const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || 0);
    const visible = Math.max(1, Math.floor(el.clientWidth / step));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * step * visible, behavior: reduce ? 'auto' : 'smooth' });
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      slide(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      slide(-1);
    }
  };

  return (
    <section className="spaces" id="spaces" aria-labelledby="spaces-title">
      <div className="container spaces__head">
        <div>
          <h2 className="h2" id="spaces-title">
            A room for every kind of evening
          </h2>
          <p className="lede">
            Dinner in the courtyard when the lights come on, a quiet family table in the lounge, or tea by the arched
            windows. Slide through the spaces.
          </p>
        </div>
        <div className="spaces__controls">
          <span className="spaces__count" aria-live="polite">
            {index + 1} / {gallery.length}
          </span>
          <button type="button" className="round-btn" onClick={() => slide(-1)} disabled={edges.start} aria-label="Previous photos">
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <button type="button" className="round-btn" onClick={() => slide(1)} disabled={edges.end} aria-label="Next photos">
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        </div>
      </div>

      <ul
        className="spaces__track"
        ref={track}
        onScroll={update}
        onKeyDown={onKeyDown}
        tabIndex={0}
        aria-label="Photos of The Cottage. Use the arrow keys or swipe to see more."
      >
        {gallery.map((g) => (
          <li key={g.id} className="slide">
            <figure>
              <div className="slide__img">
                <img
                  src={`/images/gallery/${g.id}.webp`}
                  srcSet={`/images/gallery/${g.id}-480.webp 480w, /images/gallery/${g.id}.webp 960w`}
                  sizes="(max-width: 699px) 74vw, (max-width: 1080px) 38vw, 300px"
                  width="960"
                  height="1200"
                  alt={g.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption>{g.title}</figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className="container">
        <div className="spaces__progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} />
        </div>
      </div>
    </section>
  );
}

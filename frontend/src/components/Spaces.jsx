import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap.js';
import { spaces } from '../data/site.js';

export default function Spaces() {
  const root = useRef(null);
  const track = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // On larger screens the gallery moves sideways while the section is pinned.
      // On phones it stays a normal swipeable row.
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const distance = () => Math.max(0, track.current.scrollWidth - document.documentElement.clientWidth);
        gsap.to(track.current, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => '+=' + distance(),
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section className="spaces" id="spaces" ref={root} aria-labelledby="spaces-title">
      <div className="spaces__pin">
        <div className="container spaces__head">
          <h2 className="h2" id="spaces-title">
            Rooms made for slow evenings
          </h2>
          <p className="lede">The vaulted hall, the lounge and the courtyard under its lights.</p>
        </div>
        <ul className="spaces__track" ref={track}>
          {spaces.map((s) => (
            <li key={s.title} className={`space space--${s.shape}`}>
              <figure>
                <div className="space__img">
                  <img src={s.image} alt={s.alt} loading="lazy" />
                </div>
                <figcaption>{s.title}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

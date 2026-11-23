import { useRef } from 'react';
import { Clock, Leaf, Car, MapPin } from 'lucide-react';
import { gsap, useGSAP } from '../lib/gsap.js';
import { photo } from '../lib/photo.js';

const facts = [
  { icon: Clock, text: 'Open every day, 9 AM to 11:30 PM' },
  { icon: Leaf, text: 'A pure vegetarian kitchen' },
  { icon: Car, text: 'Free parking on site' },
  { icon: MapPin, text: '10 minutes from Phoenix Palassio' },
];

const hall = photo('/images/hall-chandelier.webp');
const brass = photo('/images/chandelier.webp');

export default function Story() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 700px)', () => {
        // Two layers drifting at different speeds give the photos depth.
        const st = { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 };
        gsap.fromTo('.story__main img', { yPercent: -5 }, { yPercent: 5, ease: 'none', force3D: true, scrollTrigger: st });
        gsap.fromTo('.story__inset', { yPercent: 18 }, { yPercent: -18, ease: 'none', force3D: true, scrollTrigger: { ...st } });
      });
    },
    { scope: root },
  );

  return (
    <section className="story stripes" id="story" ref={root} aria-labelledby="story-title">
      <div className="container story__grid">
        <div className="story__text">
          <h2 className="h2" id="story-title">
            Every corner has its own glow
          </h2>
          <p className="lede">
            The Cottage opened on Sultanpur Road in November 2026: white arches, sage-striped walls and brass
            chandeliers, with a fairy-lit courtyard out front.
          </p>
          <p>
            Under one roof you’ll find a family restaurant, a bakery and Tribhog’s sweet counter. Come for a long
            dinner, pick up a birthday cake, or take home a box of mithai.
          </p>
          <ul className="facts">
            {facts.map(({ icon: Icon, text }) => (
              <li key={text}>
                <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="story__visual">
          <figure className="story__main arch">
            <img
              {...hall}
              sizes="(max-width: 699px) 88vw, 42vw"
              alt="The vaulted grand hall: brass chandelier, white columns and the glass bakery counters"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <figure className="story__inset arch">
            <img {...brass} sizes="(max-width: 699px) 40vw, 18vw" alt="A brass chandelier under the white vault" loading="lazy" decoding="async" />
          </figure>
        </div>
      </div>
    </section>
  );
}

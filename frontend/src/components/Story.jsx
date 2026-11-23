import { useRef } from 'react';
import { Clock, Leaf, Car, MapPin } from 'lucide-react';
import { gsap, useGSAP } from '../lib/gsap.js';

const facts = [
  { icon: Clock, text: 'Open every day, 9 AM to 11:30 PM' },
  { icon: Leaf, text: 'A pure vegetarian kitchen' },
  { icon: Car, text: 'Free parking on site' },
  { icon: MapPin, text: '10 minutes from Phoenix Palassio' },
];

export default function Story() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.story__photo img',
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section className="story stripes" id="story" ref={root} aria-labelledby="story-title">
      <div className="container story__grid">
        <div className="story__text">
          <h2 className="h2 story__title" id="story-title">
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
        <figure className="story__photo arch">
          <img src="/images/arch-light.webp" alt="Light through an arched window falls across the sage-striped wall" loading="lazy" />
        </figure>
      </div>
    </section>
  );
}

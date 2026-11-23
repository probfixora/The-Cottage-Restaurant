import { useRef } from 'react';
import { ArrowRight, Navigation, Star } from 'lucide-react';
import { gsap, SplitText, useGSAP } from '../lib/gsap.js';
import { site } from '../data/site.js';
import { scrollToTarget } from '../lib/scroll.js';
import { useOpenStatus } from '../hooks/useOpenStatus.js';

export default function Hero() {
  const root = useRef(null);
  const status = useOpenStatus();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // The one signature moment: the night photo opens out of an arch,
        // the way the hall's doorways frame the courtyard.
        const split = SplitText.create('.hero__title', { type: 'lines,chars', mask: 'lines' });
        const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out', force3D: true } });
        tl.from('.hero__media', {
          clipPath: 'inset(14% 34% 0% 34% round 600px 600px 0px 0px)',
          duration: 1.5,
          ease: 'power3.inOut',
        })
          .from('.hero__media img', { scale: 1.14, duration: 2 }, '<')
          .from(split.chars, { yPercent: 110, duration: 1, stagger: 0.03 }, '-=1.05')
          .from('.hero__reveal', { autoAlpha: 0, y: 16, duration: 0.8, stagger: 0.07 }, '-=0.75')
          .add(() => root.current?.classList.add('is-ready'));

        // Start only once the photo is decoded, so the reveal never stutters
        // while the browser is still unpacking a large image (max 1.2 s wait).
        const img = root.current.querySelector('.hero__media img');
        const decoded = img.decode ? img.decode().catch(() => {}) : Promise.resolve();
        const timeout = new Promise((r) => setTimeout(r, 1200));
        Promise.race([decoded, timeout]).then(() => tl.play());

        // Quiet scroll response: the photo settles back as the page moves on.
        // Runs on the <picture> wrapper, so it never fights the intro's zoom on the <img>.
        const drift = gsap.fromTo(
          '.hero__media picture',
          { scale: 1, yPercent: 0 },
          {
            scale: 1.06,
            yPercent: 5,
            ease: 'none',
            force3D: true,
            immediateRender: false,
            scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.4 },
          },
        );
        return () => {
          tl.kill();
          drift.kill();
          split.revert();
        };
      });
    },
    { scope: root },
  );

  const go = (e, href) => {
    e.preventDefault();
    scrollToTarget(href);
  };

  return (
    <section className="hero" ref={root} aria-labelledby="hero-title">
      <div className="hero__media">
        <picture>
          <source media="(max-width: 760px)" srcSet="/images/entrance-doors-720.webp 720w, /images/entrance-doors.webp 1200w" sizes="100vw" />
          <img
            src="/images/entrance-wide.webp"
            srcSet="/images/entrance-wide-1600.webp 1600w, /images/entrance-wide.webp 2400w"
            sizes="100vw"
            decoding="async"
            alt="The Cottage’s glass doors open onto a courtyard strung with warm lights at night"
            fetchpriority="high"
          />
        </picture>
      </div>

      <div className="container hero__inner">
        <h1 className="hero__title" id="hero-title">
          The Cottage
        </h1>
        <p className="hero__sub hero__reveal">
          Restaurant, bakery and mithai by Tribhog. Pure vegetarian, on Sultanpur Road in Lucknow.
        </p>
        <div className="hero__actions hero__reveal">
          <a href="#book" className="btn btn--brass" onClick={(e) => go(e, '#book')}>
            Book a table
            <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
          </a>
          <a href={site.directions} className="btn btn--ghost" target="_blank" rel="noopener noreferrer">
            <Navigation size={17} strokeWidth={2} aria-hidden="true" />
            Get directions
          </a>
        </div>
      </div>

      <div className="hero__foot hero__reveal">
        <div className="container hero__foot-row">
          <span className={`status ${status.open ? 'status--open' : 'status--closed'}`}>
            <span className="status__dot" aria-hidden="true" />
            {status.label}
          </span>
          <a className="hero__rating" href={site.googleListing} target="_blank" rel="noopener noreferrer">
            <Star size={15} fill="currentColor" strokeWidth={0} aria-hidden="true" />
            Rated {site.rating} on Google
          </a>
          <a className="hero__phone" href={site.phoneHref}>
            {site.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}

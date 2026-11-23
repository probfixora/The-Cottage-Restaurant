import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star, ArrowUpRight } from 'lucide-react';
import { reviews, site } from '../data/site.js';

const AUTOPLAY_MS = 7000;

export default function Reviews() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const box = useRef(null);

  const go = (delta) => setIndex((i) => (i + delta + reviews.length) % reviews.length);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setTimeout(() => go(1), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [index, paused]);

  const review = reviews[index];

  return (
    <section className="reviews" id="reviews" aria-labelledby="reviews-title">
      <div className="container reviews__grid">
        <div className="reviews__score">
          <div className="stars" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} size={22} fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <h2 className="h2" id="reviews-title">
            Rated {site.rating} by {site.reviewCount} guests on Google
          </h2>
          <a className="link-arrow" href={site.googleListing} target="_blank" rel="noopener noreferrer">
            Read every review on Google
            <ArrowUpRight size={17} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>

        <div
          className="quote-box"
          ref={box}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={(e) => !box.current.contains(e.relatedTarget) && setPaused(false)}
        >
          <figure className="quote" key={index} aria-live="polite">
            <blockquote>
              <p>“{review.quote}”</p>
            </blockquote>
            <figcaption>{review.name}, Google review</figcaption>
          </figure>
          <div className="quote-box__nav">
            <button type="button" className="round-btn" onClick={() => go(-1)} aria-label="Previous review">
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <span className="quote-box__count" aria-hidden="true">
              {index + 1} / {reviews.length}
            </span>
            <button type="button" className="round-btn" onClick={() => go(1)} aria-label="Next review">
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

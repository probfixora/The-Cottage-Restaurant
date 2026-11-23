import { Link } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';
import { InstagramIcon, ArchMark } from './Icons.jsx';
import { navLinks, site } from '../data/site.js';
import { scrollToTarget } from '../lib/scroll.js';

export default function Footer() {
  const go = (e, href) => {
    e.preventDefault();
    scrollToTarget(href);
  };
  return (
    <footer className="footer">
      <div className="container">
        {/* The name opens the footer. SVG text scales with the screen and is never cut off. */}
        <svg className="footer__word" viewBox="0 0 820 178" role="img" aria-label="The Cottage">
          <text x="410" y="136" textAnchor="middle">
            The Cottage
          </text>
        </svg>

        <div className="footer__grid">
          <div className="footer__brand">
            <ArchMark className="footer__mark" />
            <p>
              Restaurant, bakery and Tribhog sweets.
              <br />
              Pure vegetarian, on Sultanpur Road, Lucknow.
            </p>
          </div>

          <nav className="footer__nav" aria-labelledby="footer-explore">
            <h2 className="footer__heading" id="footer-explore">Explore</h2>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)}>
                {l.label}
              </a>
            ))}
            <a href="#book" onClick={(e) => go(e, '#book')}>
              Book a table
            </a>
          </nav>

          <div className="footer__contact">
            <h2 className="footer__heading">Visit and contact</h2>
            <a href={site.phoneHref}>
              <Phone size={17} strokeWidth={1.8} aria-hidden="true" /> {site.phoneDisplay}
            </a>
            <a href={site.googleListing} target="_blank" rel="noopener noreferrer">
              <MapPin size={17} strokeWidth={1.8} aria-hidden="true" /> Sultanpur Road, Lucknow
            </a>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">
              <InstagramIcon size={17} /> {site.instagramHandle}
            </a>
            <p className="footer__hours">{site.hoursText}</p>
          </div>
        </div>

        <div className="footer__base">
          <span>© {new Date().getFullYear()} The Cottage Restaurant &amp; Tribhog Sweets. All rights reserved.</span>
          <Link to="/admin" className="footer__staff">
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}

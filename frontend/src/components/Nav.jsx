import { useEffect, useState, useCallback } from 'react';
import { Menu as MenuIcon, X, Phone } from 'lucide-react';
import { ArchMark } from './Icons.jsx';
import { navLinks, site } from '../data/site.js';
import { scrollToTarget, setScrollLocked } from '../lib/scroll.js';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setScrollLocked(open);
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const go = (e, href) => {
    e.preventDefault();
    if (open) {
      setOpen(false);
      setTimeout(() => scrollToTarget(href), 320);
    } else {
      scrollToTarget(href);
    }
  };

  return (
    <header className={`nav ${scrolled ? 'nav--solid' : ''} ${open ? 'nav--open' : ''}`}>
      <div className="container nav__bar">
        <a href="#top" className="brand" onClick={(e) => go(e, '#top')} aria-label="The Cottage by Tribhog, back to top">
          <ArchMark className="brand__mark" />
          <span className="brand__words">
            <span className="brand__name">The Cottage</span>
            <span className="brand__by">by Tribhog</span>
          </span>
        </a>

        <nav className="nav__links" aria-label="Main">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <a className="nav__call" href={site.phoneHref} aria-label={`Call ${site.phoneDisplay}`}>
            <Phone size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>{site.phoneDisplay}</span>
          </a>
          <a href="#book" className="btn btn--brass btn--small" onClick={(e) => go(e, '#book')}>
            Book a table
          </a>
          <button
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <MenuIcon size={22} aria-hidden="true" />}
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="sheet" hidden={!open}>
        <nav className="container sheet__links" aria-label="Mobile">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)}>
              {l.label}
            </a>
          ))}
          <a href="#book" onClick={(e) => go(e, '#book')}>
            Book a table
          </a>
        </nav>
        <div className="container sheet__foot">
          <a href={site.phoneHref}>{site.phoneDisplay}</a>
          <span>{site.hoursText}</span>
        </div>
      </div>
    </header>
  );
}

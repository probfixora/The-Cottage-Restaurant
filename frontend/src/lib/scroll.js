// Smooth scrolling (Lenis) wired into GSAP ScrollTrigger.
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap.js';

let lenis = null;

// Phones: the address bar showing/hiding resizes the viewport; don't recalculate
// every scroll animation each time (that is what causes jumps mid-scroll).
ScrollTrigger.config({ ignoreMobileResize: true });

export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) return () => {};
  // Touch screens already scroll smoothly on their own; Lenis is only for mouse wheels.
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return () => {};
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
    lenis = null;
  };
}

/** Scroll to "#id" (or "#top"); uses Lenis when it is running. */
export function scrollToTarget(hash) {
  const target = hash === '#top' ? 0 : document.querySelector(hash);
  if (target === null) return;
  const offset = hash === '#top' ? 0 : -72; // keep headings clear of the fixed bar
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.2 });
  } else {
    const y = target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }
  if (target && target !== 0) {
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
}

export function setScrollLocked(locked) {
  if (lenis) (locked ? lenis.stop() : lenis.start());
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}

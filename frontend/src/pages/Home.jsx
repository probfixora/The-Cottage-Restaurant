import { useEffect, useState } from 'react';
import '../styles/home.css';
import Nav from '../components/Nav.jsx';
import Hero from '../components/Hero.jsx';
import Story from '../components/Story.jsx';
import Counters from '../components/Counters.jsx';
import Menu from '../components/Menu.jsx';
import Spaces from '../components/Spaces.jsx';
import Reviews from '../components/Reviews.jsx';
import Booking from '../components/Booking.jsx';
import Visit from '../components/Visit.jsx';
import Footer from '../components/Footer.jsx';
import { startSmoothScroll } from '../lib/scroll.js';
import { ScrollTrigger } from '../lib/gsap.js';

export default function Home() {
  const [menuTab, setMenuTab] = useState('restaurant');

  useEffect(() => {
    const stop = startSmoothScroll();
    // Recalculate scroll positions once fonts and images have settled.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => {
      stop();
      window.removeEventListener('load', refresh);
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Story />
        <Counters onPickMenu={setMenuTab} />
        <Menu tab={menuTab} onTab={setMenuTab} />
        <Spaces />
        <Reviews />
        <Booking />
        <Visit />
      </main>
      <Footer />
    </>
  );
}

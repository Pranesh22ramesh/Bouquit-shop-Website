import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiArrowUp, FiPhone } from 'react-icons/fi';
import { readConsent, saveConsent, captureCampaign } from '../lib/consent';

export default function SiteUtilities() {
  const location = useLocation();
  const [showConsent, setShowConsent] = useState(() => !readConsent());
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let frame;
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { const distance = document.documentElement.scrollHeight - innerHeight; setProgress(distance > 0 ? Math.min(1, scrollY / distance) : 0); setScrolled(scrollY > 500); }); };
    const observer = new ResizeObserver(update); observer.observe(document.body);
    addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); removeEventListener('scroll', update); removeEventListener('resize', update); };
  }, []);
  useEffect(() => {
    const open = () => setShowConsent(true);
    const capture = () => captureCampaign(location.search);
    addEventListener('shop:cookie-settings', open); addEventListener('shop:consent', capture); capture();
    return () => { removeEventListener('shop:cookie-settings', open); removeEventListener('shop:consent', capture); };
  }, [location.search]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [location.pathname]);
  const choose = (analytics) => { saveConsent(analytics); setShowConsent(false); };
  return <>
    <div className="scroll-progress" aria-hidden="true" style={{ transform: `scaleX(${progress})` }} />
    <div className={`floating-tools ${showConsent ? 'consent-open' : ''}`}>
      {scrolled && <button type="button" className="icon-button" aria-label="Back to top" onClick={() => { window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); document.querySelector('.skip-link')?.focus({ preventScroll: true }); }}><FiArrowUp /></button>}
      <a className="icon-button" href="tel:+919942071721" aria-label="Call the flower shop"><FiPhone /></a>
    </div>
    {showConsent && <aside className="cookie-banner" aria-label="Cookie preferences"><div><strong>Your privacy choices</strong><p>We use essential storage for your session, cart and theme. With your permission, we also save campaign tags for this tab. No advertising trackers are loaded.</p><Link to="/privacy">Read our privacy notice</Link></div><div className="button-row"><button className="button secondary" onClick={() => choose(false)}>Essential only</button><button className="button secondary" onClick={() => choose(true)}>Allow campaign tracking</button></div></aside>}
  </>;
}

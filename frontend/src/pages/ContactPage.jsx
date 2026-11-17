import React, { useState } from 'react';
import SeoHead from '../seo/SeoHead';
import FAQ from '../components/FAQ';
export default function ContactPage() {
 const [copied, setCopied] = useState('');
 return <div className="page-width contact-page"><SeoHead seoOverride={{ title: 'Contact the flower shop | Midhunyas Petals' }} /><p className="eyebrow">LET?S PLAN YOUR FLOWERS</p><h1>Talk to the shop</h1><p className="page-intro">Tell us your occasion, preferred date and design. For an existing order, keep your order number handy.</p><div className="contact-grid"><section className="contact-card"><h2>Call Midhunyas Petals</h2><a className="contact-number" href="tel:+919942071721">+91 99420 71721</a><p>Karur, Tamil Nadu</p><button className="button secondary" onClick={async () => { try { await navigator.clipboard.writeText('+919942071721'); setCopied('Phone number copied.'); } catch { setCopied('Copy unavailable. Select the phone number above to copy it.'); } }}>Copy phone number</button><p role="status">{copied}</p></section><section className="contact-card"><h2>Message on WhatsApp</h2><p>Send your flower preferences or ask about availability. WhatsApp opens as a separate service.</p><a className="button" href="https://wa.me/919942071721" target="_blank" rel="noopener noreferrer">Open WhatsApp</a></section></div><FAQ /></div>;
}

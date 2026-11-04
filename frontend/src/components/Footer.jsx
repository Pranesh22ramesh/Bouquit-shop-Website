import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiFacebook, FiInstagram, FiMail, FiMapPin, FiPhone } from "react-icons/fi";

const Footer = () => (
  <footer className="bg-[#261520] text-[#FAF5EE] border-t-2 border-[#C5A15B]/30">
    <div className="mx-auto max-w-7xl px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
      <div className="grid gap-8 border-b border-[#C5A15B]/20 pb-8 md:grid-cols-2 lg:grid-cols-[1.35fr_0.7fr_0.7fr_1.2fr]">
        <div className="max-w-sm">
          <p className="font-serif text-2xl sm:text-3xl tracking-[0.1em] text-[#FAF5EE]">MIDHUNYAS</p>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#FAF5EE]/70">Beautifully considered flowers for gifting, events, and all the moments worth remembering.</p>
          <div className="mt-4 flex gap-2.5">
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-[#C5A15B]/40 text-[#FAF5EE] transition hover:border-[#C5A15B] hover:bg-[#C5A15B] hover:text-[#261520]"><FiInstagram className="text-sm" /></a>
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full border border-[#C5A15B]/40 text-[#FAF5EE] transition hover:border-[#C5A15B] hover:bg-[#C5A15B] hover:text-[#261520]"><FiFacebook className="text-sm" /></a>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C5A15B]">Explore</p>
          <nav className="mt-3 space-y-2 text-xs sm:text-sm text-[#FAF5EE]/70">
            <Link className="block hover:text-[#C5A15B] transition-colors" to="/gallery">Shop flowers</Link>
            <Link className="block hover:text-[#C5A15B] transition-colors" to="/favorites">Wishlist</Link>
            <Link className="block hover:text-[#C5A15B] transition-colors" to="/reviews">Love notes</Link>
            <Link className="block hover:text-[#C5A15B] transition-colors" to="/about">Our story</Link>
          </nav>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C5A15B]">Help</p>
          <nav className="mt-3 space-y-2 text-xs sm:text-sm text-[#FAF5EE]/70">
            <Link className="block hover:text-[#C5A15B] transition-colors" to="/contact">Contact us</Link>
            <Link className="block hover:text-[#C5A15B] transition-colors" to="/my-orders">Track an order</Link>
            <Link className="block hover:text-[#C5A15B] transition-colors" to="/cart">Delivery</Link>
            <Link className="block hover:text-[#C5A15B] transition-colors" to="/contact">Event enquiry</Link>
          </nav>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C5A15B]">Stay in bloom</p>
          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#FAF5EE]/70">Seasonal flowers, thoughtful gifting ideas, and first looks from our studio.</p>
          <form className="mt-3 flex border-b border-[#C5A15B]/30 pb-2" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <input id="footer-email" type="email" placeholder="Your email address" className="min-w-0 flex-1 bg-transparent py-1.5 text-xs sm:text-sm text-[#FAF5EE] outline-none placeholder:text-[#FAF5EE]/40" />
            <button aria-label="Subscribe" className="grid h-8 w-8 place-items-center rounded-full bg-[#651F3C] text-white transition hover:bg-[#C5A15B] hover:scale-105"><FiArrowRight className="text-xs" /></button>
          </form>
          <div className="mt-4 space-y-1.5 text-xs text-[#FAF5EE]/60">
            <p className="flex items-center gap-2"><FiMapPin className="text-[#C5A15B]" /> Karur, Tamil Nadu</p>
            <p className="flex items-center gap-2"><FiPhone className="text-[#C5A15B]" /> Event &amp; gifting enquiries</p>
            <p className="flex items-center gap-2"><FiMail className="text-[#C5A15B]" /> hello@midhunyas.com</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 pt-4 text-[11px] text-[#FAF5EE]/50 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Midhunyas Flowers. All rights reserved.</p>
        <p>Handcrafted with care in Karur.</p>
      </div>
    </div>
  </footer>
);

export default Footer;

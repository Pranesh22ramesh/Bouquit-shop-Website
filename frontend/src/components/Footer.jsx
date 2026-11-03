import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiFacebook, FiInstagram, FiMail, FiMapPin, FiPhone } from "react-icons/fi";

const Footer = () => (
  <footer className="bg-[#30232A] text-[#FAF5EF]">
    <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8 sm:pt-20">
      <div className="grid gap-12 border-b border-[#C5A15B]/20 pb-14 md:grid-cols-2 lg:grid-cols-[1.35fr_0.7fr_0.7fr_1.2fr]">
        <div className="max-w-sm">
          <p className="font-serif text-3xl tracking-[0.1em] text-[#FAF5EF]">MIDHUNYAS</p>
          <p className="mt-5 text-sm leading-7 text-[#FAF5EF]/60">Beautifully considered flowers for gifting, events, and all the moments worth remembering.</p>
          <div className="mt-7 flex gap-3">
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-[#C5A15B]/30 text-[#FAF5EF] transition hover:border-[#C5A15B] hover:bg-[#C5A15B] hover:text-[#30232A]"><FiInstagram /></a>
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full border border-[#C5A15B]/30 text-[#FAF5EF] transition hover:border-[#C5A15B] hover:bg-[#C5A15B] hover:text-[#30232A]"><FiFacebook /></a>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C5A15B]">Explore</p>
          <nav className="mt-5 space-y-3 text-sm text-[#FAF5EF]/60">
            <Link className="block hover:text-[#C5A15B] transition-colors" to="/gallery">Shop flowers</Link>
            <Link className="block hover:text-[#C5A15B] transition-colors" to="/favorites">Wishlist</Link>
            <Link className="block hover:text-[#C5A15B] transition-colors" to="/reviews">Love notes</Link>
            <Link className="block hover:text-[#C5A15B] transition-colors" to="/about">Our story</Link>
          </nav>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C5A15B]">Help</p>
          <nav className="mt-5 space-y-3 text-sm text-[#FAF5EF]/60">
            <Link className="block hover:text-[#C5A15B] transition-colors" to="/contact">Contact us</Link>
            <Link className="block hover:text-[#C5A15B] transition-colors" to="/my-orders">Track an order</Link>
            <Link className="block hover:text-[#C5A15B] transition-colors" to="/cart">Delivery</Link>
            <Link className="block hover:text-[#C5A15B] transition-colors" to="/contact">Event enquiry</Link>
          </nav>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C5A15B]">Stay in bloom</p>
          <p className="mt-5 text-sm leading-7 text-[#FAF5EF]/60">Seasonal flowers, thoughtful gifting ideas, and first looks from our studio.</p>
          <form className="mt-5 flex border-b border-[#C5A15B]/30 pb-2" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <input id="footer-email" type="email" placeholder="Your email address" className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#FAF5EF] outline-none placeholder:text-[#FAF5EF]/35" />
            <button aria-label="Subscribe" className="grid h-10 w-10 place-items-center rounded-full bg-[#651F3C] text-white transition hover:bg-[#C5A15B] hover:scale-105"><FiArrowRight /></button>
          </form>
          <div className="mt-6 space-y-2 text-xs text-[#FAF5EF]/50">
            <p className="flex items-center gap-2"><FiMapPin /> Karur, Tamil Nadu</p>
            <p className="flex items-center gap-2"><FiPhone /> Event &amp; gifting enquiries</p>
            <p className="flex items-center gap-2"><FiMail /> hello@midhunyas.com</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-7 text-[11px] text-[#FAF5EF]/40 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Midhunyas Flowers. All rights reserved.</p>
        <p>Handcrafted with care in Karur.</p>
      </div>
    </div>
  </footer>
);

export default Footer;

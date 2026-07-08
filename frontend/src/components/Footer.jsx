import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiFacebook, FiInstagram, FiMail, FiMapPin, FiPhone } from "react-icons/fi";

const Footer = () => (
  <footer className="bg-[#242724] text-[#F5F2ED]">
    <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8 sm:pt-20">
      <div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-2 lg:grid-cols-[1.35fr_0.7fr_0.7fr_1.2fr]">
        <div className="max-w-sm">
          <p className="font-serif text-3xl tracking-[0.1em]">MIDHUNYAS</p>
          <p className="mt-5 text-sm leading-7 text-white/60">Beautifully considered flowers for gifting, events, and all the moments worth remembering.</p>
          <div className="mt-7 flex gap-3">
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 transition hover:border-[#E85D8E] hover:bg-[#E85D8E]"><FiInstagram /></a>
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 transition hover:border-[#E85D8E] hover:bg-[#E85D8E]"><FiFacebook /></a>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D7B66B]">Explore</p>
          <nav className="mt-5 space-y-3 text-sm text-white/60"><Link className="block hover:text-white" to="/gallery">Shop flowers</Link><Link className="block hover:text-white" to="/favorites">Wishlist</Link><Link className="block hover:text-white" to="/reviews">Love notes</Link><Link className="block hover:text-white" to="/about">Our story</Link></nav>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D7B66B]">Help</p>
          <nav className="mt-5 space-y-3 text-sm text-white/60"><Link className="block hover:text-white" to="/contact">Contact us</Link><Link className="block hover:text-white" to="/my-orders">Track an order</Link><Link className="block hover:text-white" to="/cart">Delivery</Link><Link className="block hover:text-white" to="/contact">Event enquiry</Link></nav>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D7B66B]">Stay in bloom</p>
          <p className="mt-5 text-sm leading-7 text-white/60">Seasonal flowers, thoughtful gifting ideas, and first looks from our studio.</p>
          <form className="mt-5 flex border-b border-white/25 pb-2" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="footer-email" className="sr-only">Email address</label><input id="footer-email" type="email" placeholder="Your email address" className="min-w-0 flex-1 bg-transparent py-2 text-sm text-white outline-none placeholder:text-white/35" /><button aria-label="Subscribe" className="grid h-10 w-10 place-items-center rounded-full bg-[#E85D8E] transition hover:scale-105"><FiArrowRight /></button>
          </form>
          <div className="mt-6 space-y-2 text-xs text-white/50"><p className="flex items-center gap-2"><FiMapPin /> Karur, Tamil Nadu</p><p className="flex items-center gap-2"><FiPhone /> Event & gifting enquiries</p><p className="flex items-center gap-2"><FiMail /> hello@midhunyas.com</p></div>
        </div>
      </div>
      <div className="flex flex-col gap-3 pt-7 text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Midhunyas Flowers. All rights reserved.</p><p>Handcrafted with care in Karur.</p></div>
    </div>
  </footer>
);

export default Footer;

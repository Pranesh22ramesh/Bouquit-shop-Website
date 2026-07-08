// src/components/FloatingWhatsApp.jsx
import React from "react";

/**
 * FloatingWhatsApp
 * - phone can be '9942071721' or '919942071721' etc.
 * - component will ensure it constructs a wa.me url
 */

const FloatingWhatsApp = ({ phone = "919942071721", label = "Chat on WhatsApp" }) => {
  // normalize: if phone already starts with country code '91' (or +), keep; otherwise prepend 91 (India)
  let normalized = phone.replace(/\D/g, ""); // digits only
  if (!normalized.startsWith("91")) {
    normalized = `91${normalized}`;
  }
  const waHref = `https://wa.me/${normalized}`;

  return (
    <a
      href={waHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed left-6 bottom-6 z-50 flex items-center gap-3 bg-[#25D366] hover:bg-[#1DA851] text-white px-3 py-2 rounded-full shadow-2xl transform transition-transform hover:scale-105"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.5 3.5A11.8 11.8 0 0012 .5 11.7 11.7 0 00.5 12c0 2.1.6 4 1.7 5.7L0 24l6.1-1.6A11.7 11.7 0 0012 23.5a11.8 11.8 0 008.5-20zM12 21.5a9.6 9.6 0 01-4.8-1.2l-.3-.2-3.6.9.9-3.5-.2-.3A9.6 9.6 0 1121.6 12 9.6 9.6 0 0112 21.5zM17 14.1c-.3-.1-1.8-.8-2-.9-.2-.1-.4-.1-.6.1-.2.2-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.5-1.8-1.7-2.1-.1-.3 0-.5.1-.6.1-.1.3-.4.5-.6.2-.2.3-.4.4-.6.1-.2 0-.4 0-.6 0-.2-.6-1.4-.9-1.9-.2-.5-.5-.4-.7-.4-.2 0-.6 0-.9 0-.3 0-.7 0-1.1 0-.4 0-.8.2-1.1.6-.3.4-1 1-1 2.3s1 2.6 1.2 2.8c.2.2 2 3.2 4.9 4.4 3 .9 3.3.8 3.8.8.5 0 1.6-.6 1.9-1.5.3-.9.3-1.6.2-1.9-.1-.3-.4-.4-.7-.6z" />
      </svg>

      <span className="hidden md:inline-block text-sm font-medium">{label}</span>
    </a>
  );
};

export default FloatingWhatsApp;

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FiX, FiCopy, FiCheck, FiShoppingBag, FiTag } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function OfferPopupModal({ offerData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const offer = {
    enabled: offerData?.enabled !== false,
    badge: offerData?.badge || "LIMITED TIME EXCLUSIVE OFFER ✦",
    title: offerData?.title || "Flat 15% OFF On Your Order",
    subtitle: offerData?.subtitle || "Karur's Premier Floral Atelier",
    description:
      offerData?.description ||
      "Handcrafted bouquets, bespoke bridal jadai, and grand garlands. Delivered fresh across Karur & Tamil Nadu.",
    couponCode: offerData?.couponCode || "MIDHUNYAS15",
    buttonLabel: offerData?.buttonLabel || "Claim 15% Off & Shop Now →",
    buttonLink: offerData?.buttonLink || "/gallery",
    whatsappMessage:
      offerData?.whatsappMessage ||
      "Hello MIDHUNYAS! I would like to claim 15% OFF with coupon code MIDHUNYAS15 for my order.",
    image: offerData?.image || "/gallery/bouquet/bouquet13.jpg",
  };

  useEffect(() => {
    if (offer.enabled) {
      try {
        if (sessionStorage.getItem('offerPopupShownThisSession') === 'true') return undefined;
      } catch (_) {}
      const timer = setTimeout(() => {
        setIsOpen(true);
        try { sessionStorage.setItem('offerPopupShownThisSession', 'true'); } catch (_) {}
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [offer.enabled]);

  const closeOffer = () => {
    setIsOpen(false);
    try { sessionStorage.setItem('offerPopupShownThisSession', 'true'); } catch (_) {}
  };

  const handleCopyCode = async () => {
    if (!offer.couponCode) return;
    try {
      await navigator.clipboard.writeText(offer.couponCode);
      setCopied(true);
      toast.success(`Coupon code ${offer.couponCode} copied!`);
      setTimeout(() => setCopied(false), 2500);
    } catch (_) {
      toast.error('Could not copy the coupon code. Please copy it manually.');
    }
  };

  const handleWhatsAppClaim = () => {
    const phone = "919942071721";
    const msg = encodeURIComponent(offer.whatsappMessage);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank", "noopener,noreferrer");
    closeOffer();
  };

  if (!offer.enabled) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-3 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOffer}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative my-auto max-h-[calc(100dvh-1.5rem)] w-full min-w-0 max-w-2xl overflow-y-auto rounded-[28px] border border-[#C5A15B]/40 bg-[#FAF5EE] shadow-[0_25px_70px_rgba(101,31,60,0.35)] dark:border-[#493640] dark:bg-[#1A111A] text-[#30232A] dark:text-[#FAF5EE] md:overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeOffer}
                aria-label="Close offer popup"
                className="absolute right-3.5 top-3.5 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/80 dark:bg-black/60 text-[#30232A] dark:text-white backdrop-blur shadow-md hover:bg-[#651F3C] hover:text-white transition-all"
              >
                <FiX className="text-xl" />
              </button>

              <div className="grid min-w-0 md:grid-cols-[1.1fr_1.3fr]">
                {/* Left: Poster Image Showcase */}
                <div className="relative min-w-0 min-h-[180px] sm:min-h-[220px] md:min-h-full overflow-hidden bg-gradient-to-br from-[#651F3C] to-[#30232A]">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="h-full w-full object-cover brightness-[0.92] contrast-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  
                  {/* Floating Poster Tag */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block rounded-full bg-[#C5A15B] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#30232A] shadow-md">
                      ✦ Handcrafted Daily
                    </span>
                    <p className="mt-2 text-xs font-medium text-white/90">
                      Express Delivery in Karur & All Tamil Nadu
                    </p>
                  </div>
                </div>

                {/* Right: Offer Details & Actions */}
                <div className="flex min-w-0 flex-col justify-between p-4 sm:p-8">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C5A15B]/40 bg-[#F6ECE7] dark:bg-[#281827] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#651F3C] dark:text-[#D5B36C]">
                      <FiTag className="text-xs" /> {offer.badge}
                    </div>

                    <h2 className="mt-3 text-2xl sm:text-3xl font-serif font-bold text-[#651F3C] dark:text-[#D5B36C] leading-tight">
                      {offer.title}
                    </h2>

                    <p className="mt-1 text-xs font-semibold tracking-wide text-[#C5A15B] dark:text-[#C5A15B]">
                      {offer.subtitle}
                    </p>

                    <p className="mt-3 text-xs leading-relaxed text-[#51454B] dark:text-zinc-300">
                      {offer.description}
                    </p>

                    {/* Promo Code Box */}
                    {offer.couponCode && (
                      <div className="mt-4 flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-[#C5A15B] bg-white/70 p-3 shadow-inner dark:bg-white/5">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-[#81747A] dark:text-zinc-400">Coupon Code</p>
                          <p className="break-all font-mono text-base font-bold tracking-wider text-[#651F3C] dark:text-[#D5B36C]">{offer.couponCode}</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="flex shrink-0 items-center gap-1 rounded-lg bg-[#651F3C] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#4D172D] active:scale-95"
                        >
                          {copied ? <FiCheck className="text-emerald-300" /> : <FiCopy />}
                          {copied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="mt-6 flex flex-col gap-2.5">
                    <Link
                      to={offer.buttonLink || "/gallery"}
                      onClick={closeOffer}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#651F3C] via-[#8A2A52] to-[#651F3C] px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#651F3C]/25 hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                      <FiShoppingBag className="text-sm" /> {offer.buttonLabel}
                    </Link>

                    <button
                      type="button"
                      onClick={handleWhatsAppClaim}
                      className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 px-5 py-2.5 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-all active:scale-[0.98]"
                    >
                      <FaWhatsapp className="text-base text-emerald-600" /> Claim on WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Re-Open Badge (if closed, visitor can re-open anytime) */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full border border-[#C5A15B]/40 bg-[#FAF5EE] dark:bg-[#231722] px-4 py-2.5 text-xs font-bold text-[#651F3C] dark:text-[#D5B36C] shadow-[0_8px_25px_rgba(101,31,60,0.2)] backdrop-blur-md transition-all hover:bg-white"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-[#651F3C] text-[10px] text-white">✦</span>
          <span>15% OFF Offer</span>
        </motion.button>
      )}
    </>
  );
}


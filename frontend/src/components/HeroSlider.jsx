import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
// at top
import AnimatedHeroBadge from "./AnimatedHeroBadge.jsx";

// inside JSX, maybe beside title:
<div className="flex items-center gap-3">
  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-floralGreen">
    Bridal Bloom Studio
  </p>
  <AnimatedHeroBadge />
</div>

const slides = [
  {
    id: 1,
    title: "Elegant Centerpieces",
    subtitle: "Handcrafted for your dream event.",
    cta: "Explore Centerpieces",
    href: "/shop?category=bouquets",
    image:
      "https://images.pexels.com/photos/2951305/pexels-photo-2951305.jpeg"
  },
  {
    id: 2,
    title: "Bridal Bouquets that Tell a Story",
    subtitle: "Soft pastels, bold reds or bespoke palettes.",
    cta: "View Bouquets",
    href: "/shop?category=Bouquets",
    image: "https://images.pexels.com/photos/931179/pexels-photo-931179.jpeg"
  },
  {
    id: 3,
    title: "Stage Decor That Glows in Photos",
    subtitle: "Premium flowers & lighting for your big day.",
    cta: "Stage Decorations",
    href: "/shop?category=Stage%20Decoration",
    image: "https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg"
  }
];

const HeroSlider = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const active = slides[index];

  return (
    <section className="relative overflow-hidden bg-floralBg">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-10 md:flex-row md:py-14">
        <div className="relative z-10 w-full md:w-1/2">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.5 }}
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-floralGreen">
                Bridal Bloom Studio
              </p>
              <h1 className="text-3xl font-semibold text-floralMaroon sm:text-4xl">
                {active.title}
              </h1>
              <p className="mt-3 max-w-md text-sm text-slate-600 sm:text-base">
                {active.subtitle}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to={active.href}
                  className="rounded-full bg-floralMaroon px-6 py-2 text-sm font-medium text-white shadow-soft hover:bg-floralMaroon/90"
                >
                  {active.cta}
                </Link>
                <Link
                  to="/shop"
                  className="rounded-full border border-floralMaroon/20 bg-white px-6 py-2 text-sm font-medium text-floralMaroon hover:border-floralMaroon/50"
                >
                  Shop All Flowers
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative w-full md:w-1/2">
          <div className="glass-card relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={active.image}
                src={active.image}
                alt={active.title}
                className="h-64 w-full rounded-2xl object-cover sm:h-80"
                loading="lazy"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
              />
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-floralMaroon/10 via-transparent to-floralGold/15" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.4 },
      scale: { duration: 0.4 },
    },
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.95,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.3 },
    },
  }),
};

export const CarouselSlider = ({
  slides = [],
  autoPlay = true,
  interval = 5000,
  className = '',
}) => {
  // Normalize slides into array of { id, img }
  const normalizedSlides = slides.map((item, idx) => {
    if (typeof item === 'string') {
      return { id: idx + 1, img: item };
    }
    return {
      id: item.id || idx + 1,
      img: item.img || item.image || item.url || '',
    };
  }).filter((s) => Boolean(s.img));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    if (normalizedSlides.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % normalizedSlides.length);
  }, [normalizedSlides.length]);

  const prevSlide = useCallback(() => {
    if (normalizedSlides.length <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + normalizedSlides.length) % normalizedSlides.length);
  }, [normalizedSlides.length]);

  const goToSlide = (idx) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  useEffect(() => {
    if (!autoPlay || isPaused || normalizedSlides.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, isPaused, normalizedSlides.length, interval, nextSlide]);

  if (!normalizedSlides.length) {
    return (
      <div className="grid h-full place-items-center bg-pink-50/50 text-sm text-zinc-400">
        No slides available
      </div>
    );
  }

  const currentSlide = normalizedSlides[currentIndex];

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none group ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentSlide.id || currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={currentSlide.img}
            alt={`Slide ${currentIndex + 1}`}
            className="w-full h-full object-cover image-enhanced"
            loading="lazy"
            decoding="async"
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls (Shown when multiple slides exist) */}
      {normalizedSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 text-zinc-800 dark:text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all shadow-lg"
          >
            <FiChevronLeft className="text-xl" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 text-zinc-800 dark:text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all shadow-lg"
          >
            <FiChevronRight className="text-xl" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center items-center gap-1.5">
            {normalizedSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx
                    ? 'w-6 h-2 bg-pink-500 shadow-md'
                    : 'w-2 h-2 bg-white/70 dark:bg-white/40 hover:bg-white'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CarouselSlider;

import React, { useEffect } from "react";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Lightbox = ({ images, activeIndex, onClose, setActiveIndex }) => {
  useEffect(() => {
    document.body.classList.add("body-no-scroll");
    return () => document.body.classList.remove("body-no-scroll");
  }, []);

  if (!images || images.length === 0) return null;

  const prev = () => {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  };

  const next = () => {
    setActiveIndex((i) => (i + 1) % images.length);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
      <button
        className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white"
        onClick={onClose}
      >
        <FaTimes />
      </button>
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white"
        onClick={prev}
      >
        <FaChevronLeft />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white"
        onClick={next}
      >
        <FaChevronRight />
      </button>
      <img
        src={images[activeIndex]}
        alt=""
        className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain"
      />
    </div>
  );
};

export default Lightbox;

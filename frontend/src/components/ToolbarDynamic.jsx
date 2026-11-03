import React, { useRef, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import useClickOutside from '../hooks/useClickOutside';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const transition = {
  type: 'spring',
  bounce: 0.1,
  duration: 0.25,
};

export default function ToolbarDynamic({ onSearch }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useClickOutside(containerRef, () => {
    setIsOpen(false);
  });

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    if (onSearch) {
      onSearch(query.trim());
    } else {
      navigate(`/gallery?search=${encodeURIComponent(query.trim())}`);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <MotionConfig transition={transition}>
      <div className="relative inline-block z-40" ref={containerRef}>
        <div
          className={`transition-colors duration-200 rounded-full ${
            isOpen
              ? 'border border-[#C5A15B]/50 bg-[#FAF5EF]/95 dark:border-[#493640] dark:bg-[#211820]/95 shadow-lg backdrop-blur-xl'
              : 'border border-transparent bg-transparent hover:bg-[#F5EAE9] dark:hover:bg-[#261B22]/80'
          }`}
        >
          <motion.div
            animate={{
              width: isOpen ? '270px' : '40px',
            }}
            initial={false}
          >
            <div className="overflow-hidden flex items-center h-10 px-1">
              {!isOpen ? (
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  aria-label="Search flowers"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#651F3C] dark:text-[#D5B36C] hover:text-[#4D172D] dark:hover:text-[#C5A15B] transition-colors"
                >
                  <FiSearch className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex items-center space-x-1.5 w-full pr-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                    }}
                    aria-label="Close search"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#651F3C] dark:text-[#D5B36C] hover:text-[#30232A] dark:hover:text-[#FAF5EF] hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
                  >
                    <FiArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="relative w-full">
                    <input
                      className="h-8 w-full bg-transparent px-2 text-xs text-[#30232A] placeholder-[#81747A] dark:text-[#FAF5EF] dark:placeholder-[#8E7A83] outline-none"
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Search bouquets, jadai..."
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}

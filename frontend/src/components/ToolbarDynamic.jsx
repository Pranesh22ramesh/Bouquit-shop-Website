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
          className={`transition-all duration-300 rounded-full ${
            isOpen
              ? 'border border-[#C5A15B] bg-[#FAF5EE]/98 dark:border-[#C5A15B]/80 dark:bg-[#211820]/98 shadow-[0_10px_30px_rgba(101,31,60,0.15)] backdrop-blur-2xl'
              : 'border border-[#C5A15B]/30 bg-white/70 hover:bg-white/95 dark:bg-white/5 dark:border-[#493640] dark:hover:bg-white/10 hover:border-[#C5A15B]/70 shadow-sm backdrop-blur-md'
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
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#651F3C] dark:text-[#D5B36C] hover:scale-110 active:scale-95 transition-all"
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
                      className="h-8 w-full bg-transparent px-2 text-xs font-medium text-[#30232A] placeholder-[#81747A] dark:text-[#FAF5EF] dark:placeholder-[#8E7A83] outline-none"
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Search bouquets, bridal jadai..."
                    />
                  </div>
                  {query.trim() && (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="w-7 h-7 rounded-full bg-[#651F3C] text-white flex items-center justify-center hover:bg-[#4D172D] transition-colors shrink-0"
                      aria-label="Submit search"
                    >
                      <FiSearch className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}

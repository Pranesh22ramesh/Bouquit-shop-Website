import React, { useRef, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import useClickOutside from '../hooks/useClickOutside';
import { ArrowLeft, Search } from 'lucide-react';
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
              ? 'border border-[#E8E5E0] bg-[#FFF9F6]/95 dark:border-zinc-800 dark:bg-[#121212]/95 shadow-lg backdrop-blur-xl'
              : 'border border-transparent bg-transparent hover:bg-[#FCEFF3] dark:hover:bg-zinc-800/80'
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
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:text-[#E85D8E] dark:hover:text-[#E85D8E] transition-colors"
                >
                  <Search className="h-4 w-4" />
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
                    className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="relative w-full">
                    <input
                      className="h-8 w-full bg-transparent px-2 text-xs text-zinc-900 placeholder-zinc-400 dark:text-zinc-100 dark:placeholder-zinc-500 outline-none"
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

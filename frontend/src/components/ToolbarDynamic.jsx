import React, { useRef, useState } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import useClickOutside from '../hooks/useClickOutside';
import { ArrowLeft, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const transition = {
  type: 'spring',
  bounce: 0.1,
  duration: 0.25,
};

function Button({
  children,
  onClick,
  disabled,
  ariaLabel,
}) {
  return (
    <button
      className="relative flex h-9 w-9 shrink-0 scale-100 select-none appearance-none items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 focus-visible:ring-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

export default function ToolbarDynamic({ onSearch }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
        <div className="h-full w-full rounded-2xl border border-pink-200/60 bg-white/90 shadow-md backdrop-blur-xl dark:border-purple-500/30 dark:bg-zinc-900/90">
          <motion.div
            animate={{
              width: isOpen ? '280px' : '96px',
            }}
            initial={false}
          >
            <div className="overflow-hidden p-1.5">
              {!isOpen ? (
                <div className="flex items-center space-x-1.5">
                  <Button
                    onClick={() => navigate(isAuthenticated ? '/my-orders' : '/login')}
                    ariaLabel="User profile"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setIsOpen(true)}
                    ariaLabel="Search flowers"
                  >
                    <Search className="h-4 w-4 text-[#E85D8E]" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                    }}
                    ariaLabel="Close search"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="relative w-full">
                    <input
                      className="h-8 w-full rounded-lg border border-pink-100 bg-transparent px-2.5 text-xs text-zinc-900 placeholder-zinc-400 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500 outline-none focus:border-[#E85D8E]"
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

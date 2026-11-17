import React, { useEffect, useId, useRef } from 'react';
import { FiX } from 'react-icons/fi';

export default function Dialog({ open, onClose, title, children }) {
  const ref = useRef(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!open) { dialog.close(); return; }
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = overflow; previous?.focus?.(); };
  }, [open]);
  return <dialog ref={ref} className="site-dialog" aria-labelledby={id} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === ref.current) { const rect = ref.current.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}>
    <div className="dialog-heading"><h2 id={id}>{title}</h2><button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}><FiX /></button></div>
    {children}
  </dialog>;
}

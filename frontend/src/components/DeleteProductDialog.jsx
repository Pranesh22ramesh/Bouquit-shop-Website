import React from 'react';

const DeleteProductDialog = ({ product, isDeleting, onCancel, onConfirm }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-product-title"
        className="w-full max-w-md animate-scaleIn rounded-2xl bg-white p-6 shadow-2xl dark:border dark:border-gray-700 dark:bg-gray-800"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
          <span className="text-2xl">!</span>
        </div>
        <h2 id="delete-product-title" className="text-xl font-bold text-gray-900 dark:text-white">Delete Product?</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">This action cannot be undone.</p>
        <p className="mt-3 truncate rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">{product.name}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" disabled={isDeleting} onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Cancel</button>
          <button type="button" disabled={isDeleting} onClick={onConfirm} className="flex min-w-24 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-70">
            {isDeleting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductDialog;

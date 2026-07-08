import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const statusStyles = {
  Offer: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  'New Arrival': 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  Normal: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
};

const AdminProductCard = ({ product, onEdit, onDelete }) => (
  <article className="flex overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:block">
    <div className="relative h-auto w-32 flex-none overflow-hidden bg-gray-100 sm:h-52 sm:w-full dark:bg-gray-700">
      {product.image ? (
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>
      )}
      {product.featured && <span className="absolute left-2 top-2 rounded-full bg-rose-600 px-2 py-1 text-[10px] font-bold uppercase text-white">Featured</span>}
    </div>
    <div className="flex min-w-0 flex-1 flex-col p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">{product.category}</p>
      <h3 className="mt-1 truncate text-lg font-bold text-gray-900 dark:text-white">{product.name}</h3>
      <div className="mt-2 flex items-end gap-2">
        <span className="font-bold text-rose-600">₹{(product.offerPrice || product.price).toLocaleString('en-IN')}</span>
        {product.offerPrice && <span className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[product.badge] || statusStyles.Normal}`}>{product.badge || 'Normal'}</span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.status === 'Available' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'}`}>{product.status}</span>
        {(product.analytics?.tags || []).map((tag) => <span key={tag} className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">{tag}</span>)}
      </div>
      {product.analytics && <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">{product.analytics.unitsSold} sold · {product.analytics.reviewCount} reviews · {product.analytics.averageRating || 0}★</p>}
      <div className="mt-auto flex gap-2 pt-4">
        <button type="button" onClick={() => onEdit(product)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 py-2 font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-300"><FaEdit /> Edit</button>
        <button type="button" onClick={() => onDelete(product)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 py-2 font-semibold text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300"><FaTrash /> Delete</button>
      </div>
    </div>
  </article>
);

export default AdminProductCard;

import React from "react";
import { motion } from "framer-motion";

const ProductCard = ({ product, onOpen }) => {
  if (!product) return null;

  const mainImage =
    product.images?.[0] ||
    "https://via.placeholder.com/600x400?text=Event+Flowers";

  const handleClick = () => {
    if (onOpen) onOpen(product);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white/90 shadow-sm ring-1 ring-rose-100 backdrop-blur-sm hover:shadow-xl hover:ring-rose-200"
      onClick={handleClick}
    >
      {/* IMAGE */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={mainImage}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />

        {/* Premium badge */}
        {product.isPremium && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-500/95 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md">
            Premium
          </span>
        )}

        {/* Overlay gradient on hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/40 via-slate-900/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Title + price */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900 line-clamp-2">
              {product.title}
            </h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-rose-500/90">
              {product.category}
            </p>
          </div>

          <p className="shrink-0 text-right text-sm font-semibold text-rose-700">
            ₹
            {product.basePrice?.toLocaleString?.("en-IN") ??
              product.basePrice ??
              "--"}
            <span className="block text-[11px] font-normal text-slate-500">
              Base price
            </span>
          </p>
        </div>

        {/* Short description */}
        {product.description && (
          <p className="text-xs text-slate-600 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Flowers used */}
        {product.flowersUsed?.length > 0 && (
          <p className="mt-1 text-[11px] text-slate-500">
            Flowers:{" "}
            <span className="font-medium">
              {product.flowersUsed.slice(0, 3).join(", ")}
              {product.flowersUsed.length > 3 && "…"}
            </span>
          </p>
        )}

        {/* Footer: size + customizable + button */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-1 text-[10px] text-slate-500">
            {product.size && (
              <span className="rounded-full border border-rose-100 px-2 py-0.5">
                Size: {product.size}
              </span>
            )}

            {(product.isCustomizable ?? true) && (
              <span className="rounded-full border border-emerald-100 bg-emerald-50/80 px-2 py-0.5 text-emerald-700">
                Customizable
              </span>
            )}
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-4 py-2 md:px-3 md:py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
          >
            <span>View &amp; Customize</span>
            <span className="text-[14px]">✨</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

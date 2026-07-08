import React from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../data/products.js";
import { motion } from "framer-motion";

const CategoryGrid = () => {
  const getEmoji = (catName) => {
    if (catName.includes("Bridal")) return "👰";
    if (catName.includes("Centerpieces")) return "🌺";
    if (catName.includes("Stage")) return "🎉";
    if (catName.includes("Dollars")) return "💐";
    if (catName.includes("Bouquets")) return "🌷";
    if (catName.includes("Hair")) return "💇‍♀️";
    return "🌸";
  };

  return (
    <section className="mx-auto mt-8 max-w-6xl px-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-floralMaroon">
          Shop by Moment
        </h2>
        <Link
          to="/shop"
          className="text-xs font-medium text-floralMaroon hover:underline"
        >
          View all products
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {CATEGORIES.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="glass-card flex h-28 flex-col justify-between rounded-2xl p-3 text-xs hover:-translate-y-1 hover:shadow-lg transition"
            >
              <span className="text-2xl">{getEmoji(cat.name)}</span>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500">
                  {cat.name.split(" ")[0]}
                </div>
                <div className="text-[13px] font-semibold text-slate-800">
                  {cat.name}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;

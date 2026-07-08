import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiBarChart2, FiCheckCircle, FiStar } from "react-icons/fi";
import { reviewService } from "../api/reviewService";
import { useAuth } from "../context/AuthContext";

const ProductReviewPanel = ({ product, isDarkMode, onReviewChange }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    try {
      setReviews(await reviewService.list({ productId: product._id || product.id }));
    } catch (error) {
      console.error("Failed to load product reviews", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReviews(); }, [product._id, product.id]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return product.analytics?.averageRating || 0;
    return Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1));
  }, [reviews, product.analytics?.averageRating]);

  const submitReview = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) return toast.error("Please sign in to review this product.");
    if (!rating) return toast.error("Choose a star rating.");
    if (!comment.trim()) return toast.error("Please write a short review.");

    setSubmitting(true);
    try {
      await reviewService.create({ productId: product._id || product.id, author: user?.name || "Customer", rating, comment: comment.trim() });
      setRating(0);
      setComment("");
      await loadReviews();
      await onReviewChange?.();
      toast.success("Your product review has been saved.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save your review.");
    } finally {
      setSubmitting(false);
    }
  };

  const tagStyles = {
    "High Selling": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    Offered: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
    Latest: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    "Top Rated": "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  };

  return (
    <section className={`rounded-2xl border p-4 ${isDarkMode ? "border-gray-700 bg-gray-800/60" : "border-rose-100 bg-white"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold"><FiStar className="text-amber-500" /> Product reviews</p>
          <p className={`mt-1 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            {averageRating ? `${averageRating} out of 5 from ${reviews.length} review${reviews.length === 1 ? "" : "s"}` : "Be the first to review this product"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(product.analytics?.tags || []).map((tag) => <span key={tag} className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${tagStyles[tag] || "bg-gray-100 text-gray-600"}`}>{tag}</span>)}
        </div>
      </div>

      {product.analytics && (
        <div className={`mt-4 grid grid-cols-3 gap-2 rounded-xl p-3 text-center ${isDarkMode ? "bg-gray-900/60" : "bg-[#FFF9F6]"}`}>
          <div><p className="text-lg font-bold text-rose-500">{product.analytics.unitsSold}</p><p className="text-[9px] uppercase tracking-wide opacity-60">Sold</p></div>
          <div><p className="text-lg font-bold text-amber-500">{averageRating || "—"}</p><p className="text-[9px] uppercase tracking-wide opacity-60">Rating</p></div>
          <div><p className="text-lg font-bold text-emerald-500">{product.analytics.score}</p><p className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-wide opacity-60"><FiBarChart2 /> Score</p></div>
        </div>
      )}

      <form className="mt-5" onSubmit={submitReview}>
        <div className="flex items-center gap-1" aria-label="Choose rating">
          {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" onClick={() => setRating(star)} className={`p-1 text-xl transition hover:scale-110 ${star <= rating ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}`} aria-label={`${star} stars`}><FiStar fill={star <= rating ? "currentColor" : "none"} /></button>)}
        </div>
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={3} maxLength={1000} placeholder="How was the freshness, design and delivery?" className={`mt-2 w-full resize-none rounded-xl border p-3 text-sm outline-none focus:border-rose-400 ${isDarkMode ? "border-gray-600 bg-gray-900 text-white" : "border-gray-200 bg-white"}`} />
        <div className="mt-2 flex items-center justify-between gap-3">
          {isAuthenticated ? <p className="flex items-center gap-1 text-[10px] text-emerald-600"><FiCheckCircle /> Reviewing as {user?.name}</p> : <Link to="/login" className="text-xs font-semibold text-rose-600">Sign in to review</Link>}
          <button disabled={submitting} className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50">{submitting ? "Saving…" : "Save review"}</button>
        </div>
      </form>

      <div className="mt-5 space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
        {loading ? <p className="text-xs opacity-60">Loading reviews…</p> : reviews.length ? reviews.slice(0, 5).map((review) => (
          <article key={review._id || review.id} className={`rounded-xl p-3 ${isDarkMode ? "bg-gray-900/60" : "bg-gray-50"}`}>
            <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold">{review.userName || "Customer"}</p><p className="text-xs text-amber-500">{"★".repeat(review.rating)}<span className="text-gray-300">{"★".repeat(5 - review.rating)}</span></p></div>
            <p className={`mt-2 text-xs leading-5 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{review.comment}</p>
          </article>
        )) : <p className="text-xs opacity-60">No reviews yet.</p>}
      </div>
    </section>
  );
};

export default ProductReviewPanel;

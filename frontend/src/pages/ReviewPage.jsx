import React, { useEffect, useMemo, useState } from "react";
import SeoHead from '../seo/SeoHead.jsx';
import { usePageSeo } from '../seo/useSeo.js';
import { toast } from "react-hot-toast";
import ReviewList from "../components/ReviewList.jsx";
import { useAuth } from "../context/AuthContext";
import { reviewService } from "../api/reviewService";
import { SITE_EVENTS, subscribeToSiteEvent } from "../lib/siteEvents";
import { subscribeToTable } from "../lib/supabaseRealtime";

const createEmptyForm = (user) => ({
  id: null,
  author: user?.name || "",
  rating: 0,
  text: "",
  imageFile: null,
  imagePreview: null,
});

const mapReview = (review) => ({
  id: review._id,
  author: review.userName || "Anonymous",
  rating: review.rating,
  text: review.comment,
  date: new Date(review.createdAt).toLocaleDateString(),
  imagePreview: review.image,
  userId: review.userId,
  isPinned: review.isPinned,
});

const ReviewPage = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState(createEmptyForm(user));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const isEditing = useMemo(() => Boolean(form.id), [form.id]);

  const loadReviews = async () => {
    try {
      const data = await reviewService.list();
      setReviews(data.map(mapReview));
    } catch (error) {
      console.error("Failed to load reviews", error);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    setForm((current) => (current.id ? current : { ...current, author: user?.name || current.author }));
  }, [user?.name]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => subscribeToSiteEvent(SITE_EVENTS.reviewsChanged, () => loadReviews()), []);

  useEffect(() => {
    const unsubscribe = subscribeToTable({
      table: "Review",
      onChange: loadReviews,
      channelName: "reviews-page",
    });

    return unsubscribe;
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: name === "rating" ? Number(value) : value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setForm((current) => ({ ...current, imageFile: null, imagePreview: current.id ? current.imagePreview : null }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setForm((current) => ({
        ...current,
        imageFile: file,
        imagePreview: loadEvent.target?.result || null,
      }));
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const next = {};
    if (!form.author.trim()) next.author = "Please enter your name.";
    if (!form.text.trim()) next.text = "Please share a few words about your experience.";
    if (!form.rating || form.rating < 1 || form.rating > 5) next.rating = "Please choose a rating between 1 and 5.";
    return next;
  };

  const resetForm = () => {
    setForm(createEmptyForm(user));
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        const updated = await reviewService.update(form.id, {
          rating: form.rating,
          comment: form.text,
          userName: form.author,
        });

        setReviews((current) => current.map((review) => (review.id === form.id ? mapReview(updated) : review)));
        toast.success("Review updated successfully");
      } else {
        const created = await reviewService.create({
          rating: form.rating,
          comment: form.text,
          author: form.author,
          imageFile: form.imageFile,
        });

        setReviews((current) => [mapReview(created), ...current]);
        toast.success("Review submitted! Thank you.");
      }

      resetForm();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await reviewService.remove(id);
      setReviews((current) => current.filter((review) => review.id !== id));
      toast.success("Review deleted");
      if (form.id === id) resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete review");
    }
  };

  const handleEdit = (review) => {
    setForm({
      id: review.id,
      author: review.author,
      rating: review.rating,
      text: review.text,
      imageFile: null,
      imagePreview: review.imagePreview,
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`min-h-screen px-4 py-10 transition-colors ${isDarkMode ? "bg-[#171116] text-[#FAF5EF]" : "bg-[#FAF5EF] text-[#30232A]"}`}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C5A15B]">Customer stories</p>
          <h1 className={`mt-2 text-3xl font-serif font-bold ${isDarkMode ? "text-[#FAF5EF]" : "text-[#651F3C]"}`}>Reviews & Experiences</h1>
          <p className={`mt-3 max-w-2xl text-sm leading-7 ${isDarkMode ? "text-[#C9B8BF]" : "text-[#51454B]"}`}>
            Share your experience with our bridal flowers and bouquets. Pinned reviews appear first automatically.
          </p>
        </div>

        <div className={`mb-8 rounded-[2rem] border p-6 shadow-lg ${isDarkMode ? "border-[#493640] bg-[#261B22]" : "border-[#E8DDD5] bg-white shadow-sm"}`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className={`text-xl font-serif font-bold ${isDarkMode ? "text-[#FAF5EF]" : "text-[#651F3C]"}`}>
              {isEditing ? "Edit your review" : "Write a review"}
            </h2>
            {isEditing && (
              <button type="button" onClick={resetForm} className="rounded-full border border-[#E8DDD5] px-4 py-2 text-sm font-medium text-[#651F3C] hover:bg-[#F5EAE9]">
                Cancel edit
              </button>
            )}
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? "text-[#FAF5EF]" : "text-[#30232A]"}`}>Your name</label>
                <input
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-xl border px-3 py-2 text-sm outline-none ${errors.author ? "border-red-400" : isDarkMode ? "border-[#493640] bg-[#171116] text-white" : "border-[#E8DDD5] bg-[#FAF5EF] text-[#30232A] focus:border-[#651F3C]"}`}
                />
                {errors.author && <p className="mt-1 text-xs text-red-500">{errors.author}</p>}
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? "text-[#FAF5EF]" : "text-[#30232A]"}`}>Rating</label>
                <div className="mt-2 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleChange({ target: { name: "rating", value: star } })}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-lg transition-transform hover:scale-110 ${form.rating >= star ? "bg-[#C5A15B] text-white shadow-sm" : "bg-[#F5EAE9] text-[#81747A]"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {errors.rating && <p className="mt-1 text-xs text-red-500">{errors.rating}</p>}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? "text-[#FAF5EF]" : "text-[#30232A]"}`}>Your review</label>
              <textarea
                name="text"
                rows={4}
                value={form.text}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-xl border px-3 py-2 text-sm outline-none ${errors.text ? "border-red-400" : isDarkMode ? "border-[#493640] bg-[#171116] text-white" : "border-[#E8DDD5] bg-[#FAF5EF] text-[#30232A] focus:border-[#651F3C]"}`}
              />
              {errors.text && <p className="mt-1 text-xs text-red-500">{errors.text}</p>}
            </div>

            {!isEditing && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-[#C5A15B]/50 bg-[#F5EAE9] px-4 py-2 text-xs font-medium text-[#651F3C] hover:bg-[#FAF5EF] transition">
                  Upload photo
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                {form.imagePreview && <img src={form.imagePreview} alt="Review preview" className="h-20 w-20 rounded-xl object-cover border border-[#E8DDD5]" />}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-[#651F3C] hover:bg-[#4D172D] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#651F3C]/20 transition disabled:opacity-70"
            >
              {submitting ? "Saving..." : isEditing ? "Update review" : "Submit review"}
            </button>
          </form>
        </div>

        <div className={`rounded-[2rem] border p-6 shadow-md ${isDarkMode ? "border-[#493640] bg-[#261B22]/90" : "border-[#E8DDD5] bg-white/90"}`}>
          <h2 className={`mb-4 text-xl font-serif font-bold ${isDarkMode ? "text-[#FAF5EF]" : "text-[#651F3C]"}`}>What others are saying</h2>
          <ReviewList reviews={reviews} currentUser={user} onDelete={handleDelete} onEdit={handleEdit} />
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;

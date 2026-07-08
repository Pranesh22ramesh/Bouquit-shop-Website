import React, { useState } from "react";

const ReviewForm = ({ onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  return (
    <form
      className="space-y-2 rounded-xl border border-dashed border-floralMaroon/30 bg-white p-3 text-xs"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSubmit({ rating, text });
        setRating(0);
        setText("");
      }}
    >
      <div className="flex gap-3">
        <div>
          <label className="text-[11px] font-medium text-slate-600">
            Rating
          </label>
          <select
            className="mt-1 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-floralMaroon"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            <option value={0}>Select rating</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r}★
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-[11px] font-medium text-slate-600">
          Your review
        </label>
        <textarea
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-floralMaroon"
          placeholder="Share about freshness, delivery, customization etc."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="rounded-full bg-floralMaroon px-4 py-1.5 text-[11px] font-medium text-white"
      >
        Submit Review
      </button>
    </form>
  );
};

export default ReviewForm;

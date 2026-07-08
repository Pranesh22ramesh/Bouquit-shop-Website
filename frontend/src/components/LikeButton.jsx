// src/components/LikeButton.jsx
import React, { useEffect, useState } from "react";

const STORAGE_KEY = "midhunya_liked_photos_v1";

export function getLikedSet() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function saveLikedSet(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

const LikeButton = ({ id, size = 5, onChange }) => {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const set = getLikedSet();
    setLiked(set.has(id));
  }, [id]);

  const toggle = (e) => {
    e.stopPropagation();
    const set = getLikedSet();
    if (set.has(id)) {
      set.delete(id);
      setLiked(false);
    } else {
      set.add(id);
      setLiked(true);
    }
    saveLikedSet(set);
    if (typeof onChange === "function") onChange(Array.from(set));
  };

  return (
    <button
      aria-pressed={liked}
      title={liked ? "Unlike" : "Like"}
      onClick={toggle}
      className={`inline-flex items-center justify-center p-1 rounded-full transition-transform transform hover:scale-110 focus:outline-none ${
        liked ? "text-rose-600" : "text-rose-400"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-${size} w-${size}`}
        viewBox="0 0 24 24"
        fill={liked ? "#E11D48" : "none"}
        stroke={liked ? "#E11D48" : "currentColor"}
        strokeWidth="1.2"
      >
        <path d="M12 21s-7-4.35-9-7.1C-1 8.9 4 4 12 8c8-4 13 1 9 5.9C19 16.65 12 21 12 21z" />
      </svg>
    </button>
  );
};

export default LikeButton;

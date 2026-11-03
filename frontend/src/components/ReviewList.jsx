import React from "react";

const ReviewList = ({ reviews, currentUser, onDelete, onEdit }) => {
  if (!reviews || reviews.length === 0) {
    return <p className="text-xs text-[#81747A] dark:text-[#8E7A83]">No reviews yet. Be the first to share your experience.</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map((rev) => {
        const canManage = currentUser && (currentUser.isAdmin || (rev.userId && currentUser._id === rev.userId));

        return (
          <div key={rev.id} className="rounded-xl border border-[#E8DDD5] dark:border-[#493640] bg-white dark:bg-[#171116] p-4 flex gap-4 transition shadow-xs">
            {rev.imagePreview && (
              <img
                src={rev.imagePreview}
                alt="Customer order"
                className="h-16 w-16 rounded-lg object-cover border border-[#E8DDD5] dark:border-[#493640] flex-shrink-0"
              />
            )}

            <div className="flex-1">
              <div className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#30232A] dark:text-[#FAF5EF]">{rev.author}</span>
                  {rev.isPinned && (
                    <span className="rounded-full bg-[#FAF5EF] border border-[#C5A15B]/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#C5A15B]">
                      Featured
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#81747A] dark:text-[#8E7A83]">{rev.date}</span>
              </div>
              <div className="flex mt-1 text-base">
                {[...Array(5)].map((_, index) => (
                  <span key={index} className={`${index < rev.rating ? "text-[#C5A15B]" : "text-gray-300 dark:text-gray-700"}`}>
                    ★
                  </span>
                ))}
              </div>
              <p className="mt-2 text-sm text-[#51454B] dark:text-[#C9B8BF] leading-relaxed">{rev.text}</p>
            </div>

            {canManage && (
              <div className="flex items-start gap-1">
                <button
                  onClick={() => onEdit?.(rev)}
                  className="self-start p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition"
                  title="Edit Review"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(rev.id)}
                  className="self-start p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition"
                  title="Delete Review"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList;

import React from "react";

const ImageModal = ({ image, onClose }) => {
  if (!image) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
      <div className="relative max-w-2xl w-full p-4">

        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white text-black px-3 py-1 rounded hover:bg-gray-200"
        >
          ×
        </button>

        <img
          src={image.url}
          alt={image.title}
          className="w-full h-auto rounded-lg shadow-xl"
        />

        <h2 className="text-white mt-4 text-center text-xl font-semibold">
          {image.title}
        </h2>
      </div>
    </div>
  );
};

export default ImageModal;

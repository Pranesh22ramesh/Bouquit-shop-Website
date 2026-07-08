import React, { useState } from "react";
import { GALLERY_CATEGORIES, GALLERY_IMAGES } from "../data/galleryData.js";
import ImageModal from "../components/ImageModal.jsx";

const GalleryPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredImages =
    selectedCategory === "All"
      ? GALLERY_IMAGES
      : GALLERY_IMAGES.filter((img) => img.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#fff9f7] pt-24 px-6 pb-16">
      <h1 className="text-4xl font-bold text-center mb-10 text-rose-700">
        Photo Gallery
      </h1>

      {/* FILTER BUTTONS */}
      <div className="flex justify-center gap-4 mb-10">
        {GALLERY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full transition border 
            ${
              selectedCategory === cat
                ? "bg-rose-600 text-white border-rose-600"
                : "bg-white text-rose-600 border-rose-600 hover:bg-rose-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* IMAGE GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredImages.map((img) => (
          <div
            key={img.id}
            onClick={() => setSelectedImage(img)}
            className="cursor-pointer group"
          >
            <img
              src={img.url}
              alt={img.title}
              className="w-full h-48 object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        ))}
      </div>

      {/* MODAL */}
      <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
};

export default GalleryPage;

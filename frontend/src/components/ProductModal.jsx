import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import Lightbox from "./Lightbox.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "../api/axios.js";
import toast from "react-hot-toast";
import ReviewForm from "./ReviewForm.jsx";
import ReviewList from "./ReviewList.jsx";
import { useNavigate, useLocation } from "react-router-dom";

const COLOR_OPTIONS = [
  "Classic Red",
  "Soft Pastel",
  "Ivory & Gold",
  "Multicolor"
];

const FLOWER_OPTIONS = [
  { name: "Rose", premium: false, surcharge: 0 },
  { name: "Jasmine", premium: false, surcharge: 0 },
  { name: "Orchid", premium: true, surcharge: 300 },
  { name: "Lotus", premium: true, surcharge: 400 },
  { name: "Marigold", premium: false, surcharge: 0 }
];

const STONE_OPTIONS = [
  { name: "Crystals", surcharge: 250 },
  { name: "Pearl Beads", surcharge: 200 },
  { name: "Kundan Highlights", surcharge: 300 }
];

const ProductModal = ({ product, open, onClose }) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [selectedVariant, setSelectedVariant] = useState("classic");
  const [reviews, setReviews] = useState([]);

  const [primaryColor, setPrimaryColor] = useState(COLOR_OPTIONS[0]);
  const [secondaryColors, setSecondaryColors] = useState([]);
  const [selectedFlowers, setSelectedFlowers] = useState(
    product ? product.flowersUsed : []
  );
  const [stones, setStones] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [referenceImage, setReferenceImage] = useState(null);

  useEffect(() => {
    if (open && product) {
      axios.get(`/reviews?productId=${product.id}`).then((res) => {
        const mapped = res.data.map(r => ({
          id: r._id || r.id,
          userId: r.userId,
          author: r.userName,
          date: new Date(r.createdAt).toLocaleDateString(),
          rating: r.rating,
          text: r.comment,
          imagePreview: r.image,
          isPinned: r.isPinned
        }));
        setReviews(mapped);
      }).catch(err => console.error(err));
    }
  }, [open, product]);

  const handleReviewSubmit = async (review) => {
    if (!user) {
      toast.error("Please login to submit a review.");
      return;
    }
    try {
      const { data } = await axios.post("/reviews", {
        productId: product.id,
        rating: review.rating,
        comment: review.text,
      });
      const newReview = {
          id: data._id || data.id,
          userId: data.userId,
          author: data.userName,
          date: new Date(data.createdAt).toLocaleDateString(),
          rating: data.rating,
          text: data.comment,
          imagePreview: data.image,
          isPinned: data.isPinned
      };
      setReviews([newReview, ...reviews]);
      toast.success("Review submitted!");
    } catch (err) {
      toast.error("Failed to submit review.");
    }
  };

  if (!product) return null;

  const handleToggleSecondaryColor = (color) => {
    setSecondaryColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleFlowerToggle = (flower) => {
    setSelectedFlowers((prev) =>
      prev.includes(flower)
        ? prev.filter((f) => f !== flower)
        : [...prev, flower]
    );
  };

  const handleStoneToggle = (name) => {
    setStones((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleReferenceUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setReferenceImage({ file, url, name: file.name });
  };

  const pricing = useMemo(() => {
    let base = product.basePrice || product.price || 0;
    
    if (product.hasVariants && product.variants?.[selectedVariant]?.price) {
      base = Number(product.variants[selectedVariant].price);
    }

    let customization = 0;

    // Stone surcharges
    STONE_OPTIONS.forEach((opt) => {
      if (stones.includes(opt.name)) customization += opt.surcharge;
    });

    // Premium flowers
    FLOWER_OPTIONS.forEach((opt) => {
      if (selectedFlowers.includes(opt.name) && opt.premium) {
        customization += opt.surcharge;
      }
    });

    // Multicolor surcharge
    if (secondaryColors.length >= 2 || primaryColor === "Multicolor") {
      customization += 200;
    }

    const itemPrice = base + customization;
    const totalPrice = itemPrice * quantity;

    return { base, customization, itemPrice, totalPrice };
  }, [product, primaryColor, secondaryColors, selectedFlowers, stones, quantity]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add to cart");
      onClose();
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    const id = `cart_${Date.now()}`;
    const payload = {
      id,
      productId: product.id,
      title: product.title,
      thumbnail: product.images[0],
      quantity,
      pricing,
      totalPrice: pricing.totalPrice,
      customization: {
        variant: product.hasVariants ? selectedVariant : null,
        primaryColor,
        secondaryColors,
        selectedFlowers,
        stones,
        notes,
        referenceImageName: referenceImage?.name || null
      },
      referenceImagePreview: referenceImage?.url || null
    };
    addItem(payload);
    toast.success("Added to cart with your customizations ✨");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="glass-card flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden md:flex-row"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <div className="relative flex-1 bg-black/5">
              <button
                className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-2 text-xs text-white md:hidden"
                onClick={onClose}
              >
                <FaTimes />
              </button>
              <div
                className="group relative h-64 cursor-zoom-in overflow-hidden md:h-full"
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={product.images[activeImageIndex]}
                  alt={product.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-medium text-white">
                  Tap to view fullscreen
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto bg-white/80 p-2">
                {product.images.map((img, idx) => (
                  <button
                    key={img}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-14 w-14 flex-none overflow-hidden rounded-xl border ${
                      idx === activeImageIndex
                        ? "border-floralMaroon"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 text-xs sm:text-sm">
              <div className="hidden justify-end md:flex">
                <button
                  className="rounded-full bg-slate-100 p-1.5 text-xs text-slate-500 hover:bg-slate-200"
                  onClick={onClose}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="text-[11px] uppercase tracking-wide text-slate-500">
                {product.category}
              </div>
              <h2 className="mt-1 text-lg font-semibold text-slate-800">
                {product.title}
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                {product.hasVariants && product.variants?.[selectedVariant]?.description
                  ? product.variants[selectedVariant].description
                  : product.description}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Size/Length: {product.size}
              </p>

              {product.hasVariants && (
                <div className="mt-3">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Select Variant
                  </h3>
                  <div className="mt-1 flex flex-col gap-2">
                    {["classic", "premium", "luxury"].map((variant) => {
                      if (!product.variants?.[variant]?.enabled || !product.variants?.[variant]?.price) return null;
                      return (
                        <label
                          key={variant}
                          className={`flex cursor-pointer items-center justify-between rounded-xl border p-2 text-xs transition ${
                            selectedVariant === variant
                              ? "border-floralMaroon bg-floralMaroon/5 shadow-sm"
                              : "border-slate-200 bg-white hover:border-floralMaroon/30"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="variant"
                              value={variant}
                              checked={selectedVariant === variant}
                              onChange={() => setSelectedVariant(variant)}
                              className="h-4 w-4 accent-floralMaroon"
                            />
                            <span className="font-semibold capitalize text-slate-700">
                              {variant}
                            </span>
                          </div>
                          <span className="font-medium text-floralMaroon">
                            ₹{Number(product.variants[variant].price).toLocaleString("en-IN")}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Customization options */}
              <div className="mt-3 space-y-3">
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Color Palette
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setPrimaryColor(c)}
                        className={`rounded-full border px-3 py-1 text-[11px] ${
                          primaryColor === c
                            ? "border-floralMaroon bg-floralMaroon text-white"
                            : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Secondary Colors
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {COLOR_OPTIONS.slice(0, 3).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleToggleSecondaryColor(c)}
                        className={`rounded-full border px-3 py-1 text-[11px] ${
                          secondaryColors.includes(c)
                            ? "border-floralGreen bg-floralGreen text-white"
                            : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Flower Preferences
                  </h3>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {FLOWER_OPTIONS.map((fl) => (
                      <label
                        key={fl.name}
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1 text-[11px]"
                      >
                        <input
                          type="checkbox"
                          className="h-3 w-3 rounded border-slate-300"
                          checked={selectedFlowers.includes(fl.name)}
                          onChange={() => handleFlowerToggle(fl.name)}
                        />
                        <span className="flex-1">
                          {fl.name}{" "}
                          {fl.premium && (
                            <span className="text-[10px] text-floralMaroon">
                              +₹{fl.surcharge}
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Stones & Beads
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {STONE_OPTIONS.map((st) => (
                      <button
                        key={st.name}
                        type="button"
                        onClick={() => handleStoneToggle(st.name)}
                        className={`rounded-full border px-3 py-1 text-[11px] ${
                          stones.includes(st.name)
                            ? "border-floralGold bg-floralGold text-white"
                            : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        {st.name} +₹{st.surcharge}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Reference Photo (Optional)
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <label className="cursor-pointer rounded-full border border-dashed border-floralMaroon/60 bg-white px-3 py-1.5 text-[11px] font-medium text-floralMaroon">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleReferenceUpload}
                      />
                    </label>
                    {referenceImage && (
                      <span className="truncate text-[11px] text-slate-600">
                        {referenceImage.name}
                      </span>
                    )}
                  </div>
                  {referenceImage && (
                    <img
                      src={referenceImage.url}
                      alt="Reference"
                      className="mt-2 h-20 w-20 rounded-xl object-cover"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Quantity
                    </h3>
                    <div className="mt-1 inline-flex items-center rounded-full border border-slate-200 bg-white">
                      <button
                        type="button"
                        className="px-3 py-1 text-sm"
                        onClick={() =>
                          setQuantity((q) => Math.max(1, q - 1))
                        }
                      >
                        -
                      </button>
                      <span className="px-3 text-sm">{quantity}</span>
                      <button
                        type="button"
                        className="px-3 py-1 text-sm"
                        onClick={() => setQuantity((q) => q + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Custom Notes
                    </h3>
                    <textarea
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-floralMaroon"
                      placeholder="Mention dress color, theme, special requests..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-floralBg/90 p-3 text-xs">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Price Breakdown
                  </h3>
                  <div className="mt-1 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Base price</span>
                      <span>₹{pricing.base.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customization</span>
                      <span>
                        {pricing.customization > 0
                          ? `+₹${pricing.customization.toLocaleString(
                              "en-IN"
                            )}`
                          : "No extra"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Item total</span>
                      <span>₹{pricing.itemPrice.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="mt-1 flex justify-between border-t border-dashed border-slate-200 pt-1 font-semibold text-floralMaroon">
                      <span>Grand total x {quantity}</span>
                      <span>
                        ₹{pricing.totalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="mt-2 w-full rounded-full bg-floralMaroon py-2 text-sm font-medium text-white shadow-soft hover:bg-floralMaroon/90"
                >
                  Add to Cart
                </button>

                {/* Reviews Section */}
                <div className="mt-8 pt-4 border-t border-slate-200">
                  <h3 className="text-[13px] font-semibold uppercase tracking-wide text-slate-500 mb-4">
                    Product Ratings & Reviews
                  </h3>
                  <ReviewList reviews={reviews} currentUser={user} onDelete={() => {}} />
                  <div className="mt-4">
                    <ReviewForm onSubmit={handleReviewSubmit} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {lightboxOpen && (
            <Lightbox
              images={product.images}
              activeIndex={activeImageIndex}
              setActiveIndex={setActiveImageIndex}
              onClose={() => setLightboxOpen(false)}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;

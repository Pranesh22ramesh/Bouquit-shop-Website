import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiFeather,
  FiHeart,
  FiShoppingBag,
  FiStar,
  FiTruck,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios from "../api/axios";
import { galleryService } from "../api/galleryService";
import { useCart } from "../context/CartContext";
import { SITE_EVENTS, subscribeToSiteEvent } from "../lib/siteEvents";
import { subscribeToTable } from "../lib/supabaseRealtime";
import SeoHead from "../seo/SeoHead.jsx";
import { usePageSeo } from "../seo/useSeo.js";
import OfferPopupModal from "../components/OfferPopupModal.jsx";

// ── Default Occasion Badges (Hasfarm 6 Occasions) ──
const defaultHomeOccasionTiles = [
  { id: "occasion-1", name: "Birthday", icon: "🎂", link: "/gallery?occasion=birthday" },
  { id: "occasion-2", name: "Anniversary", icon: "💖", link: "/gallery?occasion=anniversary" },
  { id: "occasion-3", name: "Congratulations", icon: "🎉", link: "/gallery?occasion=congratulations" },
  { id: "occasion-4", name: "Thank You", icon: "🌹", link: "/gallery?occasion=thankyou" },
  { id: "occasion-5", name: "Sympathy", icon: "🪷", link: "/gallery?occasion=sympathy" },
  { id: "occasion-6", name: "New Baby", icon: "👑", link: "/gallery?occasion=newbaby" },
];

// ── 4 Trust Capsules ──
const trustCapsules = [
  {
    id: "capsule-1",
    title: "SAME DAY DELIVERY",
    subtitle: "Order before 2:30PM",
    icon: <FiTruck className="text-base sm:text-lg text-[#651F3C] dark:text-[#D5B36C]" />,
  },
  {
    id: "capsule-2",
    title: "FRESH FROM OUR FARMS",
    subtitle: "Handpicked with care",
    icon: <FiFeather className="text-base sm:text-lg text-[#78836B] dark:text-[#A3B19B]" />,
  },
  {
    id: "capsule-3",
    title: "EXPERT FLORISTS",
    subtitle: "Crafted by professionals",
    icon: <FiHeart className="text-base sm:text-lg text-[#E07558] dark:text-[#E07558]" />,
  },
  {
    id: "capsule-4",
    title: "HAPPINESS GUARANTEED",
    subtitle: "Your satisfaction, always",
    icon: <FiCheck className="text-base sm:text-lg text-[#287A50] dark:text-[#52B788]" />,
  },
];

// ── Default Collections (Hasfarm 4 cards) ──
const defaultCollections = [
  {
    id: "col-1",
    title: "BOUQUETS",
    startingPrice: "From ₹650",
    image: "/gallery/bouquet/bouquet1.jpg",
    link: "/gallery?category=bouquets",
  },
  {
    id: "col-2",
    title: "HAT BOXES",
    startingPrice: "From ₹750",
    image: "/gallery/bouquet/bouquet13.jpg",
    link: "/gallery?category=bouquets",
  },
  {
    id: "col-3",
    title: "PLANTS & BRIDAL",
    startingPrice: "From ₹1,200",
    image: "/gallery/bridal/flower11.jpg",
    link: "/gallery?category=bridal",
  },
  {
    id: "col-4",
    title: "GIFT HAMPERS",
    startingPrice: "From ₹1,500",
    image: "/gallery/bouquet/bouquet10.jpg",
    link: "/gallery?category=garlands",
  },
];

const defaultDeliveryBanner = {
  title: "Same Day Flower Delivery",
  subtitle: "Beautiful flowers at your doorstep, right on time. We deliver all over Karur and Tamil Nadu.",
  buttonLabel: "Order on WhatsApp →",
  buttonLink: "https://wa.me/919942071721?text=Hello%20MIDHUNYAS%20Petals!%20I%20would%20like%20to%20order%20same%20day%20flower%20delivery.",
  image: "/gallery/bouquet/bouquet15.jpg",
};

const defaultMidBanner = {
  eyebrow: "FLOWERS THAT TELL BEAUTIFUL STORIES",
  title: "Flowers That Tell Beautiful Stories",
  subtitle: "We source the finest blooms and design with heart to bring beauty, joy and meaning to every moment.",
  buttonLabel: "Our Story 🌸",
  buttonLink: "/about",
  image: "/gallery/bouquet/bouquet12.jpg",
};

const defaultOfferPopup = {
  enabled: true,
  badge: "LIMITED TIME EXCLUSIVE OFFER ✦",
  title: "Flat 15% OFF On Your Order",
  subtitle: "Welcome to MIDHUNYAS Petals & Bridal Flowers",
  description: "Handcrafted bridal flowers, luxury bouquets, and elegant stage decor. Fresh blossoms harvested daily across Karur & Tamil Nadu.",
  couponCode: "MIDHUNYAS15",
  buttonLabel: "Claim 15% Off & Shop Now →",
  buttonLink: "/gallery",
  whatsappMessage: "Hello MIDHUNYAS! I would like to claim 15% OFF with coupon code MIDHUNYAS15 for my order.",
  image: "/gallery/bouquet/bouquet13.jpg",
};

const defaultContent = {
  heroHeadline1: "BIGGER.",
  heroHeadline2: "BRIGHTER. 🌸",
  heroHeadline3: "BETTER.",
  heroDescription:
    "Thoughtfully designed flowers and gifts that celebrate life, nature and every meaningful moment.",
  primaryButtonLabel: "SHOP FLOWERS 🌸",
  primaryButtonLink: "/gallery",
  banners: [
    "/gallery/bouquet/bouquet13.jpg",
    "/gallery/bouquet/bouquet1.jpg",
    "/gallery/bouquet/bouquet12.jpg",
    "/gallery/bouquet/bouquet4.jpg",
  ],
  featuredProductIds: [],
  occasionTiles: defaultHomeOccasionTiles,
  collections: defaultCollections,
  deliveryBanner: defaultDeliveryBanner,
  midBanner: defaultMidBanner,
  offerPopup: defaultOfferPopup,
};

const fallbackProducts = [
  { _id: "rose-basket", name: "Sunburst Radiance", category: "Bouquets", price: 1499, offerPrice: 1299, image: "/gallery/bouquet/bouquet1.jpg", rating: 5, reviewsCount: 94 },
  { _id: "pastel-wrap", name: "Peach Blossom Hat Box", category: "Hat Boxes", price: 1899, offerPrice: 1699, image: "/gallery/bouquet/bouquet13.jpg", rating: 5, reviewsCount: 88 },
  { _id: "celebration", name: "Bridal Jadai Crown", category: "Bridal Flowers", price: 2499, offerPrice: 2299, image: "/gallery/bridal/flower11.jpg", rating: 5, reviewsCount: 76 },
  { _id: "white-lily", name: "Artisan Gift Hamper", category: "Gift Hampers", price: 2199, offerPrice: 1999, image: "/gallery/bouquet/bouquet10.jpg", rating: 5, reviewsCount: 62 },
];

const reveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};

// ── Hasfarm Compact Product Card ──
const HasfarmProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const image = product.image || product.images?.[0] || "/gallery/bouquet/bouquet1.jpg";
  const price = Number(product.offerPrice || product.price || 1499);
  const originalPrice = product.offerPrice ? Number(product.price) : null;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addItem({
        productId: product._id || product.id,
        quantity: 1,
        price,
        image,
        name: product.name,
      });
      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.error("Could not add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(`/product/${product._id || product.id}`)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] sm:rounded-[22px] border border-[#F0DFD5] bg-[#FBF0EA] p-3 shadow-xs hover:shadow-lg hover:border-[#C5A15B] transition-all dark:border-[#493640] dark:bg-[#231722] cursor-pointer"
    >
      <div>
        {/* Photo Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white dark:bg-[#1E1420]">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 image-enhanced"
          />
          <Link
            to="/favorites"
            onClick={(e) => e.stopPropagation()}
            aria-label="Wishlist"
            className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-[#30232A] shadow-xs hover:bg-[#651F3C] hover:text-white transition-colors dark:bg-[#1E1420]/90 dark:text-white"
          >
            <FiHeart className="text-xs" />
          </Link>
        </div>

        {/* Product Details */}
        <div className="mt-2.5">
          <h3 className="font-serif text-sm sm:text-base font-bold text-[#30232A] dark:text-[#FAF1EC] truncate">
            {product.name}
          </h3>

          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-[#C5A15B]">
            {Array.from({ length: 5 }).map((_, i) => (
              <FiStar key={i} fill="currentColor" className="text-[10px]" />
            ))}
            <span className="ml-1 text-[9px] text-[#81747A] dark:text-zinc-400">
              ({product.reviewsCount || 86})
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-bold text-[#651F3C] dark:text-[#D5B36C]">
              ₹{price.toLocaleString("en-IN")}
            </span>
            {originalPrice && (
              <span className="text-[11px] text-[#81747A] line-through">
                ₹{originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Direct Add to Cart Action */}
      <button
        type="button"
        disabled={isAdding}
        onClick={handleAddToCart}
        className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#651F3C] py-2 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs hover:bg-[#4D172D] active:scale-[0.98] transition-all dark:bg-[#651F3C] dark:hover:bg-[#C5A15B] dark:hover:text-[#30232A]"
      >
        <FiShoppingBag className="text-xs" />
        {isAdding ? "Adding..." : "Add to Cart"}
      </button>
    </motion.article>
  );
};

const HomePage = () => {
  const pageSeo = usePageSeo("home");
  const [content, setContent] = useState(defaultContent);
  const [allProducts, setAllProducts] = useState([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const loadHome = async () => {
    try {
      const [contentRes, galleryRes] = await Promise.all([
        axios.get("/content/home-highlight"),
        galleryService.list({ limit: 40 }),
      ]);
      const nextContent = { ...defaultContent, ...(contentRes.data || {}) };
      setContent(nextContent);
      const list = galleryRes.products || galleryRes.data?.products || [];
      setAllProducts(list.length ? list : fallbackProducts);
    } catch (error) {
      console.error("Failed to load home content", error);
      setAllProducts(fallbackProducts);
    }
  };

  useEffect(() => { loadHome(); }, []);
  useEffect(() => subscribeToSiteEvent(SITE_EVENTS.contentChanged, ({ key }) => { if (!key || key === "home-highlight") loadHome(); }), []);
  useEffect(() => subscribeToSiteEvent(SITE_EVENTS.galleryChanged, loadHome), []);
  useEffect(() => {
    const unsubscribers = [
      subscribeToTable({ table: "ContentSection", filter: "key=eq.home-highlight", onChange: loadHome, channelName: "home-content" }),
      subscribeToTable({ table: "Product", onChange: loadHome, channelName: "home-products" }),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe?.());
  }, []);

  const heroImages = useMemo(() => {
    if (content.banners && content.banners.length > 0) return content.banners;
    return defaultContent.banners;
  }, [content.banners]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % heroImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const collections = useMemo(() => {
    return content.collections?.length ? content.collections : defaultCollections;
  }, [content.collections]);

  const occasions = useMemo(() => {
    return content.occasionTiles?.length ? content.occasionTiles : defaultHomeOccasionTiles;
  }, [content.occasionTiles]);

  const bestSellers = useMemo(() => {
    if (content.featuredProductIds?.length && allProducts.length) {
      const byId = new Map(allProducts.map((p) => [p._id, p]));
      const featured = content.featuredProductIds.map((id) => byId.get(id)).filter(Boolean);
      if (featured.length) return featured.slice(0, 4);
    }
    return allProducts.slice(0, 4);
  }, [allProducts, content.featuredProductIds]);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    toast.success("Welcome to our floral community! Enjoy 10% off your first order.");
    setNewsletterEmail("");
  };

  return (
    <div className="relative overflow-hidden bg-[#FAF5EF] text-[#30232A] transition-colors dark:bg-[#171116] dark:text-[#FAF1EC]">
      <SeoHead seoOverride={pageSeo} breadcrumbs={[{ name: "Home", url: "/" }]} />

      {/* ── 0. POPUP OFFER POSTER ON LOAD / REFRESH ── */}
      <OfferPopupModal offerData={content.offerPopup} />

      {/* ── 1. HERO SECTION (Snug, Elegant Hasfarm Layout) ── */}
      <section className="px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-3 sm:pb-4">
        <div className="mx-auto max-w-[1440px]">
          <div className="relative overflow-hidden rounded-[26px] sm:rounded-[36px] md:rounded-[42px] border border-[#ECD9CE] bg-gradient-to-br from-[#FBF1EA] via-[#F8E7DE] to-[#F4DFD3] p-5 sm:p-8 md:p-10 lg:p-12 shadow-xs dark:border-[#493640] dark:from-[#261B22] dark:via-[#1F151C] dark:to-[#171116]">
            
            {/* Botanical Sage Background Wave Curve */}
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-[80%] w-[56%] rounded-tl-[160px] bg-[#78836B]/15 dark:bg-[#78836B]/10 blur-[1px]" />
            <div className="pointer-events-none absolute top-6 right-10 text-[#C5A15B]/35 text-xl select-none">✦</div>
            <div className="pointer-events-none absolute bottom-8 left-8 text-[#D9B8B8]/40 text-2xl select-none">🌸</div>

            <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              {/* Left Column: 3-Tier Bold Headline, Copy, Pill Button */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="relative z-10 max-w-xl"
              >
                <div className="space-y-0.5 sm:space-y-1">
                  <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#30232A] dark:text-[#FAF1EC] leading-[0.94] uppercase">
                    {content.heroHeadline1 || "BIGGER."}
                  </h1>
                  <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#D96B4E] dark:text-[#E07558] leading-[0.94] uppercase flex items-center gap-2 sm:gap-3">
                    <span>{content.heroHeadline2 || "BRIGHTER."}</span>
                    <span className="text-2xl sm:text-4xl md:text-5xl animate-pulse">🌸</span>
                  </h1>
                  <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#30232A] dark:text-[#FAF1EC] leading-[0.94] uppercase">
                    {content.heroHeadline3 || "BETTER."}
                  </h1>
                </div>

                <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base leading-relaxed text-[#51454B] dark:text-[#C4B1B8] max-w-md">
                  {content.heroDescription ||
                    "Thoughtfully designed flowers and gifts that celebrate life, nature and every meaningful moment."}
                </p>

                {/* Pill Button: SHOP FLOWERS 🌸 */}
                <div className="mt-5 sm:mt-6">
                  <Link
                    to={content.primaryButtonLink || "/gallery"}
                    className="inline-flex items-center gap-2 rounded-full bg-[#5E6D55] hover:bg-[#4C5B44] px-6 sm:px-8 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md active:scale-95 transition-all dark:bg-[#651F3C] dark:hover:bg-[#4D172D]"
                  >
                    <span>{content.primaryButtonLabel || "SHOP FLOWERS"}</span>
                    <span>🌸</span>
                  </Link>
                </div>
              </motion.div>

              {/* Right Column: Hero Bouquet Showcase with Tag & Pagination Dots */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="relative z-10 mx-auto w-full max-w-[380px] sm:max-w-[420px] lg:max-w-none"
              >
                <div className="relative aspect-[4/4.6] max-h-[480px] w-full overflow-hidden rounded-[24px] sm:rounded-[32px] border-4 border-white/80 bg-white shadow-[0_15px_40px_rgba(48,35,42,0.10)] dark:border-[#493640] dark:bg-[#231722]">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeSlideIndex}
                      src={heroImages[activeSlideIndex]}
                      alt="MIDHUNYAS signature flower bouquet"
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="h-full w-full object-cover image-enhanced"
                    />
                  </AnimatePresence>

                  {/* Greeting Card Tag (Hasfarm Style) */}
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 rotate-6 rounded-lg bg-white px-3.5 py-2 shadow-lg border border-[#F0DFD5] dark:bg-[#261B22] dark:border-[#493640]">
                    <span className="font-serif italic text-xs sm:text-sm font-bold text-[#651F3C] dark:text-[#D5B36C]">
                      MIDHUNYAS
                    </span>
                    <span className="block text-[8px] uppercase tracking-widest text-[#81747A] dark:text-zinc-400">
                      Petals & Blooms
                    </span>
                  </div>

                  {/* Left/Right Arrow Overlays */}
                  {heroImages.length > 1 && (
                    <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveSlideIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
                        }}
                        className="pointer-events-auto grid h-7 w-7 place-items-center rounded-full bg-white/75 text-[#30232A] backdrop-blur hover:bg-white shadow transition-all"
                        aria-label="Previous bouquet"
                      >
                        <FiChevronLeft className="text-xs" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveSlideIndex((prev) => (prev + 1) % heroImages.length);
                        }}
                        className="pointer-events-auto grid h-7 w-7 place-items-center rounded-full bg-white/75 text-[#30232A] backdrop-blur hover:bg-white shadow transition-all"
                        aria-label="Next bouquet"
                      >
                        <FiChevronRight className="text-xs" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Pagination Dots (● ○ ○) */}
                {heroImages.length > 1 && (
                  <div className="mt-2.5 flex items-center justify-center gap-1.5">
                    {heroImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveSlideIndex(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`h-2 rounded-full transition-all ${
                          activeSlideIndex === idx
                            ? "w-6 bg-[#D96B4E] dark:bg-[#E07558]"
                            : "w-2 bg-[#D9C9C3] hover:bg-[#C5A15B] dark:bg-[#493640]"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FOUR TRUST CAPSULES (Snug Row) ── */}
      <section className="px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {trustCapsules.map((capsule) => (
              <div
                key={capsule.id}
                className="flex items-center gap-2.5 rounded-xl sm:rounded-full bg-[#FBF0EA] border border-[#EFE2D9] px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xs hover:shadow-sm transition-all dark:bg-[#231722] dark:border-[#493640]"
              >
                <div className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-full bg-white dark:bg-[#30232A] shadow-xs">
                  {capsule.icon}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#30232A] dark:text-[#FAF1EC] truncate">
                    {capsule.title}
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-[#81747A] dark:text-[#C4B1B8] truncate">
                    {capsule.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. SHOP OUR COLLECTIONS (Hasfarm 4 Peach Cards) ── */}
      <motion.section {...reveal} className="px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
        <div className="mx-auto max-w-[1440px]">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-3.5 sm:mb-4">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#30232A] dark:text-[#FAF1EC] flex items-center gap-2">
              <span>Shop Our Collections</span>
              <span className="text-xl text-[#E07558]">🌸</span>
            </h2>
            <Link
              to="/gallery"
              className="rounded-full border border-[#D9C9C3] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#30232A] hover:bg-[#651F3C] hover:text-white hover:border-[#651F3C] transition-all dark:border-[#493640] dark:text-[#FAF1EC] dark:hover:bg-[#651F3C]"
            >
              VIEW ALL
            </Link>
          </div>

          {/* 4 Rounded Collection Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {collections.map((item) => (
              <Link
                key={item.id}
                to={item.link || "/gallery"}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] sm:rounded-[22px] border border-[#F0DFD5] bg-[#FBF0EA] p-3 shadow-xs hover:shadow-lg hover:border-[#C5A15B] transition-all dark:border-[#493640] dark:bg-[#231722]"
              >
                <div>
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white dark:bg-[#1E1420]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 image-enhanced"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Bottom Row: Title + Starting Price + Arrow */}
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-serif text-sm sm:text-base font-bold uppercase tracking-wider text-[#30232A] dark:text-[#FAF1EC] truncate">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#81747A] dark:text-[#C4B1B8] font-medium">
                      {item.startingPrice}
                    </p>
                  </div>
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#FCE2D7] text-[#D96B4E] group-hover:bg-[#D96B4E] group-hover:text-white transition-all shadow-xs dark:bg-[#382832] dark:text-[#E07558]">
                    <FiArrowRight className="text-xs transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── 4. STORY SPLIT BANNER (Compact Small Size) ── */}
      <motion.section {...reveal} className="px-3 sm:px-6 lg:px-8 py-2.5 sm:py-4">
        <div className="mx-auto max-w-4xl lg:max-w-5xl">
          <div className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] border border-[#ECD9CE] shadow-xs grid grid-cols-1 sm:grid-cols-2 min-h-[190px] sm:h-[220px] md:h-[240px] dark:border-[#493640]">
            
            {/* Left Peach Content */}
            <div className="relative bg-[#FCE8DE] p-4 sm:p-5 md:p-6 flex flex-col justify-center dark:bg-[#261B22]">
              <span className="text-[#C5A15B] text-sm select-none mb-1">✦</span>
              <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-tight text-[#30232A] dark:text-[#FAF1EC] leading-snug">
                {content.midBanner?.title || "FLOWERS THAT TELL BEAUTIFUL STORIES"}
              </h2>
              <p className="mt-1 text-xs text-[#51454B] dark:text-[#C4B1B8] max-w-sm line-clamp-2">
                {content.midBanner?.subtitle ||
                  "We source the finest blooms and design with heart to bring beauty, joy and meaning to every moment."}
              </p>
              <div className="mt-3">
                <Link
                  to={content.midBanner?.buttonLink || "/about"}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#D9C9C3] bg-white/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#30232A] hover:bg-[#651F3C] hover:text-white hover:border-[#651F3C] transition-all dark:border-[#493640] dark:bg-white/10 dark:text-[#FAF1EC] shadow-xs"
                >
                  <span>{content.midBanner?.buttonLabel || "OUR STORY"}</span>
                  <span>🌸</span>
                </Link>
              </div>
            </div>

            {/* Right Photo: Florist Arranging Flowers (constrained to banner height) */}
            <div className="relative h-44 sm:h-full w-full overflow-hidden bg-[#FAF5EF]">
              <img
                src={content.midBanner?.image || "/gallery/bouquet/bouquet12.jpg"}
                alt="Florist arranging flowers at Midhunyas"
                className="h-full w-full object-cover object-center image-enhanced"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 5. SHOP BY OCCASION (Hasfarm 6 Circular Badges) ── */}
      <motion.section id="occasions" {...reveal} className="px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
        <div className="mx-auto max-w-[1440px]">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#30232A] dark:text-[#FAF1EC] flex items-center gap-2 mb-4 sm:mb-5">
            <span>Shop By Occasion</span>
            <span className="text-xl text-[#E07558]">🌸</span>
          </h2>

          {/* Centered, Snug Occasion Badges */}
          <div className="max-w-4xl mx-auto grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
            {occasions.map((occasion) => (
              <Link
                key={occasion.id}
                to={occasion.link || `/gallery?occasion=${encodeURIComponent(occasion.name.toLowerCase())}`}
                className="group flex flex-col items-center text-center"
              >
                {/* Circular Badge */}
                <div className="grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-full bg-[#FCECE3] border border-[#F4DDD2] text-2xl sm:text-3xl shadow-xs group-hover:scale-105 group-hover:shadow-sm group-hover:border-[#E07558] transition-all dark:bg-[#261B22] dark:border-[#493640]">
                  <span>{occasion.icon || "🌸"}</span>
                </div>
                <span className="mt-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#30232A] group-hover:text-[#651F3C] transition-colors dark:text-[#FAF1EC] dark:group-hover:text-[#D5B36C]">
                  {occasion.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── 6. DISCOUNT NEWSLETTER BANNER (Hasfarm Botanical Sage Banner) ── */}
      <motion.section {...reveal} className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="mx-auto max-w-[1440px]">
          <div className="relative overflow-hidden rounded-[20px] sm:rounded-[26px] bg-[#78836B] px-5 py-4 sm:px-8 sm:py-6 text-white shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 dark:bg-[#5E6D55]">
            <div className="max-w-xl">
              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-tight uppercase">
                10% OFF YOUR FIRST ORDER
              </h2>
              <p className="mt-0.5 text-xs text-[#FAF5EF]/90">
                Join our community and enjoy your first order.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-stretch gap-2 max-w-md w-full">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 rounded-full bg-white px-4 py-2 text-xs text-[#30232A] outline-none placeholder:text-gray-400 shadow-inner"
              />
              <button
                type="submit"
                className="rounded-full bg-[#E07558] hover:bg-[#cf6447] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs active:scale-95 transition-all shrink-0"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>
      </motion.section>

      {/* ── 7. BEST SELLERS SECTION (Hasfarm Best Sellers Grid) ── */}
      <motion.section {...reveal} className="px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
        <div className="mx-auto max-w-[1440px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3.5 sm:mb-4">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#30232A] dark:text-[#FAF1EC] flex items-center gap-2">
              <span>Best Sellers</span>
              <span className="text-xl text-[#E07558]">🌸</span>
            </h2>
            <Link
              to="/gallery"
              className="rounded-full border border-[#D9C9C3] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#30232A] hover:bg-[#651F3C] hover:text-white hover:border-[#651F3C] transition-all dark:border-[#493640] dark:text-[#FAF1EC] dark:hover:bg-[#651F3C]"
            >
              VIEW ALL
            </Link>
          </div>

          {/* 4 Best Seller Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {bestSellers.map((product) => (
              <HasfarmProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── 8. EXPRESS DELIVERY CALLOUT ── */}
      <motion.section {...reveal} className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 pb-8 sm:pb-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="rounded-[22px] border border-[#E8DDD5] bg-white p-5 sm:p-7 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 dark:border-[#493640] dark:bg-[#231722]">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#C5A15B]">
                ✦ Express Service Across Tamil Nadu
              </span>
              <h3 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-[#30232A] dark:text-[#FAF1EC]">
                Need Flowers Delivered in Karur Today?
              </h3>
              <p className="mt-1 text-xs text-[#51454B] dark:text-[#C4B1B8] max-w-xl leading-relaxed">
                We craft bouquets and bridal florals on-demand. Chat with our florists directly on WhatsApp for custom arrangements.
              </p>
            </div>
            <a
              href={content.deliveryBanner?.buttonLink || "https://wa.me/919942071721?text=Hello%20MIDHUNYAS!%20I%20need%20flower%20delivery."}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20ba59] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-green-600/20 active:scale-95 transition-all shrink-0"
            >
              <FaWhatsapp className="text-sm" /> WhatsApp Order Now
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;

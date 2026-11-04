import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCheck,
  FiHeart,
  FiShoppingBag,
  FiStar,
  FiTruck,
  FiFeather,
  FiGift,
  FiClock,
  FiSend,
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
import CarouselSlider from "../components/CarouselSlider.jsx";
import OfferPopupModal from "../components/OfferPopupModal.jsx";

const defaultHomeOccasionTiles = [
  { id: "occasion-1", name: "Birthday", note: "Joyful blooms to make their day brighter", image: "/gallery/bouquet/bouquet1.jpg", link: "/gallery?occasion=birthday" },
  { id: "occasion-2", name: "Anniversary", note: "Romantic arrangements celebrating eternal love", image: "/gallery/bouquet/bouquet13.jpg", link: "/gallery?occasion=anniversary" },
  { id: "occasion-3", name: "Congratulations", note: "Vibrant blossoms for milestones and success", image: "/gallery/bouquet/bouquet4.jpg", link: "/gallery?occasion=congratulations" },
  { id: "occasion-4", name: "Love & Romance", note: "Deep crimson roses and blushing reveries", image: "/gallery/bouquet/bouquet7.jpg", link: "/gallery?occasion=romance" },
  { id: "occasion-5", name: "Bridal & Wedding", note: "Sacred wedding florals, malai, and hair jadai", image: "/gallery/bridal/flower11.jpg", link: "/gallery?occasion=bridal" },
  { id: "occasion-6", name: "Traditional & Mandap", note: "Heirloom garlands and stage flower decor", image: "/gallery/garlands/garland1.jpg", link: "/gallery?occasion=traditional" },
];

const defaultHomeWhyChooseUs = [
  { id: "why-1", title: "Farm Fresh Flowers", note: "Sourced from trusted growers every single morning", icon: "FiFeather" },
  { id: "why-2", title: "Fast & Reliable Delivery", note: "On-time delivery across Karur and all Tamil Nadu", icon: "FiTruck" },
  { id: "why-3", title: "Beautiful Arrangements", note: "Handcrafted by expert florists with love and passion", icon: "FiHeart" },
  { id: "why-4", title: "Perfect For Every Occasion", note: "Bespoke designs tailored to your cherished moments", icon: "FiGift" },
];

const defaultDeliveryBanner = {
  title: "Same Day Flower Delivery",
  subtitle: "Beautiful flowers at your doorstep, right on time. We deliver all over Karur and Tamil Nadu.",
  buttonLabel: "Order on WhatsApp →",
  buttonLink: "https://wa.me/919942071721?text=Hello%20MIDHUNYAS%20Petals!%20I%20would%20like%20to%20order%20same%20day%20flower%20delivery.",
  image: "/gallery/bouquet/bouquet15.jpg",
};

const defaultMidBanner = {
  eyebrow: "FLOWERS THAT SPEAK YOUR HEART",
  title: "Flowers That Speak Your Heart",
  subtitle: "From birthdays to 'just because' to sacred weddings, find your perfect bouquet.",
  buttonLabel: "Explore Collections →",
  buttonLink: "/gallery",
  badgeText: "More Love Less Ordinary ♡",
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
  heroText: "Flowers for A Kinder World",
  heroDescription:
    "Handcrafted bouquets, elegant bridal jadai, and floral experiences tailored to your celebration. Delivered fresh across Karur and all Tamil Nadu.",
  badgeText: "FLOWERS. HAPPIER DAYS.",
  primaryButtonLabel: "Shop Now →",
  primaryButtonLink: "/gallery",
  secondaryButtonLabel: "Custom Order",
  secondaryButtonLink: "/contact",
  homeImagesEditableVersion: 1,
  banners: [
    "/gallery/bouquet/bouquet13.jpg",
    "/gallery/bouquet/bouquet1.jpg",
    "/gallery/bouquet/bouquet12.jpg",
    "/gallery/bouquet/bouquet4.jpg",
    "/gallery/bridal/flower11.jpg",
  ],
  featuredProductIds: [],
  occasionTiles: defaultHomeOccasionTiles,
  whyChooseUs: defaultHomeWhyChooseUs,
  deliveryBanner: defaultDeliveryBanner,
  midBanner: defaultMidBanner,
  offerPopup: defaultOfferPopup,
  features: ["Same Day Delivery", "Freshness Guaranteed", "Made With Love"],
  floatingBadgeTitle: "Good Flowers Brighter Days ♡",
  floatingBadgeSubtitle: "Handcrafted with love in Karur",
};

const fallbackProducts = [
  { _id: "rose-basket", name: "Red Roses Romance", category: "Bouquets", price: 1499, offerPrice: 1299, image: "/gallery/bouquet/bouquet1.jpg", badge: "Bestseller", rating: 5, reviewsCount: 94 },
  { _id: "pastel-wrap", name: "Pastel Dream", category: "Bouquets", price: 1899, offerPrice: 1699, image: "/gallery/bouquet/bouquet4.jpg", badge: "Customer Favorite", rating: 5, reviewsCount: 88 },
  { _id: "celebration", name: "Sunshine Bouquet", category: "Bouquets", price: 1399, offerPrice: 1199, image: "/gallery/bouquet/bouquet10.jpg", badge: "Popular", rating: 5, reviewsCount: 76 },
  { _id: "white-lily", name: "White Lily Grace", category: "Bridal Flowers", price: 2199, offerPrice: 1999, image: "/gallery/bouquet/bouquet13.jpg", badge: "Signature", rating: 5, reviewsCount: 62 },
  { _id: "bridal-jadai", name: "Royal Bridal Jadai", category: "Hairstyles", price: 2499, offerPrice: 2299, image: "/gallery/bridal/flower11.jpg", badge: "Bridal Special", rating: 5, reviewsCount: 112 },
  { _id: "mandap-garland", name: "Temple Malai Garland", category: "Garlands", price: 1799, offerPrice: 1599, image: "/gallery/garlands/garland1.jpg", badge: "Traditional", rating: 5, reviewsCount: 81 },
  { _id: "rose-love", name: "Blushing Rose Box", category: "Gift Sets", price: 1299, offerPrice: 1099, image: "/gallery/bouquet/bouquet7.jpg", badge: "Best Value", rating: 5, reviewsCount: 57 },
  { _id: "ceremony-bloom", name: "Ceremony Cascade", category: "Bridal Flowers", price: 2999, offerPrice: 2699, image: "/gallery/bouquet/bouquet12.jpg", badge: "Luxury", rating: 5, reviewsCount: 43 },
];

const customerReviews = [
  {
    quote: "Absolutely beautiful flowers! The quality and service were outstanding. The bridal jadai was fresh and vibrant all day.",
    name: "Ayesha K.",
    event: "Bridal Jadai",
    avatar: "/gallery/hairstyle/hairstyle_1.jpg",
  },
  {
    quote: "Petals made our anniversary so special! The bouquet was fresh, elegant, and delivered right on time in Karur.",
    name: "Usman & Priya",
    event: "Anniversary Bouquet",
    avatar: "/gallery/bouquet/bouquet1.jpg",
  },
  {
    quote: "Fast delivery and the most fragrant roses I have ever ordered. The packaging looked utterly royal and premium.",
    name: "Saravanan R.",
    event: "Celebration Gift",
    avatar: "/gallery/bouquet/bouquet10.jpg",
  },
];

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
};

const SectionHeading = ({ eyebrow, title, copy, align = "center" }) => (
  <div className={align === "left" ? "max-w-2xl" : "mx-auto max-w-2xl text-center"}>
    {eyebrow && (
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[#C5A15B] dark:text-[#D5B36C] flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#651F3C] animate-ping" />
        {eyebrow}
        <span className="w-1.5 h-1.5 rounded-full bg-[#651F3C] animate-ping" />
      </p>
    )}
    <h2 className="text-3xl font-serif font-bold text-[#30232A] dark:text-[#FAF5EE] sm:text-4xl md:text-5xl leading-tight">
      {title}
    </h2>
    {copy && <p className="mt-3 leading-relaxed text-[#51454B] dark:text-zinc-400 text-sm sm:text-base">{copy}</p>}
  </div>
);

// Standardized Product Card with Direct Add to Cart
const ProductCardItem = ({ product }) => {
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
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      onClick={() => navigate(`/product/${product._id || product.id}`)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E8DDD5] bg-white p-3.5 shadow-sm hover:shadow-xl hover:border-[#C5A15B]/60 transition-all dark:border-[#493640] dark:bg-[#231722] cursor-pointer"
    >
      <div>
        {/* Photo with Wishlist Heart */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#FAF5EE] dark:bg-[#1E1420]">
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 image-enhanced"
          />
          {product.badge && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 dark:bg-[#1E1420]/95 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#651F3C] dark:text-[#D5B36C] border border-[#C5A15B]/30 shadow-sm">
              {product.badge}
            </span>
          )}
          <Link
            to="/favorites"
            onClick={(e) => e.stopPropagation()}
            aria-label="Wishlist"
            className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#30232A] shadow hover:bg-[#651F3C] hover:text-white transition-colors dark:bg-[#1E1420]/90 dark:text-white"
          >
            <FiHeart className="text-xs" />
          </Link>
        </div>

        {/* Product Info */}
        <div className="mt-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#81747A] dark:text-zinc-400">
            {product.category || "Bouquets"}
          </p>
          <h3 className="mt-1 font-serif text-base font-bold text-[#30232A] dark:text-white truncate">
            {product.name}
          </h3>

          {/* Star Rating */}
          <div className="mt-1 flex items-center gap-1 text-[11px] text-[#C5A15B]">
            {Array.from({ length: 5 }).map((_, i) => (
              <FiStar key={i} fill="currentColor" className="text-xs" />
            ))}
            <span className="ml-1 text-[10px] font-medium text-[#81747A] dark:text-zinc-400">
              ({product.reviewsCount || 86})
            </span>
          </div>

          {/* Pricing */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-bold text-[#651F3C] dark:text-[#D5B36C]">
              ₹{price.toLocaleString("en-IN")}
            </span>
            {originalPrice && (
              <span className="text-xs text-[#81747A] line-through">
                ₹{originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        type="button"
        disabled={isAdding}
        onClick={handleAddToCart}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#651F3C] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#4D172D] active:scale-[0.98] transition-all dark:bg-[#651F3C] dark:hover:bg-[#C5A15B] dark:hover:text-[#30232A]"
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
  const [activeCollectionTab, setActiveCollectionTab] = useState("all");
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

  // Best sellers: featured products if configured, else first 4 products
  const bestSellers = useMemo(() => {
    if (content.featuredProductIds?.length && allProducts.length) {
      const byId = new Map(allProducts.map((p) => [p._id, p]));
      const featured = content.featuredProductIds.map((id) => byId.get(id)).filter(Boolean);
      if (featured.length) return featured.slice(0, 4);
    }
    return allProducts.slice(0, 4);
  }, [allProducts, content.featuredProductIds]);

  // Occasions list
  const occasions = useMemo(() => {
    return content.occasionTiles?.length ? content.occasionTiles : defaultHomeOccasionTiles;
  }, [content.occasionTiles]);

  // Filtered Collection products
  const collectionCategories = [
    { key: "all", label: "All Flowers" },
    { key: "bouquets", label: "Bouquets" },
    { key: "bridal", label: "Bridal Flowers" },
    { key: "hairstyles", label: "Hairstyles & Jadai" },
    { key: "garlands", label: "Garlands" },
  ];

  const filteredCollection = useMemo(() => {
    if (activeCollectionTab === "all") return allProducts.slice(0, 8);
    return allProducts
      .filter((p) => {
        const cat = (p.category || "").toLowerCase();
        if (activeCollectionTab === "bouquets") return cat.includes("bouquet");
        if (activeCollectionTab === "bridal") return cat.includes("bridal") || cat.includes("wedding");
        if (activeCollectionTab === "hairstyles") return cat.includes("hair") || cat.includes("jadai");
        if (activeCollectionTab === "garlands") return cat.includes("garland") || cat.includes("malai");
        return true;
      })
      .slice(0, 8);
  }, [allProducts, activeCollectionTab]);

  const heroSlides = useMemo(() => {
    if (content.banners && content.banners.length > 0) {
      return content.banners.map((img, idx) => ({ id: idx + 1, img }));
    }
    return defaultContent.banners.map((img, idx) => ({ id: idx + 1, img }));
  }, [content.banners]);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    toast.success("Welcome to our floral community! Check your email for special offers.");
    setNewsletterEmail("");
  };

  return (
    <div className="relative overflow-hidden bg-[#FAF5EE] text-[#30232A] transition-colors dark:bg-[#160F17] dark:text-[#F5F5F5]">
      <SeoHead seoOverride={pageSeo} breadcrumbs={[{ name: "Home", url: "/" }]} />

      {/* ── 0. POPUP OFFER POSTER ON LOAD / REFRESH ── */}
      <OfferPopupModal offerData={content.offerPopup} />

      {/* ── Ambient Glow Radiance ── */}
      <div className="surreal-orb top-[-100px] left-[15%] w-[450px] h-[450px] bg-[#651F3C]/12 dark:bg-[#651F3C]/15" />
      <div className="surreal-orb top-[500px] right-[-100px] w-[500px] h-[500px] bg-[#C5A15B]/12 dark:bg-[#C5A15B]/10" />

      {/* ── 1. HERO SECTION (PetalNest style layout) ── */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:py-16 md:py-20 lg:py-24 bg-[radial-gradient(ellipse_at_50%_0%,#FFFDFC_0%,#FAF5EE_50%,#F5ECE3_100%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,#241420_0%,#1A1018_55%,#140C12_100%)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            {/* Left Column: Headlines, CTA, Trust Badges */}
            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="max-w-xl">
              <span className="inline-block rounded-full border border-[#C5A15B]/40 bg-white/80 dark:bg-[#231722]/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#651F3C] dark:text-[#D5B36C] shadow-sm">
                ✦ {content.badgeText || "FLOWERS. HAPPIER DAYS."}
              </span>

              <h1 className="mt-5 text-4xl font-serif font-bold tracking-tight text-[#30232A] dark:text-white sm:text-5xl md:text-6xl leading-[1.05]">
                {content.heroText || "Flowers for A Kinder World"}
              </h1>

              <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#51454B] dark:text-zinc-300">
                {content.heroDescription ||
                  "Handcrafted bouquets for every occasion, delivered with love. Express delivery across Karur and all Tamil Nadu."}
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to={content.primaryButtonLink || "/gallery"}
                  className="inline-flex items-center gap-2 rounded-full bg-[#651F3C] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#651F3C]/25 hover:bg-[#4D172D] hover:scale-105 active:scale-95 transition-all"
                >
                  {content.primaryButtonLabel || "Shop Now →"}
                </Link>
                <Link
                  to={content.secondaryButtonLink || "/contact"}
                  className="inline-flex items-center gap-2 rounded-full border border-[#C5A15B]/60 bg-white/70 dark:bg-white/5 px-7 py-3.5 text-sm font-bold text-[#30232A] dark:text-white hover:border-[#651F3C] hover:bg-white transition-all"
                >
                  {content.secondaryButtonLabel || "Custom Order"}
                </Link>
              </div>

              {/* 3 Trust Badges underneath CTA (exactly like reference) */}
              <div className="mt-12 grid grid-cols-3 gap-3 border-t border-[#E8DDD5] pt-6 dark:border-[#493640]">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 text-center sm:text-left">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white dark:bg-[#231722] text-[#651F3C] dark:text-[#D5B36C] shadow-sm border border-[#E8DDD5] dark:border-[#493640]">
                    <FiTruck className="text-base" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#30232A] dark:text-white">Same Day</p>
                    <p className="text-[10px] text-[#81747A] dark:text-zinc-400">Delivery in Karur</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 text-center sm:text-left">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white dark:bg-[#231722] text-[#651F3C] dark:text-[#D5B36C] shadow-sm border border-[#E8DDD5] dark:border-[#493640]">
                    <FiFeather className="text-base" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#30232A] dark:text-white">Freshness</p>
                    <p className="text-[10px] text-[#81747A] dark:text-zinc-400">Guaranteed Harvest</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 text-center sm:text-left">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white dark:bg-[#231722] text-[#651F3C] dark:text-[#D5B36C] shadow-sm border border-[#E8DDD5] dark:border-[#493640]">
                    <FiHeart className="text-base" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#30232A] dark:text-white">Made With</p>
                    <p className="text-[10px] text-[#81747A] dark:text-zinc-400">Love & Devotion</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Hero Visual Showcase with Carousel & Love Note Tag */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.85, delay: 0.15 }}
              className="relative mx-auto w-full max-w-[540px] lg:max-w-none"
            >
              <div className="relative aspect-[4/5] max-h-[640px] overflow-hidden rounded-[36px] border-[8px] border-white/90 bg-white/30 shadow-[0_30px_70px_rgba(101,31,60,0.18)] dark:border-[#493640] dark:bg-[#231722]">
                <CarouselSlider slides={heroSlides} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Love Note Card (from reference image) */}
              <div className="absolute -bottom-6 -left-4 sm:left-4 rounded-2xl border border-[#C5A15B]/35 bg-white/95 dark:bg-[#1E1420]/95 p-4 shadow-2xl backdrop-blur-md max-w-[220px]">
                <p className="font-serif italic text-sm font-semibold text-[#651F3C] dark:text-[#D5B36C]">
                  {content.floatingBadgeTitle || "Good Flowers Brighter Days ♡"}
                </p>
                <p className="mt-1 text-[11px] text-[#81747A] dark:text-zinc-400">
                  {content.floatingBadgeSubtitle || "Handcrafted with love in Karur"}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. OUR BEST SELLERS (reference left middle) ── */}
      <motion.section {...reveal} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <SectionHeading
            align="left"
            title="Our Best Sellers"
            copy="Customer favorites, crafted with care for unforgettable moments."
          />
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#651F3C] dark:text-[#D5B36C] hover:underline shrink-0"
          >
            View All Best Sellers <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {bestSellers.map((product) => (
            <ProductCardItem key={product._id || product.id} product={product} />
          ))}
        </div>
      </motion.section>

      {/* ── 3. SHOP BY OCCASION (reference right top) ── */}
      <motion.section {...reveal} className="bg-gradient-to-b from-[#FAF5EE] via-[#F6ECE7] to-[#FAF5EE] dark:from-[#160F17] dark:via-[#221620] dark:to-[#160F17] border-y border-[#C5A15B]/20 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Shop by Occasion"
            copy="Because every moment deserves fresh flowers tailored to its feeling."
          />

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {occasions.map((occasion, idx) => (
              <motion.div
                key={occasion.id || idx}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
              >
                <Link
                  to={occasion.link || `/gallery?occasion=${encodeURIComponent(occasion.name.toLowerCase())}`}
                  className="group block text-center"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#E8DDD5] bg-white shadow-sm hover:shadow-xl hover:border-[#C5A15B] transition-all dark:border-[#493640] dark:bg-[#231722]">
                    <img
                      src={occasion.image || "/gallery/bouquet/bouquet1.jpg"}
                      alt={occasion.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 image-enhanced"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute bottom-3 inset-x-2 text-center text-xs font-bold text-white drop-shadow">
                      {occasion.name}
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs font-bold text-[#30232A] dark:text-zinc-200 group-hover:text-[#651F3C] dark:group-hover:text-[#D5B36C] transition-colors">
                    {occasion.name}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── 4. SAME DAY FLOWER DELIVERY BANNER (reference right middle) ── */}
      <motion.section {...reveal} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-[#C5A15B]/35 bg-gradient-to-r from-[#FAF5EE] via-[#F6ECE7] to-[#FAF5EE] dark:from-[#231722] dark:via-[#1B1019] dark:to-[#231722] p-8 sm:p-12 lg:p-16 shadow-[0_20px_60px_rgba(101,31,60,0.08)]">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="inline-block rounded-full bg-[#C5A15B]/20 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#651F3C] dark:text-[#D5B36C]">
                ✦ Express Service
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#30232A] dark:text-white leading-tight">
                {content.deliveryBanner?.title || "Same Day Flower Delivery"}
              </h2>
              <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-[#51454B] dark:text-zinc-300">
                {content.deliveryBanner?.subtitle ||
                  "Beautiful flowers at your doorstep, right on time. We deliver all over Karur and all Tamil Nadu for birthdays, weddings, and urgent celebrations."}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={content.deliveryBanner?.buttonLink || "https://wa.me/919942071721?text=Hello%20MIDHUNYAS!%20I%20need%20same%20day%20flower%20delivery."}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20ba59] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-green-600/20 active:scale-95 transition-all"
                >
                  <FaWhatsapp className="text-base" /> {content.deliveryBanner?.buttonLabel || "Order on WhatsApp →"}
                </a>
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-2 rounded-full border border-[#C5A15B] px-6 py-3 text-sm font-bold text-[#651F3C] dark:text-[#D5B36C] hover:bg-white dark:hover:bg-white/10 transition-all"
                >
                  Browse Flowers
                </Link>
              </div>
            </div>

            {/* Right Photo */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/80 dark:border-[#493640] shadow-xl">
              <img
                src={content.deliveryBanner?.image || "/gallery/bouquet/bouquet15.jpg"}
                alt="Same day delivery"
                className="h-full w-full object-cover image-enhanced"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 dark:bg-black/80 px-4 py-2 backdrop-blur shadow">
                <p className="text-xs font-bold text-[#651F3C] dark:text-[#D5B36C]">Fast Karur Dispatch</p>
                <p className="text-[10px] text-[#81747A] dark:text-zinc-400">Doorstep delivery within hours</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 5. FLOWERS THAT SPEAK YOUR HEART (Split Promo Banner, reference left middle-bottom) ── */}
      <motion.section {...reveal} className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center rounded-[32px] border border-[#E8DDD5] bg-white p-8 sm:p-12 shadow-sm dark:border-[#493640] dark:bg-[#231722]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A15B] dark:text-[#D5B36C]">
              ✦ {content.midBanner?.eyebrow || "FLOWERS THAT SPEAK YOUR HEART"}
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-serif font-bold text-[#30232A] dark:text-white leading-tight">
              {content.midBanner?.title || "Flowers That Speak Your Heart"}
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#51454B] dark:text-zinc-300">
              {content.midBanner?.subtitle ||
                "From birthdays to 'just because' to sacred weddings, find your perfect bouquet handcrafted fresh."}
            </p>
            <div className="mt-8">
              <Link
                to={content.midBanner?.buttonLink || "/gallery"}
                className="inline-flex items-center gap-2 rounded-full bg-[#651F3C] px-7 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#4D172D] active:scale-95 transition-all"
              >
                {content.midBanner?.buttonLabel || "Explore Collections →"}
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#E8DDD5] dark:border-[#493640]">
            <img
              src={content.midBanner?.image || "/gallery/bouquet/bouquet12.jpg"}
              alt="Flowers that speak your heart"
              className="h-full w-full object-cover image-enhanced"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <div className="absolute bottom-4 right-4 rounded-xl bg-white/95 dark:bg-black/85 p-3.5 shadow-xl max-w-[200px]">
              <p className="font-serif italic text-xs font-bold text-[#651F3C] dark:text-[#D5B36C]">
                {content.midBanner?.badgeText || "More Love Less Ordinary ♡"}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── 6. OUR COLLECTION (Tabbed filter grid, reference left bottom) ── */}
      <motion.section {...reveal} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <SectionHeading
          title="Our Collection"
          copy="Explore our catalog of hand-tied bouquets, bridal crowns, and celebration flowers."
        />

        {/* Filter Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {collectionCategories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCollectionTab(cat.key)}
              className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                activeCollectionTab === cat.key
                  ? "bg-[#651F3C] text-white shadow-md"
                  : "bg-white text-[#51454B] border border-[#E8DDD5] hover:border-[#C5A15B] dark:bg-[#231722] dark:text-zinc-300 dark:border-[#493640]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {filteredCollection.map((product) => (
            <ProductCardItem key={product._id || product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 rounded-full border border-[#C5A15B] bg-white dark:bg-[#231722] px-8 py-3 text-xs font-bold uppercase tracking-wider text-[#651F3C] dark:text-[#D5B36C] hover:bg-[#651F3C] hover:text-white transition-all shadow-sm"
          >
            Explore Complete Atelier Gallery <FiArrowRight />
          </Link>
        </div>
      </motion.section>

      {/* ── 7. WHY CHOOSE MIDHUNYAS? (reference right lower-middle) ── */}
      <motion.section {...reveal} className="bg-gradient-to-b from-[#FAF5EE] via-[#F6ECE7] to-[#FAF5EE] dark:from-[#160F17] dark:via-[#221620] dark:to-[#160F17] border-y border-[#C5A15B]/20 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Why Choose Midhunyas?"
            copy="More than flowers, we deliver feelings."
          />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(content.whyChooseUs || defaultHomeWhyChooseUs).map((item, idx) => (
              <div
                key={item.id || idx}
                className="rounded-2xl border border-[#E8DDD5] bg-white p-6 text-center shadow-sm hover:shadow-md hover:border-[#C5A15B] transition-all dark:border-[#493640] dark:bg-[#231722]"
              >
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#FAF5EE] dark:bg-[#30202B] text-[#651F3C] dark:text-[#D5B36C] border border-[#C5A15B]/30 shadow-sm">
                  {idx === 0 && <FiFeather className="text-2xl" />}
                  {idx === 1 && <FiTruck className="text-2xl" />}
                  {idx === 2 && <FiHeart className="text-2xl" />}
                  {idx === 3 && <FiGift className="text-2xl" />}
                </div>
                <h3 className="mt-4 font-serif text-lg font-bold text-[#30232A] dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#81747A] dark:text-zinc-400">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── 8. WHAT OUR CUSTOMERS SAY (reference right bottom) ── */}
      <motion.section {...reveal} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <SectionHeading
          title="What Our Customers Say"
          copy="Real stories. Real happiness."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {customerReviews.map((review) => (
            <article
              key={review.name}
              className="rounded-2xl border border-[#E8DDD5] bg-white p-6 shadow-sm hover:shadow-md hover:border-[#C5A15B]/60 transition-all dark:border-[#493640] dark:bg-[#231722] flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 text-[#C5A15B]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar key={i} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-4 font-serif italic text-base leading-relaxed text-[#30232A] dark:text-zinc-200">
                  "{review.quote}"
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-[#E8DDD5] pt-4 dark:border-[#493640]">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="h-10 w-10 rounded-full object-cover border border-[#C5A15B]/40"
                />
                <div>
                  <p className="text-xs font-bold text-[#30232A] dark:text-white">{review.name}</p>
                  <p className="text-[10px] text-[#81747A] dark:text-zinc-400">{review.event}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </motion.section>

      {/* ── 9. JOIN OUR FLORAL COMMUNITY (reference right bottom banner) ── */}
      <motion.section {...reveal} className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-[#C5A15B]/30 bg-gradient-to-r from-[#FAF5EE] via-[#F6ECE7] to-[#FAF5EE] dark:from-[#231722] dark:via-[#1D121B] dark:to-[#231722] p-8 sm:p-12 text-center shadow-sm">
          <div className="mx-auto max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#651F3C] dark:text-[#D5B36C]">
              Join Our Floral Community
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#51454B] dark:text-zinc-300">
              Get exclusive offers, flower care tips, and new arrivals straight to your inbox.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 rounded-full border border-[#E8DDD5] bg-white px-4 py-2.5 text-xs text-[#30232A] outline-none focus:border-[#651F3C] dark:border-[#493640] dark:bg-[#1E1420] dark:text-white"
              />
              <button
                type="submit"
                className="rounded-full bg-[#651F3C] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#4D172D] transition-all shrink-0 active:scale-95 shadow-md"
              >
                Subscribe →
              </button>
            </form>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;

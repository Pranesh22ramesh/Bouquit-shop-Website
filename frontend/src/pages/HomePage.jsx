import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiGift,
  FiHeart,
  FiShoppingBag,
  FiStar,
  FiTruck,
} from "react-icons/fi";
import axios from "../api/axios";
import { galleryService } from "../api/galleryService";
import { SITE_EVENTS, subscribeToSiteEvent } from "../lib/siteEvents";
import { subscribeToTable } from "../lib/supabaseRealtime";
import SeoHead from "../seo/SeoHead.jsx";
import { usePageSeo } from "../seo/useSeo.js";
import CarouselSlider from "../components/CarouselSlider.jsx";

const defaultHomeCategoryTiles = [
  { id: "bouquets", name: "Bouquets", note: "For every dreamlike love story", image: "/gallery/bouquet/bouquet12.jpg" },
  { id: "hairstyles", name: "Hairstyles", note: "Ethereal floral crowns & bridal weaves", image: "/gallery/hairstyle/hairstyle_1.jpg" },
  { id: "bridal-flowers", name: "Bridal Flowers", note: "Sacred blossoms suspended in time", image: "/gallery/bridal/flower11.jpg" },
  { id: "gift-arrangements", name: "Gift Arrangements", note: "Poetry woven in fragrant petals", image: "/gallery/bouquet/bouquet13.jpg" },
];

const defaultHomeInspirationTiles = [
  { id: "rose-stories", src: "/gallery/bouquet/bouquet1.jpg", label: "Midnight Roses", className: "sm:row-span-2" },
  { id: "bridal-details", src: "/gallery/bridal/flower12.jpg", label: "Bridal Reverie", className: "" },
  { id: "floral-traditions", src: "/gallery/bouquet/bouquet4.jpg", label: "Ethereal Weaves", className: "" },
  { id: "gifts-with-heart", src: "/gallery/bouquet/bouquet10.jpg", label: "Dreams in Bloom", className: "sm:col-span-2" },
];

const defaultHomeFallbackProductImages = [
  "/gallery/bouquet/bouquet1.jpg",
  "/gallery/bouquet/bouquet4.jpg",
  "/gallery/bouquet/bouquet13.jpg",
  "/gallery/bouquet/bouquet7.jpg",
];

const defaultContent = {
  heroText: "Crafting Your Eternal Memories",
  heroDescription:
    "Handcrafted bouquets, elegant garlands, and floral experiences tailored to your celebration. and We can deliver allover Tamilnadu",
  badgeText: "Karur's Surreal Botanical Atelier",
  primaryButtonLabel: "Explore Blooms",
  primaryButtonLink: "/gallery",
  secondaryButtonLabel: "Custom Order",
  secondaryButtonLink: "/contact",
  homeImagesEditableVersion: 1,
  banners: ["/gallery/bouquet/bouquet13.jpg"],
  featuredProductIds: [],
  promotionalSections: [],
  categoryTiles: defaultHomeCategoryTiles,
  eventImage: "/gallery/bouquet/bouquet6.jpg",
  inspirationTiles: defaultHomeInspirationTiles,
  fallbackProductImages: defaultHomeFallbackProductImages,
  features: ["Handcrafted in reverie", "Express divine delivery", "Made to your taste"],
  floatingBadgeTitle: "Ethereal Artistry",
  floatingBadgeSubtitle: "Suspended in pure beauty",
};

const fallbackProducts = [
  { _id: "rose-basket", name: "Blushing Rose Basket", category: "Celestial Bouquet", price: 1899, image: "/gallery/bouquet/bouquet1.jpg", badge: "Bestseller" },
  { _id: "pastel-wrap", name: "Pastel Poetry", category: "Hand-tied Dream", price: 1499, image: "/gallery/bouquet/bouquet4.jpg", badge: "New" },
  { _id: "celebration", name: "The Celebration Edit", category: "Ethereal Arrangement", price: 2499, image: "/gallery/bouquet/bouquet13.jpg", badge: "Signature" },
  { _id: "rose-love", name: "Endless Romance", category: "Scarlet Reverie", price: 1299, image: "/gallery/bouquet/bouquet7.jpg", badge: "Popular" },
];

const reviews = [
  { quote: "The flowers felt like something straight out of a beautiful dream. Every petal glowed with fresh vitality.", name: "Nivetha R.", event: "Botanical Bouquet" },
  { quote: "Our wedding stage and bridal jadai were utterly surreal. The entire hall felt transformed into an enchanted sanctuary.", name: "Sowmya & Arun", event: "Sacred Union" },
  { quote: "Luminous floral presentation and instant delivery across Karur. The craftsmanship is pure art.", name: "Harini K.", event: "Celebration Gift" },
];

const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
};

const SectionHeading = ({ eyebrow, title, copy, align = "center" }) => (
  <div className={align === "left" ? "max-w-2xl" : "mx-auto max-w-2xl text-center"}>
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#C69236] dark:text-[#E9D8A6] flex items-center justify-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-[#E85D8E] animate-ping" />
      {eyebrow}
      <span className="w-1.5 h-1.5 rounded-full bg-[#E85D8E] animate-ping" />
    </p>
    <h2 className="text-4xl font-medium leading-tight sm:text-5xl text-[#2D2D2D] dark:text-white">
      {title}
    </h2>
    {copy && <p className="mt-4 leading-7 text-[#6E6864] dark:text-zinc-400 text-sm sm:text-base">{copy}</p>}
  </div>
);

const ProductCard = ({ product }) => {
  const image = product.image || product.images?.[0] || "";
  const price = Number(product.offerPrice || product.price || product.basePrice || 0);

  return (
    <motion.article
      whileHover={{ y: -10, scale: 1.015 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-[26px] border border-white/80 bg-white/70 shadow-[0_15px_45px_rgba(219,39,119,0.08)] backdrop-blur-xl dark:border-purple-500/20 dark:bg-[#1A1522]/80 dark:shadow-[0_15px_45px_rgba(0,0,0,0.5)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-pink-50/50 to-purple-50/50 dark:from-purple-950/20 dark:to-zinc-900">
        {image ? (
          <img
            src={image}
            alt={product.name || product.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110 image-enhanced"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="grid h-full place-items-center bg-[#F8F2EF] text-sm text-[#9A8E86] dark:bg-zinc-800 dark:text-zinc-400">No image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9B6D28] backdrop-blur-md shadow-sm dark:bg-zinc-900/90 dark:text-amber-200">
          {product.badge || (product.offerPrice ? "Special" : "✦ Reverie")}
        </span>
        <Link
          to="/favorites"
          aria-label="Save to wishlist"
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#2D2D2D] shadow-md backdrop-blur transition hover:bg-[#E85D8E] hover:text-white dark:bg-zinc-900/90 dark:text-white"
        >
          <FiHeart />
        </Link>
        <Link
          to="/gallery"
          className="absolute inset-x-4 bottom-4 translate-y-4 rounded-full bg-white/95 py-3 text-center text-xs font-bold uppercase tracking-wider text-[#2D2D2D] opacity-0 shadow-xl backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-zinc-900/95 dark:text-white hover:bg-rose-500 hover:text-white"
        >
          View in Atelier
        </Link>
      </div>
      <div className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C69236] dark:text-[#E9D8A6]">{product.category || "Fresh blooms"}</p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h3 className="text-xl font-medium text-[#2D2D2D] dark:text-white truncate">{product.name || product.title}</h3>
          <p className="shrink-0 pt-1 text-sm font-bold text-[#E85D8E]">₹{price.toLocaleString("en-IN")}</p>
        </div>
        <Link to="/gallery" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2D2D2D] transition hover:text-[#E85D8E] dark:text-zinc-200">
          Acquire Bloom <FiArrowRight />
        </Link>
      </div>
    </motion.article>
  );
};

const renderHeroText = (text) => {
  if (!text) return "";
  const lower = text.toLowerCase();
  if (lower.includes("crafting your eternal memories")) {
    return (
      <>
        Crafting Your<br />
        <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-amber-500 bg-clip-text text-transparent italic font-serif">
          Eternal Memories
        </span>
      </>
    );
  }
  if (lower.includes("crafting eternal memories")) {
    return (
      <>
        Crafting<br />
        <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-amber-500 bg-clip-text text-transparent italic font-serif">
          Eternal Memories
        </span>
      </>
    );
  }
  return text;
};

const renderHeroDescription = (text) => {
  if (!text) return "";
  const regex = /(We can deliver all\s*over Tamil\s*nadu)/i;
  const parts = text.split(regex);
  if (parts.length > 1) {
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <span key={index} className="font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-400/10 px-2.5 py-0.5 rounded-lg border border-rose-500/20 dark:border-rose-400/20 shadow-sm mx-1 inline-block">
            {part}
          </span>
        );
      }
      return part;
    });
  }
  return text;
};

const HomePage = () => {
  const pageSeo = usePageSeo('home');
  const [content, setContent] = useState(defaultContent);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  const loadHome = async () => {
    try {
      const [contentRes, featuredRes] = await Promise.all([
        axios.get("/content/home-highlight"),
        galleryService.list({ featured: true, limit: 8 }),
      ]);
      const nextContent = { ...defaultContent, ...(contentRes.data || {}) };
      const products = featuredRes.products || featuredRes.data?.products || [];
      setContent(nextContent);
      if (nextContent.featuredProductIds?.length) {
        const byId = new Map(products.map((product) => [product._id, product]));
        setFeaturedProducts(nextContent.featuredProductIds.map((id) => byId.get(id)).filter(Boolean));
      } else {
        setFeaturedProducts(products.slice(0, 4));
      }
    } catch (error) {
      console.error("Failed to load home content", error);
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

  const categoryTiles = useMemo(
    () => (content.categoryTiles?.length ? content.categoryTiles : defaultHomeCategoryTiles),
    [content.categoryTiles]
  );
  const inspirationTiles = useMemo(
    () => (content.inspirationTiles?.length ? content.inspirationTiles : defaultHomeInspirationTiles),
    [content.inspirationTiles]
  );
  const products = useMemo(() => {
    if (featuredProducts.length) return featuredProducts;
    const fallbackImages = content.fallbackProductImages?.length ? content.fallbackProductImages : defaultHomeFallbackProductImages;
    return fallbackProducts.map((product, index) => ({
      ...product,
      image: fallbackImages[index] || "",
    }));
  }, [content.fallbackProductImages, featuredProducts]);
  const heroImage = content.banners?.[0] || "";
  const eventImage = content.eventImage || "";

  const heroSlides = useMemo(() => {
    if (content.banners && content.banners.length > 1) {
      return content.banners.map((img, idx) => ({ id: idx + 1, img }));
    }
    return [
      { id: 1, img: content.banners?.[0] || "/gallery/bouquet/bouquet13.jpg" },
      { id: 2, img: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1200&auto=format&fit=crop" },
      { id: 3, img: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200&auto=format&fit=crop" },
      { id: 4, img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop" },
      { id: 5, img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop" },
      { id: 6, img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop" },
    ];
  }, [content.banners]);

  return (
    <div className="relative overflow-hidden bg-[#FFF9F6] text-[#2D2D2D] transition-colors dark:bg-[#0E0C12] dark:text-[#F5F5F5]">
      <SeoHead seoOverride={pageSeo} breadcrumbs={[{ name: 'Home', url: '/' }]} />

      {/* ── Surreal Ambient Glowing Orbs ── */}
      <div className="surreal-orb top-[-100px] left-[15%] w-[450px] h-[450px] bg-rose-400/25 dark:bg-rose-600/20" />
      <div className="surreal-orb top-[400px] right-[-100px] w-[550px] h-[550px] bg-purple-400/20 dark:bg-purple-700/25" />
      <div className="surreal-orb top-[1400px] left-[-80px] w-[400px] h-[400px] bg-amber-300/20 dark:bg-amber-600/15" />

      {/* ── 1. Surrealist Hero Section ── */}
      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[radial-gradient(ellipse_at_50%_0%,rgba(253,242,248,0.8)_0%,rgba(255,249,246,0.95)_50%,rgba(245,243,255,0.7)_100%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(45,20,50,0.5)_0%,rgba(14,12,18,0.95)_55%,rgba(20,15,30,0.9)_100%)]">
        <span className="hero-petal left-[8%] top-[16%] rotate-12" />
        <span className="hero-petal left-[46%] top-[10%] -rotate-12 [animation-delay:1.8s]" />
        <span className="hero-petal right-[7%] top-[24%] rotate-45 [animation-delay:3.4s]" />
        <span className="hero-petal bottom-[12%] left-[42%] rotate-90 [animation-delay:2.6s]" />

        <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-[1440px] items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12 lg:py-16 xl:px-20">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.85 }} className="relative z-10 max-w-2xl">
            {/* Surreal Badge */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-pink-200/60 bg-white/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#936B53] shadow-md backdrop-blur-xl dark:border-purple-500/30 dark:bg-purple-950/40 dark:text-purple-200">
              <span className="h-2 w-2 rounded-full bg-[#E85D8E] animate-ping" />
              ✦ {content.badgeText}
            </div>

            <h1 className="text-[clamp(3.35rem,6.8vw,7rem)] font-medium leading-[0.92] tracking-[-0.04em] text-[#2D2D2D] dark:text-white">
              {renderHeroText(content.heroText)}
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-[#655E5A] dark:text-zinc-300 sm:text-lg">
              {renderHeroDescription(content.heroDescription)}
            </p>

            <div className="mt-9 flex flex-col gap-3.5 sm:flex-row">
              <Link to={content.primaryButtonLink || "/gallery"} className="btn-luxury">
                {content.primaryButtonLabel || "Explore Blooms"} <FiArrowRight />
              </Link>
              <Link to={content.secondaryButtonLink || "/contact"} className="btn-luxury-outline">
                {content.secondaryButtonLabel || "Custom Order"}
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs font-medium text-[#756C67] dark:text-zinc-400">
              {content.features?.map((feature, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  <FiCheck className="text-emerald-500" /> {feature}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Surreal Portal Arch Composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative mx-auto w-full max-w-[700px] lg:ml-auto"
          >
            {/* Glowing Aurora Portal Aura */}
            <div className="absolute -inset-4 rounded-[180px_180px_40px_40px] bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-amber-400/20 blur-2xl -z-10" />

            <div className="relative ml-auto aspect-[4/5] max-h-[720px] overflow-hidden rounded-[180px_180px_36px_36px] border-[10px] border-white/80 bg-white/20 shadow-[0_35px_90px_rgba(219,39,119,0.22)] backdrop-blur-xl dark:border-purple-400/20 dark:bg-purple-950/20 sm:border-[14px]">
              {heroSlides && heroSlides.length > 1 ? (
                <CarouselSlider slides={heroSlides} />
              ) : heroImage ? (
                <img
                  src={heroImage}
                  alt="Midhunyas surreal floral arrangement"
                  className="h-full w-full object-cover image-enhanced animate-surreal-float"
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <div className="grid h-full place-items-center bg-[#F8F2EF] text-sm text-[#9A8E86] dark:bg-zinc-800 dark:text-zinc-400">Hero image not set</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10 pointer-events-none" />
            </div>

            {/* Floating Glassmorphic Pill */}
            <div className="absolute -bottom-6 left-2 flex items-center gap-3.5 rounded-2xl border border-white/80 bg-white/85 p-4 pr-7 shadow-2xl backdrop-blur-2xl dark:border-purple-400/30 dark:bg-[#181324]/90">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md">
                <FiGift className="text-xl" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-wide text-gray-900 dark:text-white">
                  {content.floatingBadgeTitle || "Ethereal Artistry"}
                </p>
                <p className="text-[11px] text-[#817873] dark:text-zinc-400">
                  {content.floatingBadgeSubtitle || "Suspended in pure beauty"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. Feature Bar (The Realm of Wonders) ── */}
      <section className="border-y border-pink-100/80 bg-white/60 dark:border-purple-900/30 dark:bg-[#14101D]/70 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-pink-100 dark:divide-purple-900/40 px-4 md:grid-cols-4">
          {[
            [FiTruck, "Express Delivery", "Karur & All Tamil Nadu"],
            [FiGift, "Surreal Packaging", "Gilded Floral Wraps"],
            [FiCalendar, "Custom Bridal Styling", "Bespoke Jadai & Malai"],
            [FiShoppingBag, "Harvested Fresh", "Crafted in Reverie"],
          ].map(([Icon, title, note]) => (
            <div key={title} className="flex items-center gap-3.5 px-4 py-5 sm:px-7">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pink-100/60 dark:bg-purple-900/40 text-[#E85D8E] dark:text-purple-300">
                <Icon className="text-lg" />
              </div>
              <div>
                <p className="text-xs font-bold sm:text-sm text-gray-800 dark:text-gray-100">{title}</p>
                <p className="mt-0.5 text-[10px] text-[#8A817C] dark:text-zinc-400 sm:text-xs">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Category Portals (Visions in Bloom) ── */}
      <motion.section {...reveal} className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <SectionHeading
          eyebrow="Visions in Bloom"
          title="Floral Portals of Reverie"
          copy="Step into collections designed to evoke wonder—from bridal crowns to transcendent bouquets."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categoryTiles.map((category, index) => (
            <motion.div
              key={category.id || category.name || index}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Link to="/gallery" className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/70 bg-white/40 shadow-[0_16px_40px_rgba(219,39,119,0.12)] backdrop-blur-xl dark:border-purple-500/20 dark:bg-purple-950/20">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110 image-enhanced"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-full place-items-center bg-[#F8F2EF] text-sm text-[#9A8E86] dark:bg-zinc-800 dark:text-zinc-400">No image</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.28em] text-pink-300">
                      ✦ 0{index + 1}
                    </span>
                    <h3 className="text-2xl font-serif font-medium">{category.name}</h3>
                    <p className="mt-1 text-xs text-white/80 line-clamp-1">{category.note}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-200">
                      Enter Portal <FiArrowRight />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── 4. The Favourites (Petals from the Ether) ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/40 via-purple-50/30 to-transparent px-5 py-24 dark:from-purple-950/20 dark:via-zinc-950 dark:to-transparent sm:px-8 sm:py-28">
        <motion.div {...reveal} className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              align="left"
              eyebrow="Ethereal Creations"
              title="The Cherished Collections"
              copy="Living floral art requested time and again, crafted fresh for your celebration."
            />
            <Link to="/gallery" className="inline-flex items-center gap-2 text-sm font-bold text-[#E85D8E] hover:underline">
              View All Works <FiArrowRight />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── 5. The Surreal Botanical Atelier (Sculpting Living Petals) ── */}
      <section className="mx-auto grid max-w-7xl scroll-mt-24 gap-12 px-5 py-24 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-center">
        <motion.div {...reveal} className="relative">
          <div className="aspect-[5/6] overflow-hidden rounded-[140px_28px_28px_28px] border-[8px] border-white/70 bg-white/30 shadow-[0_30px_70px_rgba(219,39,119,0.18)] backdrop-blur-xl dark:border-purple-500/20 dark:bg-purple-950/20">
            {eventImage ? (
              <img
                src={eventImage}
                alt="Surreal botanical arrangement"
                className="h-full w-full object-cover image-enhanced"
                loading="lazy"
              />
            ) : (
              <div className="grid h-full place-items-center bg-[#F8F2EF] text-sm text-[#9A8E86] dark:bg-zinc-800 dark:text-zinc-400">Atelier image not set</div>
            )}
          </div>
          <div className="absolute -bottom-7 -right-2 hidden w-56 rounded-2xl border border-white/80 bg-white/90 p-5 shadow-2xl backdrop-blur-2xl dark:border-purple-500/30 dark:bg-[#1A1424]/90 sm:block">
            <p className="text-3xl text-amber-500 font-serif">“</p>
            <p className="-mt-2 text-xs leading-5 text-gray-700 dark:text-gray-300">
              Every petal is woven with intention, belonging to your sacred celebration.
            </p>
          </div>
        </motion.div>

        <motion.div {...reveal} className="lg:pl-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#C69236] dark:text-[#E9D8A6]">
            ✦ The Botanical Atelier
          </p>
          <h2 className="mt-4 text-4xl sm:text-5xl font-medium leading-[1.05] text-[#2D2D2D] dark:text-white">
            Sculpting Dreams from <span className="bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent italic font-serif">Living Petals</span>.
          </h2>
          <p className="mt-6 max-w-lg leading-8 text-[#6E6864] dark:text-zinc-300">
            From heirloom-inspired bridal jadai and royal lotus dollars to atmospheric venue styling, we harmonize natural blooms into living poetry.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Personal Floral Consultation",
              "Bespoke Color Harmony",
              "Fresh Premium Harvest",
              "Express Setup Across Tamil Nadu"
            ].map((item) => (
              <p key={item} className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-pink-100 text-[#E85D8E] dark:bg-purple-950 dark:text-pink-300">
                  <FiCheck className="text-xs" />
                </span>
                {item}
              </p>
            ))}
          </div>
          <Link to="/contact" className="btn-luxury mt-9 inline-flex">
            Consult the Atelier <FiArrowRight />
          </Link>
        </motion.div>
      </section>

      {/* ── 6. Surreal Aurora Custom Creation Banner ── */}
      <section className="px-5 py-10 sm:px-8">
        <motion.div
          {...reveal}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-gradient-to-r from-[#2D1B36] via-[#1F1829] to-[#36182B] px-6 py-16 text-white shadow-[0_30px_80px_rgba(45,27,54,0.4)] sm:px-12 lg:px-20 lg:py-20 border border-purple-500/30"
        >
          <div className="surreal-orb top-[-50px] right-[10%] w-[350px] h-[350px] bg-pink-500/30" />
          <div className="surreal-orb bottom-[-50px] left-[10%] w-[400px] h-[400px] bg-purple-600/30" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-pink-300">
                ✦ Your Imagination in Bloom
              </p>
              <h2 className="mt-4 text-3xl sm:text-5xl font-medium leading-tight">
                Conjure a floral design that is <span className="italic font-serif text-pink-300">entirely yours</span>.
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-white/80 text-sm sm:text-base">
                Share your mood, colors, flowers, and message. Our master florists will handcraft your vision into a living masterpiece.
              </p>
            </div>
            <Link
              to="/gallery"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 px-8 text-sm font-bold uppercase tracking-wider text-white shadow-xl transition hover:scale-105"
            >
              Start Creating <FiArrowRight />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── 7. Inspiration Gallery (Whispers of Bloom) ── */}
      <motion.section {...reveal} className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <SectionHeading
          eyebrow="The Atelier Edit"
          title="Echoes of Floral Inspiration"
          copy="Actual botanical works handcrafted for memorable unions in Karur and beyond."
        />
        <div className="mt-14 grid auto-rows-[250px] gap-4 sm:grid-cols-3 sm:auto-rows-[230px]">
          {inspirationTiles.map((tile, index) => (
            <Link
              key={tile.id || tile.src || index}
              to="/gallery"
              className={`group relative overflow-hidden rounded-[26px] border border-white/60 dark:border-purple-500/20 shadow-md ${tile.className || ""}`}
            >
              {tile.src ? (
                <img
                  src={tile.src}
                  alt={tile.label}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110 image-enhanced"
                  loading="lazy"
                />
              ) : (
                <div className="grid h-full place-items-center bg-[#F8F2EF] text-sm text-[#9A8E86] dark:bg-zinc-800 dark:text-zinc-400">No image</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <p className="absolute bottom-5 left-5 text-xl font-serif font-medium text-white group-hover:text-pink-200 transition-colors">
                {tile.label}
              </p>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* ── 8. Kind Words (Love Notes in Petals) ── */}
      <section className="bg-white/40 px-5 py-24 dark:bg-[#120E1A]/40 backdrop-blur-md sm:px-8 sm:py-28 border-t border-pink-100/50 dark:border-purple-900/30">
        <motion.div {...reveal} className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Heartfelt Reveries"
            title="Love Notes Delivered"
            copy="The deepest joy of our art is gracing the moments that define your life."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.name}
                className="rounded-[26px] border border-white/80 bg-white/70 p-7 shadow-lg backdrop-blur-xl dark:border-purple-500/20 dark:bg-[#1A1424]/80 sm:p-8"
              >
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar key={i} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-6 text-xl sm:text-2xl font-serif italic leading-8 text-gray-800 dark:text-gray-100">
                  “{review.quote}”
                </p>
                <div className="mt-7 border-t border-pink-100 pt-5 dark:border-purple-900/40">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{review.name}</p>
                  <p className="mt-0.5 text-xs text-[#8A817C] dark:text-zinc-400">{review.event}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/reviews" className="inline-flex items-center gap-2 text-sm font-bold text-[#E85D8E] hover:underline">
              Read Every Love Note <FiArrowRight />
            </Link>
          </div>
        </motion.div>
      </section>

      {content.promotionalSections?.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {content.promotionalSections.map((section) => (
              <article key={section.id} className="rounded-[22px] border border-white/80 bg-white/70 p-7 shadow-md backdrop-blur-xl dark:border-purple-500/20 dark:bg-[#1A1424]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E85D8E]">Atelier Special</p>
                <h3 className="mt-3 text-2xl font-serif">{section.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#6E6864] dark:text-zinc-400">{section.description}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;

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

const defaultHomeCategoryTiles = [
  { id: "bouquets", name: "Bouquets", note: "For every little love story", image: "/gallery/bouquet/bouquet12.jpg" },
  { id: "hairstyles", name: "Hairstyles", note: "Floral accents for graceful styling", image: "/gallery/hairstyle/hairstyle_1.jpg" },
  { id: "bridal-flowers", name: "Bridal Flowers", note: "Made for your moment", image: "/gallery/bridal/flower11.jpg" },
  { id: "gift-arrangements", name: "Gift Arrangements", note: "A joy to give", image: "/gallery/bouquet/bouquet13.jpg" },
];

const defaultHomeInspirationTiles = [
  { id: "rose-stories", src: "/gallery/bouquet/bouquet1.jpg", label: "Rose stories", className: "sm:row-span-2" },
  { id: "bridal-details", src: "/gallery/bridal/flower12.jpg", label: "Bridal details", className: "" },
  { id: "floral-traditions", src: "/gallery/bouquet/bouquet4.jpg", label: "Floral traditions", className: "" },
  { id: "gifts-with-heart", src: "/gallery/bouquet/bouquet10.jpg", label: "Gifts with heart", className: "sm:col-span-2" },
];

const defaultHomeFallbackProductImages = [
  "/gallery/bouquet/bouquet1.jpg",
  "/gallery/bouquet/bouquet4.jpg",
  "/gallery/bouquet/bouquet13.jpg",
  "/gallery/bouquet/bouquet7.jpg",
];

const defaultContent = {
  heroText: "Flowers that make every moment unforgettable",
  heroDescription:
    "Thoughtfully designed bouquets and florals, handcrafted in Karur with fresh seasonal blooms.",
  badgeText: "Karur's bespoke floral studio",
  primaryButtonLabel: "Shop bouquets",
  primaryButtonLink: "/gallery",
  secondaryButtonLabel: "Plan your event",
  secondaryButtonLink: "/contact",
  homeImagesEditableVersion: 1,
  banners: ["/gallery/bouquet/bouquet13.jpg"],
  featuredProductIds: [],
  promotionalSections: [],
  categoryTiles: defaultHomeCategoryTiles,
  eventImage: "/gallery/bouquet/bouquet6.jpg",
  inspirationTiles: defaultHomeInspirationTiles,
  fallbackProductImages: defaultHomeFallbackProductImages,
  features: ["Handcrafted daily", "Same-day delivery", "Made to order"],
  floatingBadgeTitle: "Wrapped beautifully",
  floatingBadgeSubtitle: "Ready to make their day",
};

const fallbackProducts = [
  { _id: "rose-basket", name: "Blushing Rose Basket", category: "Signature Bouquet", price: 1899, image: "/gallery/bouquet/bouquet1.jpg", badge: "Bestseller" },
  { _id: "pastel-wrap", name: "Pastel Poetry", category: "Hand-tied Bouquet", price: 1499, image: "/gallery/bouquet/bouquet4.jpg", badge: "New" },
  { _id: "celebration", name: "The Celebration Edit", category: "Luxury Arrangement", price: 2499, image: "/gallery/bouquet/bouquet13.jpg", badge: "Signature" },
  { _id: "rose-love", name: "Endless Romance", category: "Rose Bouquet", price: 1299, image: "/gallery/bouquet/bouquet7.jpg", badge: "Popular" },
];

const reviews = [
  { quote: "The bouquet was even more beautiful than I imagined. Every detail felt personal and the flowers stayed fresh for days.", name: "Nivetha R.", event: "Birthday bouquet" },
  { quote: "From the bridal flowers to our centerpieces, everything looked exquisite. They understood our colours perfectly.", name: "Sowmya & Arun", event: "Event collection" },
  { quote: "Elegant packaging, on-time delivery, and genuinely lovely service. My mother was delighted.", name: "Harini K.", event: "Mother's Day gift" },
];

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
};

const SectionHeading = ({ eyebrow, title, copy, align = "center" }) => (
  <div className={align === "left" ? "max-w-2xl" : "mx-auto max-w-2xl text-center"}>
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C69236]">{eyebrow}</p>
    <h2 className="text-4xl font-medium leading-tight text-[#2D2D2D] dark:text-[#F5F5F5] sm:text-5xl">{title}</h2>
    {copy && <p className="mt-4 leading-7 text-[#6E6864] dark:text-zinc-400">{copy}</p>}
  </div>
);

const ProductCard = ({ product }) => {
  const image = product.image || product.images?.[0] || "";
  const price = Number(product.offerPrice || product.price || product.basePrice || 0);

  return (
    <motion.article whileHover={{ y: -8 }} transition={{ duration: 0.25 }} className="group overflow-hidden rounded-[22px] border border-[#E8E5E0] bg-white shadow-[0_14px_40px_rgba(73,50,42,0.07)] dark:border-zinc-800 dark:bg-[#1E1E1E]">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F8F2EF]">
        {image ? (
          <img src={image} alt={product.name || product.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="grid h-full place-items-center bg-[#F8F2EF] text-sm text-[#9A8E86] dark:bg-zinc-800 dark:text-zinc-400">No image</div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9B6D28] backdrop-blur dark:bg-zinc-900/85">
          {product.badge || (product.offerPrice ? "Special price" : "Fresh daily")}
        </span>
        <Link to="/favorites" aria-label="Save to wishlist" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#2D2D2D] shadow-sm backdrop-blur transition hover:bg-[#E85D8E] hover:text-white dark:bg-zinc-900/85 dark:text-white">
          <FiHeart />
        </Link>
        <Link to="/gallery" className="absolute inset-x-4 bottom-4 translate-y-4 rounded-full bg-white/95 py-3 text-center text-sm font-semibold text-[#2D2D2D] opacity-0 shadow-lg backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-zinc-900/95 dark:text-white">
          Quick view
        </Link>
      </div>
      <div className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8DAA91]">{product.category || "Fresh flowers"}</p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h3 className="text-2xl font-medium text-[#2D2D2D] dark:text-white">{product.name || product.title}</h3>
          <p className="shrink-0 pt-1 text-sm font-semibold text-[#E85D8E]">₹{price.toLocaleString("en-IN")}</p>
        </div>
        <Link to="/gallery" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2D2D2D] transition hover:text-[#E85D8E] dark:text-zinc-200">
          Choose this bouquet <FiArrowRight />
        </Link>
      </div>
    </motion.article>
  );
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

  return (
    <div className="overflow-hidden bg-[#FFF9F6] text-[#2D2D2D] transition-colors dark:bg-[#121212] dark:text-[#F5F5F5]">
      <SeoHead seoOverride={pageSeo} breadcrumbs={[{ name: 'Home', url: '/' }]} />
      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[linear-gradient(135deg,#FFF9F6,#FCEFF3,#F5F7F2)] dark:bg-[linear-gradient(135deg,#121212,#1d1519,#151a16)]">
        <span className="hero-petal left-[8%] top-[16%] rotate-12" />
        <span className="hero-petal left-[46%] top-[10%] -rotate-12 [animation-delay:1.8s]" />
        <span className="hero-petal right-[7%] top-[24%] rotate-45 [animation-delay:3.4s]" />
        <span className="hero-petal bottom-[12%] left-[42%] rotate-90 [animation-delay:2.6s]" />

        <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-[1440px] items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-16 xl:px-20">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#936B53] shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-rose-200">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E85D8E]" /> {content.badgeText}
            </div>
            <h1 className="text-[clamp(3.35rem,7vw,7.25rem)] font-medium leading-[0.88] tracking-[-0.045em] text-[#2D2D2D] dark:text-white">
              {content.heroText}
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#655E5A] dark:text-zinc-300 sm:text-lg">{content.heroDescription}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to={content.primaryButtonLink || "/gallery"} className="btn-luxury">
                {content.primaryButtonLabel || "Shop bouquets"} <FiArrowRight />
              </Link>
              <Link to={content.secondaryButtonLink || "/contact"} className="btn-luxury-outline">
                {content.secondaryButtonLabel || "Plan your event"}
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs font-medium text-[#756C67] dark:text-zinc-400">
              {content.features?.map((feature, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  <FiCheck className="text-[#8DAA91]" /> {feature}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.95, delay: 0.15 }} className="relative mx-auto w-full max-w-[720px] lg:ml-auto">
            <div className="absolute -left-8 top-16 h-48 w-48 rounded-full bg-[#E85D8E]/15 blur-3xl" />
            <div className="relative ml-auto aspect-[4/5] max-h-[720px] overflow-hidden rounded-[160px_160px_32px_32px] border-[10px] border-white/60 bg-white shadow-[0_30px_80px_rgba(94,62,52,0.18)] dark:border-white/5 dark:bg-[#1E1E1E] sm:border-[14px]">
              {heroImage ? (
                <img src={heroImage} alt="Midhunyas signature floral arrangement" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center bg-[#F8F2EF] text-sm text-[#9A8E86] dark:bg-zinc-800 dark:text-zinc-400">Hero image not set</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10" />
            </div>
            <div className="absolute -bottom-5 left-0 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/85 p-4 pr-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/85">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[#FCEFF3] text-[#E85D8E] dark:bg-rose-950"><FiGift /></div>
              <div><p className="text-sm font-semibold">{content.floatingBadgeTitle || "Wrapped beautifully"}</p><p className="text-[11px] text-[#817873] dark:text-zinc-400">{content.floatingBadgeSubtitle || "Ready to make their day"}</p></div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-[#E8E5E0] bg-white/70 dark:border-zinc-800 dark:bg-[#181818]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-[#E8E5E0] px-4 dark:divide-zinc-800 md:grid-cols-4">
          {[
            [FiTruck, "Thoughtful delivery", "Across Karur"],
            [FiGift, "Gift-ready", "Premium wrapping"],
            [FiCalendar, "Event specialists", "Book a consultation"],
            [FiShoppingBag, "Freshly made", "Never mass produced"],
          ].map(([Icon, title, note]) => (
            <div key={title} className="flex items-center gap-3 px-4 py-5 sm:px-7">
              <Icon className="shrink-0 text-xl text-[#E85D8E]" />
              <div><p className="text-xs font-semibold sm:text-sm">{title}</p><p className="mt-0.5 text-[10px] text-[#8A817C] sm:text-xs">{note}</p></div>
            </div>
          ))}
        </div>
      </section>

      <motion.section {...reveal} className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <SectionHeading eyebrow="Find your flowers" title="Made for life's beautiful moments" copy="From a quiet thank-you to the grandest celebration, find flowers that say it just right." />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categoryTiles.map((category, index) => (
            <motion.div key={category.id || category.name || index} whileHover={{ y: -8 }} transition={{ duration: 0.25 }}>
              <Link to="/gallery" className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-white shadow-[0_14px_36px_rgba(73,50,42,0.08)]">
                  {category.image ? (
                    <img src={category.image} alt={category.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                  ) : (
                    <div className="grid h-full place-items-center bg-[#F8F2EF] text-sm text-[#9A8E86] dark:bg-zinc-800 dark:text-zinc-400">No image</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <span className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">0{index + 1}</span>
                    <h3 className="text-3xl font-medium">{category.name}</h3>
                    <p className="mt-1 text-xs text-white/75">{category.note}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">Explore <FiArrowRight /></span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <section className="bg-[#F6F1EB] px-5 py-24 dark:bg-[#181818] sm:px-8 sm:py-28">
        <motion.div {...reveal} className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading align="left" eyebrow="Most loved" title="The favourites" copy="Flowers our customers return to, designed fresh for every order." />
            <Link to="/gallery" className="inline-flex items-center gap-2 text-sm font-semibold text-[#E85D8E]">View all flowers <FiArrowRight /></Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((product) => <ProductCard key={product._id || product.id} product={product} />)}
          </div>
        </motion.div>
      </section>

      <section id="events" className="mx-auto grid max-w-7xl scroll-mt-24 gap-12 px-5 py-24 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-center">
        <motion.div {...reveal} className="relative">
          <div className="aspect-[5/6] overflow-hidden rounded-[120px_24px_24px_24px] bg-[#F6F1EB]">
            {eventImage ? (
              <img src={eventImage} alt="Bespoke flower arrangement" className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="grid h-full place-items-center bg-[#F8F2EF] text-sm text-[#9A8E86] dark:bg-zinc-800 dark:text-zinc-400">Event image not set</div>
            )}
          </div>
          <div className="absolute -bottom-7 -right-2 hidden w-52 rounded-2xl border border-[#E8E5E0] bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-[#1E1E1E] sm:block">
            <p className="text-4xl text-[#D4AF37]">“</p><p className="-mt-3 text-sm leading-6">Every bloom, chosen to belong to your story.</p>
          </div>
        </motion.div>
        <motion.div {...reveal} className="lg:pl-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#C69236]">The floral atelier</p>
          <h2 className="mt-4 text-5xl font-medium leading-[0.98] sm:text-6xl">Flowers as unforgettable as the vows.</h2>
          <p className="mt-6 max-w-lg leading-8 text-[#6E6864] dark:text-zinc-400">From heirloom-inspired bouquets and bridal flowers to graceful venue details, we compose every element around your traditions, palette, and story.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {["Personal floral consultation", "Custom colour palettes", "Fresh, premium blooms", "Delivery & event setup"].map((item) => <p key={item} className="flex items-center gap-3 text-sm"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#FCEFF3] text-[#E85D8E] dark:bg-rose-950"><FiCheck /></span>{item}</p>)}
          </div>
          <Link to="/contact" className="btn-luxury mt-9">Book a consultation <FiArrowRight /></Link>
        </motion.div>
      </section>

      <section className="px-5 py-8 sm:px-8">
        <motion.div {...reveal} className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[#8DAA91] px-6 py-16 text-white shadow-[0_24px_60px_rgba(76,96,79,0.18)] sm:px-12 lg:px-20 lg:py-20">
          <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full border border-white/15" />
          <div className="absolute -right-8 -top-12 h-64 w-64 rounded-full border border-white/15" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">Your idea, in bloom</p>
              <h2 className="mt-4 text-4xl font-medium leading-tight sm:text-6xl">Build a bouquet that's entirely yours.</h2>
              <p className="mt-5 max-w-2xl leading-7 text-white/80">Choose your mood, colours, flowers, finishing touches, and a personal note. We’ll handcraft the rest.</p>
            </div>
            <Link to="/gallery" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-[#49634E] shadow-xl transition hover:scale-105">Start creating <FiArrowRight /></Link>
          </div>
        </motion.div>
      </section>

      <motion.section {...reveal} className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <SectionHeading eyebrow="The Midhunyas edit" title="A little floral inspiration" copy="Real flowers, handcrafted for real celebrations in and around Karur." />
        <div className="mt-12 grid auto-rows-[250px] gap-4 sm:grid-cols-3 sm:auto-rows-[230px]">
          {inspirationTiles.map((tile, index) => (
            <Link key={tile.id || tile.src || index} to="/gallery" className={`group relative overflow-hidden rounded-[22px] ${tile.className || ""}`}>
              {tile.src ? (
                <img src={tile.src} alt={tile.label} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
              ) : (
                <div className="grid h-full place-items-center bg-[#F8F2EF] text-sm text-[#9A8E86] dark:bg-zinc-800 dark:text-zinc-400">No image</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <p className="absolute bottom-5 left-5 text-2xl font-medium text-white">{tile.label}</p>
            </Link>
          ))}
        </div>
      </motion.section>

      <section className="bg-white px-5 py-24 dark:bg-[#181818] sm:px-8 sm:py-28">
        <motion.div {...reveal} className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Kind words" title="Love, delivered" copy="The loveliest part of our work is becoming a small part of your biggest moments." />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.name} className="rounded-[22px] border border-[#E8E5E0] bg-[#FFF9F6] p-7 dark:border-zinc-800 dark:bg-[#121212] sm:p-8">
                <div className="flex gap-1 text-[#D4AF37]">{Array.from({ length: 5 }).map((_, i) => <FiStar key={i} fill="currentColor" />)}</div>
                <p className="mt-7 text-2xl leading-9">“{review.quote}”</p>
                <div className="mt-8 border-t border-[#E8E5E0] pt-5 dark:border-zinc-800"><p className="text-sm font-semibold">{review.name}</p><p className="mt-1 text-xs text-[#8A817C]">{review.event}</p></div>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center"><Link to="/reviews" className="inline-flex items-center gap-2 text-sm font-semibold text-[#E85D8E]">Read every love note <FiArrowRight /></Link></div>
        </motion.div>
      </section>

      {content.promotionalSections?.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {content.promotionalSections.map((section) => (
              <article key={section.id} className="rounded-[22px] border border-[#E8E5E0] bg-white p-7 dark:border-zinc-800 dark:bg-[#1E1E1E]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E85D8E]">Special from our studio</p>
                <h3 className="mt-3 text-2xl">{section.title}</h3><p className="mt-3 text-sm leading-7 text-[#6E6864] dark:text-zinc-400">{section.description}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { galleryService } from "../api/galleryService";
import { userService } from "../api/userService";
import { useAuth } from "../context/AuthContext";
import { SITE_EVENTS, subscribeToSiteEvent } from "../lib/siteEvents";
import { subscribeToTable } from "../lib/supabaseRealtime";

const PriceINR = ({ amount }) => <span className="font-semibold">₹{Number(amount || 0).toLocaleString("en-IN")}</span>;

const HeartIcon = ({ filled }) => (
  <svg className={`h-5 w-5 ${filled ? "text-rose-500" : "text-rose-300"}`} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4">
    <path d="M12 21s-7-4.6-9.3-7.2C-.1 9 3 4 7.5 4A5.6 5.6 0 0112 7.1 5.6 5.6 0 0116.5 4C20.9 4 24 9 21.3 13.8 19 16.4 12 21 12 21z" />
  </svg>
);

const BookmarkIcon = ({ filled }) => (
  <svg className={`h-5 w-5 ${filled ? "text-amber-500" : "text-amber-300"}`} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7">
    <path d="M6 4h12a1 1 0 011 1v15l-7-4-7 4V5a1 1 0 011-1z" />
  </svg>
);

const GalleryPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ key: "all", label: "All" }]);

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [filterOption, setFilterOption] = useState("all");
  const [isFetching, setIsFetching] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  
  const [likedProductIds, setLikedProductIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("guest_likes") || "[]")); } catch { return new Set(); }
  });
  const [wishlistProductIds, setWishlistProductIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("guest_wishlist") || "[]")); } catch { return new Set(); }
  });

  const fetchCategories = async () => {
    try {
      const data = await galleryService.categories();
      const order = ["Bouquets", "Hairstyles", "Bridal Flowers"];
      const sortedData = data.sort((a, b) => {
        const indexA = order.indexOf(a.label);
        const indexB = order.indexOf(b.label);
        if (indexA === -1 && indexB === -1) return a.label.localeCompare(b.label);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      setCategories([{ key: "all", label: "All" }, ...sortedData.map((item) => ({ key: item.value, label: item.label }))]);
    } catch (error) { console.error("Failed to load categories", error); }
  };

  const fetchProducts = async () => {
    setIsFetching(true);
    try {
      const data = await galleryService.list({
        limit: 1000,
        search: debouncedSearch || undefined,
        category: activeCategory !== "all" ? activeCategory : undefined,
        filter: filterOption !== "all" ? filterOption : undefined,
        sort: sortOption,
      });
      setProducts(data.products || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load products. Please try again.");
    } finally { setIsFetching(false); }
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500); return () => clearTimeout(timer); }, [searchQuery]);
  useEffect(() => { fetchProducts(); }, [activeCategory, debouncedSearch, sortOption, filterOption]);
  useEffect(() => subscribeToSiteEvent(SITE_EVENTS.galleryChanged, () => { fetchCategories(); fetchProducts(); }), [activeCategory, debouncedSearch, sortOption, filterOption]);
  useEffect(() => subscribeToTable({ table: "Product", onChange: fetchProducts, channelName: "gallery-products" }), [activeCategory, debouncedSearch, sortOption, filterOption]);
  
  useEffect(() => {
    const observer = new MutationObserver(() => setIsDarkMode(document.documentElement.classList.contains("dark")));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (isAuthenticated && user) {
      setLikedProductIds(new Set(user.likes || []));
      setWishlistProductIds(new Set(user.wishlist || []));
    }
  }, [isAuthenticated, user]);

  const toggleLike = async (id) => {
    const next = new Set(likedProductIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setLikedProductIds(next);
    try {
      if (isAuthenticated) {
        const likes = await userService.toggleLike(id);
        updateUser?.({ likes });
      } else localStorage.setItem("guest_likes", JSON.stringify([...next]));
      toast(next.has(id) ? "Added to favorites" : "Removed from favorites");
    } catch (error) { setLikedProductIds(new Set(user?.likes || [])); toast.error("Could not update favorites"); }
  };

  const toggleWishlist = async (id) => {
    const next = new Set(wishlistProductIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setWishlistProductIds(next);
    try {
      if (isAuthenticated) {
        const wishlist = await userService.toggleWishlist(id);
        updateUser?.({ wishlist });
      } else localStorage.setItem("guest_wishlist", JSON.stringify([...next]));
      toast.success(next.has(id) ? "Saved for later" : "Removed from saved");
    } catch (error) { setWishlistProductIds(new Set(user?.wishlist || [])); toast.error("Could not update wishlist"); }
  };

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? "bg-gray-900" : "bg-[#fff9f7]"}`}>
      <section className="relative h-[80vh] w-full overflow-hidden md:h-[85vh]">
        <div className="absolute inset-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('https://5258c99641bea1ec763a.b-cdn.net/wp-content/uploads/2024/06/wedding-flowers-budget-title-image.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-4">
          <p className="text-xs uppercase tracking-[0.35em] text-rose-100/80 md:text-sm">Flower Gallery</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-white md:text-4xl lg:text-5xl">Capture every <span className="text-rose-200">special moment</span> with handcrafted flowers.</h1>
        </div>
      </section>

      <section id="gallery" className="relative z-10 -mt-16 pb-10 md:-mt-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className={`rounded-3xl p-4 shadow-xl backdrop-blur-sm md:p-6 ${isDarkMode ? "bg-gray-800/95" : "bg-white/95"}`}>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 dark:border-gray-700">
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <div className="relative w-full max-w-sm md:w-auto">
                  <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search products..." className={`w-full rounded-xl border py-2 pl-10 pr-4 outline-none ${isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-200 bg-gray-50"}`} />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div className="flex flex-1 gap-2 overflow-x-auto py-2">
                  {categories.map((item) => (
                    <button key={item.key} onClick={() => setActiveCategory(item.key)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${activeCategory === item.key ? "bg-rose-600 text-white shadow-md" : isDarkMode ? "bg-gray-700 text-gray-300" : "border border-rose-200 bg-rose-50/50 text-rose-700"}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex w-full gap-3 md:w-auto">
                <select value={filterOption} onChange={(event) => setFilterOption(event.target.value)} className={`flex-1 rounded-xl border px-4 py-2 text-sm font-medium outline-none ${isDarkMode ? "border-gray-600 bg-gray-700 text-gray-200" : "border-gray-200 bg-gray-50"}`}>
                  <option value="all">All Products</option>
                  <option value="latest">Latest</option>
                  <option value="high-selling">High Selling</option>
                  <option value="offered">Offered</option>
                  <option value="combo">Combo</option>
                </select>
                <select value={sortOption} onChange={(event) => setSortOption(event.target.value)} className={`flex-1 rounded-xl border px-4 py-2 text-sm font-medium outline-none ${isDarkMode ? "border-gray-600 bg-gray-700 text-gray-200" : "border-gray-200 bg-gray-50"}`}>
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>
            </div>

            {isFetching ? (
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => <div key={index} className={`h-80 animate-pulse rounded-xl ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />)}
              </div>
            ) : products.length ? (
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {products.map((item, index) => (
                  <article key={item._id} onClick={() => navigate(`/product/${item._id}`)} style={{ animationDelay: `${index * 0.05}s` }} className={`group relative cursor-pointer overflow-hidden rounded-xl shadow-md transition hover:-translate-y-1 hover:shadow-xl ${isDarkMode ? "border border-gray-700 bg-gray-800" : "bg-white"} ${item.status === "Unavailable" ? "opacity-60 grayscale-[.5]" : ""}`}>
                    <div className="relative aspect-[4/5] overflow-hidden">
                      {item.image ? <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" /> : <div className="grid h-full place-items-center bg-gray-100 text-gray-400">No image</div>}
                      {item.status === "Unavailable" && <div className="absolute inset-0 grid place-items-center bg-black/40"><span className="rounded bg-red-600 px-3 py-1 text-sm font-bold text-white">Unavailable</span></div>}
                    </div>
                    <div className="absolute right-2 top-2 z-10 flex flex-col gap-2">
                      <button onClick={(event) => { event.stopPropagation(); toggleLike(item._id); }} className="rounded-full bg-white/90 p-2 shadow"><HeartIcon filled={likedProductIds.has(item._id)} /></button>
                      <button onClick={(event) => { event.stopPropagation(); toggleWishlist(item._id); }} className="rounded-full bg-white/90 p-2 shadow"><BookmarkIcon filled={wishlistProductIds.has(item._id)} /></button>
                    </div>
                    <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
                      {item.badge && item.badge !== "Normal" && <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase text-white ${item.badge === "Offer" ? "bg-rose-600" : "bg-emerald-600"}`}>{item.badge}</span>}
                      {item.analytics?.primaryTag && <span className="rounded bg-gray-950/75 px-2 py-1 text-[9px] font-bold uppercase text-white">{item.analytics.primaryTag}</span>}
                    </div>
                    <div className="p-3">
                      <h3 className={`truncate text-sm font-bold ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>{item.name}</h3>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          {item.offerPrice && item.badge === "Offer" ? (
                            <><span className="block text-xs text-gray-500 line-through">₹{item.price?.toLocaleString("en-IN")}</span><span className="font-bold text-rose-600"><PriceINR amount={item.offerPrice} /></span></>
                          ) : (
                            <span className="font-bold text-rose-600"><PriceINR amount={item.price} /></span>
                          )}
                        </div>
                        <button onClick={(event) => { event.stopPropagation(); navigate(`/product/${item._id}`); }} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white">View</button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <button onClick={(event) => { event.stopPropagation(); navigate(`/product/${item._id}`); }} className="flex items-center gap-1 text-[10px] font-medium text-yellow-500">★ {item.analytics?.averageRating || "Reviews"} ({item.analytics?.reviewCount || 0})</button>
                        {item.customizedAvailable && <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-semibold text-purple-700">Customizable</span>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : <div className="py-20 text-center text-gray-500"><p className="text-lg font-medium">No products found</p><p className="text-sm">Try adjusting your filters or search query.</p></div>}
          </div>
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;

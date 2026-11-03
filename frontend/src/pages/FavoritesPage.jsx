import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { galleryService } from "../api/galleryService";
import { useAuth } from "../context/AuthContext";
import { subscribeToTable } from "../lib/supabaseRealtime";

const FavoritesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("likes");
  const [isDarkMode] = React.useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await galleryService.list({ limit: 1000 });
        setProducts(data.products || []);
      } catch (error) {
        console.error("Failed to load saved products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    const unsubscribe = subscribeToTable({
      table: "Product",
      onChange: fetchProducts,
      channelName: "favorites-products",
    });

    return unsubscribe;
  }, []);

  const likedProductIds = useMemo(() => {
    if (isAuthenticated && user?.likes) return new Set(user.likes);

    try {
      const raw = localStorage.getItem("guest_likes");
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }, [isAuthenticated, user?.likes]);

  const wishlistProductIds = useMemo(() => {
    if (isAuthenticated && user?.wishlist) return new Set(user.wishlist);

    try {
      const raw = localStorage.getItem("guest_wishlist");
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }, [isAuthenticated, user?.wishlist]);

  const likes = useMemo(() => products.filter((product) => likedProductIds.has(product._id)), [products, likedProductIds]);
  const wishlist = useMemo(
    () => products.filter((product) => wishlistProductIds.has(product._id)),
    [products, wishlistProductIds]
  );

  const activeItems = activeTab === "likes" ? likes : wishlist;

  if (loading) return <div className="p-10 text-center">Loading saved products...</div>;

  if (activeItems.length === 0) {
    return (
      <div
        className={`min-h-[60vh] flex flex-col items-center justify-center text-center p-4 transition-colors duration-300 ${
          isDarkMode ? "bg-[#160F17] text-[#FAF5EE]" : "bg-[#FAF5EE] text-[#30232A]"
        }`}
      >
        <div className="mb-6 inline-flex rounded-full border border-[#E8DDD5] dark:border-[#493640] p-1 text-sm bg-white dark:bg-[#231722]">
          <button
            onClick={() => setActiveTab("likes")}
            className={`rounded-full px-4 py-2 font-medium transition ${activeTab === "likes" ? "bg-[#651F3C] text-white shadow-sm" : "text-[#30232A] dark:text-[#FAF5EE]"}`}
          >
            Likes ({likes.length})
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`rounded-full px-4 py-2 font-medium transition ${activeTab === "wishlist" ? "bg-[#651F3C] text-white shadow-sm" : "text-[#30232A] dark:text-[#FAF5EE]"}`}
          >
            Wishlist ({wishlist.length})
          </button>
        </div>
        <h1 className="text-2xl font-serif font-bold mb-3">{activeTab === "likes" ? "No Favorites Yet" : "No Wishlist Items Yet"}</h1>
        <p className={`mb-6 max-w-md ${isDarkMode ? "text-[#8E7A83]" : "text-[#81747A]"}`}>
          Browse the gallery and save the floral designs you want to come back to later.
        </p>
        <Link to="/gallery" className="px-6 py-2.5 bg-[#651F3C] text-white rounded-full font-medium hover:bg-[#4D172D] transition shadow-md">
          Go to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-[#160F17] text-[#FAF5EE]" : "bg-[#FAF5EE] text-[#30232A]"}`}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className={`text-3xl font-serif font-bold mb-2 ${isDarkMode ? "text-[#FAF5EE]" : "text-[#651F3C]"}`}>Saved Products</h1>
            <p className={`${isDarkMode ? "text-[#8E7A83]" : "text-[#81747A]"}`}>
              Likes and wishlist items stay tied to your account.
            </p>
          </div>

          <div className="inline-flex rounded-full border border-[#E8DDD5] dark:border-[#493640] bg-white dark:bg-[#231722] p-1 text-sm shadow-sm">
            <button
              onClick={() => setActiveTab("likes")}
              className={`rounded-full px-4 py-2 font-medium transition ${activeTab === "likes" ? "bg-[#651F3C] text-white shadow-sm" : "text-[#30232A] dark:text-[#FAF5EE]"}`}
            >
              Likes ({likes.length})
            </button>
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`rounded-full px-4 py-2 font-medium transition ${activeTab === "wishlist" ? "bg-[#651F3C] text-white shadow-sm" : "text-[#30232A] dark:text-[#FAF5EE]"}`}
            >
              Wishlist ({wishlist.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {activeItems.map((item) => (
            <Link
              key={item._id}
              to={`/product/${item._id}`}
              className={`rounded-xl overflow-hidden shadow-sm transition hover:shadow-lg border border-[#E8DDD5] dark:border-[#493640] ${isDarkMode ? "bg-[#261B22]" : "bg-white"}`}
            >
              <div className="aspect-[4/5] relative overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              </div>
              <div className="p-3">
                <h3 className={`font-bold truncate text-sm ${isDarkMode ? "text-[#FAF5EF]" : "text-[#30232A]"}`}>{item.name}</h3>
                <p className="text-[#651F3C] dark:text-[#D5B36C] text-xs font-semibold mt-1">₹{item.price?.toLocaleString("en-IN")}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;

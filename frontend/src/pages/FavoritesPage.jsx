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
          isDarkMode ? "bg-gray-900 text-gray-100" : "bg-[#fff9f7] text-rose-900"
        }`}
      >
        <div className="mb-6 inline-flex rounded-full border border-rose-200 p-1 text-sm">
          <button
            onClick={() => setActiveTab("likes")}
            className={`rounded-full px-4 py-2 ${activeTab === "likes" ? "bg-rose-600 text-white" : ""}`}
          >
            Likes ({likes.length})
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`rounded-full px-4 py-2 ${activeTab === "wishlist" ? "bg-rose-600 text-white" : ""}`}
          >
            Wishlist ({wishlist.length})
          </button>
        </div>
        <h1 className="text-2xl font-bold mb-3">{activeTab === "likes" ? "No Favorites Yet" : "No Wishlist Items Yet"}</h1>
        <p className={`mb-6 max-w-md ${isDarkMode ? "text-gray-400" : "text-rose-600"}`}>
          Browse the gallery and save the floral designs you want to come back to later.
        </p>
        <Link to="/gallery" className="px-6 py-2 bg-rose-600 text-white rounded-full font-medium hover:bg-rose-700 transition">
          Go to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-[#fff9f7]"}`}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-rose-900"}`}>Saved Products</h1>
            <p className={`${isDarkMode ? "text-gray-400" : "text-rose-700"}`}>
              Likes and wishlist items stay tied to your account in PostgreSQL.
            </p>
          </div>

          <div className="inline-flex rounded-full border border-rose-200 bg-white/80 p-1 text-sm shadow-sm">
            <button
              onClick={() => setActiveTab("likes")}
              className={`rounded-full px-4 py-2 font-medium ${activeTab === "likes" ? "bg-rose-600 text-white" : "text-rose-700"}`}
            >
              Likes ({likes.length})
            </button>
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`rounded-full px-4 py-2 font-medium ${activeTab === "wishlist" ? "bg-rose-600 text-white" : "text-rose-700"}`}
            >
              Wishlist ({wishlist.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {activeItems.map((item) => (
            <Link
              key={item._id}
              to="/gallery"
              className={`rounded-xl overflow-hidden shadow transition hover:shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
            >
              <div className="aspect-[4/5] relative">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <h3 className={`font-bold truncate text-sm ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>{item.name}</h3>
                <p className="text-rose-500 text-xs font-semibold mt-1">₹{item.price?.toLocaleString("en-IN")}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;

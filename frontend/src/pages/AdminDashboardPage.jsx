import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import { galleryService } from "../api/galleryService";
import { contentService } from "../api/contentService";
import { reviewService } from "../api/reviewService";
import { adminService } from "../api/adminService";
import { userService } from "../api/userService";
import { toast } from "react-hot-toast";
import { FaEdit, FaTrash, FaPlus, FaImage, FaKey, FaSave, FaChartBar, FaThumbtack, FaEyeSlash, FaSearch, FaEye, FaGlobe, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";
import ProductFormModal from "../components/ProductFormModal";
import AdminProductCard from "../components/AdminProductCard";
import DeleteProductDialog from "../components/DeleteProductDialog";
import { toGoogleMapsEmbedUrl } from "../utils/googleMaps";

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

const createDefaultHomeContent = () => ({
  heroText: "",
  heroDescription: "",
  badgeText: "",
  primaryButtonLabel: "",
  primaryButtonLink: "",
  secondaryButtonLabel: "",
  secondaryButtonLink: "",
  features: [],
  floatingBadgeTitle: "",
  floatingBadgeSubtitle: "",
  banners: [],
  featuredProductIds: [],
  promotionalSections: [],
  categoryTiles: defaultHomeCategoryTiles,
  eventImage: "/gallery/bouquet/bouquet6.jpg",
  inspirationTiles: defaultHomeInspirationTiles,
  fallbackProductImages: defaultHomeFallbackProductImages,
});

const createDefaultAboutContent = () => ({
  title: "",
  description: "",
  mission: "",
  vision: "",
  companyStory: "",
  heroImage: "",
  galleryImages: [],
  team: [],
});

const createDefaultContactContent = () => ({
  title: "",
  description: "",
  shopName: "",
  workingHours: "",
  phonePrimary: "",
  phoneSecondary: "",
  whatsapp: "",
  email: "",
  instaUrl: "",
  facebookUrl: "",
  youtubeUrl: "",
  address: "",
  googleMapUrl: "",
});

const AdminDashboardPage = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const [users, setUsers] = useState([]);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ name: "", email: "", phone: "", password: "", role: "user" });
  const [userFilters, setUserFilters] = useState({ search: "", role: "", status: "" });
  const [viewingUser, setViewingUser] = useState(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const [contentTab, setContentTab] = useState("home");
  const [homeContent, setHomeContent] = useState(createDefaultHomeContent());
  const [aboutContent, setAboutContent] = useState(createDefaultAboutContent());
  const [contactContent, setContactContent] = useState(createDefaultContactContent());
  const [homeBannerFiles, setHomeBannerFiles] = useState([]);
  const [homeCategoryImageFiles, setHomeCategoryImageFiles] = useState({});
  const [homeEventImageFile, setHomeEventImageFile] = useState(null);
  const [homeInspirationImageFiles, setHomeInspirationImageFiles] = useState({});
  const [homeFallbackProductImageFiles, setHomeFallbackProductImageFiles] = useState({});
  const [aboutHeroFile, setAboutHeroFile] = useState(null);
  const [aboutGalleryFiles, setAboutGalleryFiles] = useState([]);

  // SEO State
  const [seoConfig, setSeoConfig] = useState(null);
  const [seoPages, setSeoPages] = useState([]);
  const [seoHealth, setSeoHealth] = useState(null);
  const [seoSubTab, setSeoSubTab] = useState("global");
  const [seoConfigForm, setSeoConfigForm] = useState({});
  const [seoPageEditKey, setSeoPageEditKey] = useState(null);
  const [seoPageForm, setSeoPageForm] = useState({});
  const [seoSitemap, setSeoSitemap] = useState("");
  const [seoRobots, setSeoRobots] = useState("");
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoSaving, setSeoSaving] = useState(false);

  const isDarkMode = document.documentElement.classList.contains("dark");

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      setAnalytics(await adminService.getDashboard());
    } catch (error) {
      toast.error("Failed to fetch dashboard analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([
        galleryService.list({ limit: 1000 }),
        galleryService.categories(),
      ]);
      setProducts(productData.products || []);
      setCategories(categoryData || []);
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await userService.listUsers({
        search: userFilters.search || undefined,
        role: userFilters.role || undefined,
        status: userFilters.status || undefined,
      });
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await reviewService.list();
      setReviews(data);
    } catch (error) {
      toast.error("Failed to fetch reviews");
    }
  };

  const fetchContent = async () => {
    try {
      const [home, about, contact] = await Promise.all([
        contentService.get("home-highlight"),
        contentService.get("about"),
        contentService.get("contact"),
      ]);
      setHomeContent({ ...createDefaultHomeContent(), ...(home || {}) });
      setAboutContent({ ...createDefaultAboutContent(), ...(about || {}) });
      setContactContent({ ...createDefaultContactContent(), ...(contact || {}) });
    } catch (error) {
      toast.error("Failed to fetch content sections");
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchAnalytics();
    fetchProducts();
    fetchReviews();
    fetchContent();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
  }, [isAdmin, userFilters.search, userFilters.role, userFilters.status]);

  // SEO functions
  const fetchSeoData = async () => {
    setSeoLoading(true);
    try {
      const [configRes, pagesRes] = await Promise.all([
        axios.get("/seo/config"),
        axios.get("/seo/pages"),
      ]);
      setSeoConfig(configRes.data.config);
      setSeoConfigForm(configRes.data.config);
      setSeoPages(pagesRes.data.pages || []);
    } catch (e) {
      toast.error("Failed to load SEO data");
    } finally {
      setSeoLoading(false);
    }
  };

  const fetchSeoHealth = async () => {
    try {
      const res = await axios.get("/seo/health");
      setSeoHealth(res.data.health);
    } catch (e) {}
  };

  const fetchSeoSitemap = async () => {
    try {
      const res = await axios.get("/seo/sitemap.xml");
      setSeoSitemap(typeof res.data === "string" ? res.data : JSON.stringify(res.data, null, 2));
    } catch (e) {}
  };

  const fetchSeoRobots = async () => {
    try {
      const res = await axios.get("/seo/robots.txt");
      setSeoRobots(typeof res.data === "string" ? res.data : "");
    } catch (e) {}
  };

  const saveSeoConfig = async (e) => {
    e.preventDefault();
    setSeoSaving(true);
    try {
      const res = await axios.put("/seo/config", seoConfigForm);
      setSeoConfig(res.data.config);
      toast.success("SEO settings saved!");
    } catch (e) {
      toast.error("Failed to save SEO settings");
    } finally {
      setSeoSaving(false);
    }
  };

  const saveSeoPage = async (e) => {
    e.preventDefault();
    if (!seoPageEditKey) return;
    setSeoSaving(true);
    try {
      const res = await axios.put(`/seo/pages/${seoPageEditKey}`, seoPageForm);
      setSeoPages((prev) => prev.map((p) => p.pageKey === seoPageEditKey ? res.data.page : p));
      setSeoPageEditKey(null);
      setSeoPageForm({});
      toast.success("Page SEO saved!");
    } catch (e) {
      toast.error("Failed to save page SEO");
    } finally {
      setSeoSaving(false);
    }
  };

  useEffect(() => {
    if (!isAdmin || activeTab !== "seo") return;
    fetchSeoData();
    fetchSeoHealth();
  }, [isAdmin, activeTab]);

  useEffect(() => {
    if (!isAdmin || activeTab !== "seo") return;
    if (seoSubTab === "sitemap") fetchSeoSitemap();
    if (seoSubTab === "sitemap") fetchSeoRobots();
  }, [seoSubTab, activeTab]);

  if (!isAdmin) {
    return <div className="p-10 text-center text-red-500 font-bold text-xl">Access Denied. Admins only.</div>;
  }

  const handleSubmit = async (productData) => {
    try {
      if (isEditing && currentProduct) {
        const updated = await galleryService.update(currentProduct._id, productData);
        setProducts((items) => items.map((item) => (item._id === updated._id ? updated : item)));
        toast.success("Product Updated Successfully");
      } else {
        const created = await galleryService.create(productData);
        setProducts((items) => [created, ...items]);
        toast.success("Product Added Successfully");
      }

      await Promise.all([fetchProducts(), fetchAnalytics()]);
      setShowForm(false);
      setCurrentProduct(null);
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
      throw error;
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeletingProduct(true);
    try {
      await galleryService.remove(productToDelete._id);
      setProducts((items) => items.filter((item) => item._id !== productToDelete._id));
      setProductToDelete(null);
      toast.success("Product Deleted Successfully");
      await fetchAnalytics();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await userService.deleteUser(id);
      toast.success("User deleted successfully");
      await Promise.all([fetchUsers(), fetchAnalytics()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleEditUserSubmit = async (event) => {
    event.preventDefault();
    if (editUserForm.password && editUserForm.password.length < 8) {
      return toast.error("Password must be at least 8 characters if provided");
    }
    try {
      await userService.adminUpdateUser(selectedUser._id, {
        fullName: editUserForm.name,
        email: editUserForm.email,
        phoneNumber: editUserForm.phone,
        password: editUserForm.password || undefined,
        role: editUserForm.role,
      });
      toast.success("User details updated successfully");
      setShowEditUserModal(false);
      setEditUserForm({ name: "", email: "", phone: "", password: "", role: "user" });
      setSelectedUser(null);
      await Promise.all([fetchUsers(), fetchAnalytics()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user details");
    }
  };

  const handleToggleUserStatus = async (user) => {
    if (user.role === "admin") return;
    try {
      await userService.updateUserStatus(user._id, !user.isActive);
      toast.success(user.isActive ? "User disabled successfully" : "User enabled successfully");
      await Promise.all([fetchUsers(), fetchAnalytics()]);
      if (viewingUser?._id === user._id) {
        setViewingUser((current) => (current ? { ...current, isActive: !current.isActive } : current));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user status");
    }
  };

  const openUserDetails = async (user) => {
    setLoadingUserDetail(true);
    try {
      const [details, activities] = await Promise.all([
        userService.getUserById(user._id),
        userService.getUserActivities(user._id),
      ]);
      setViewingUser({ ...details, activities });
    } catch (error) {
      toast.error("Failed to load user details");
    } finally {
      setLoadingUserDetail(false);
    }
  };

  const buildHomeFilePayload = () => {
    const payload = { bannerFiles: homeBannerFiles };

    if (homeEventImageFile) payload.homeEventImageFile = homeEventImageFile;
    Object.entries(homeCategoryImageFiles).forEach(([index, file]) => {
      if (file) payload[`homeCategoryImage_${index}`] = file;
    });
    Object.entries(homeInspirationImageFiles).forEach(([index, file]) => {
      if (file) payload[`homeInspirationImage_${index}`] = file;
    });
    Object.entries(homeFallbackProductImageFiles).forEach(([index, file]) => {
      if (file) payload[`homeFallbackProductImage_${index}`] = file;
    });

    return payload;
  };

  const updateHomeListItem = (collection, index, field, value) =>
    setHomeContent((current) => {
      const nextItems = [...(current[collection] || [])];
      nextItems[index] = { ...(nextItems[index] || {}), [field]: value };
      return { ...current, [collection]: nextItems };
    });

  const updateHomeFallbackImage = (index, value) =>
    setHomeContent((current) => {
      const nextImages = [...(current.fallbackProductImages || [])];
      nextImages[index] = value;
      return { ...current, fallbackProductImages: nextImages };
    });

  const saveHomeContent = async (event) => {
    event.preventDefault();
    try {
      const updated = await contentService.update("home-highlight", homeContent, buildHomeFilePayload());
      setHomeContent({ ...createDefaultHomeContent(), ...(updated || {}) });
      setHomeBannerFiles([]);
      setHomeCategoryImageFiles({});
      setHomeEventImageFile(null);
      setHomeInspirationImageFiles({});
      setHomeFallbackProductImageFiles({});
      toast.success("Home content updated");
      await fetchAnalytics();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update home content");
    }
  };

  const saveAboutContent = async (event) => {
    event.preventDefault();
    try {
      const updated = await contentService.update("about", aboutContent, {
        heroImageFile: aboutHeroFile,
        galleryFiles: aboutGalleryFiles,
      });
      setAboutContent({ ...createDefaultAboutContent(), ...(updated || {}) });
      setAboutHeroFile(null);
      setAboutGalleryFiles([]);
      toast.success("About content updated");
      await fetchAnalytics();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update about content");
    }
  };

  const saveContactContent = async (event) => {
    event.preventDefault();
    try {
      const updated = await contentService.update("contact", contactContent);
      setContactContent({ ...createDefaultContactContent(), ...(updated || {}) });
      toast.success("Contact content updated");
      await fetchAnalytics();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update contact content");
    }
  };

  const submitReviewEdit = async (event) => {
    event.preventDefault();
    try {
      const updated = await reviewService.update(editingReview._id, {
        rating: editingReview.rating,
        comment: editingReview.comment,
        userName: editingReview.userName,
        isHidden: editingReview.isHidden,
        isPinned: editingReview.isPinned,
      });
      setReviews((items) => items.map((item) => (item._id === updated._id ? updated : item)));
      setShowReviewModal(false);
      setEditingReview(null);
      toast.success("Review updated");
      await fetchAnalytics();
    } catch (error) {
      toast.error("Failed to update review");
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await reviewService.remove(id);
      setReviews((items) => items.filter((item) => item._id !== id));
      toast.success("Review deleted");
      await fetchAnalytics();
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const addPromoSection = () =>
    setHomeContent((current) => ({
      ...current,
      promotionalSections: [
        ...(current.promotionalSections || []),
        { id: `promo-${Date.now()}`, title: "", description: "" },
      ],
    }));

  const updatePromoSection = (id, field, value) =>
    setHomeContent((current) => ({
      ...current,
      promotionalSections: (current.promotionalSections || []).map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      ),
    }));

  const removePromoSection = (id) =>
    setHomeContent((current) => ({
      ...current,
      promotionalSections: (current.promotionalSections || []).filter((section) => section.id !== id),
    }));

  const addTeamMember = () =>
    setAboutContent((current) => ({
      ...current,
      team: [
        ...(current.team || []),
        { id: `team-${Date.now()}`, name: "", role: "", bio: "" },
      ],
    }));

  const updateTeamMember = (id, field, value) =>
    setAboutContent((current) => ({
      ...current,
      team: (current.team || []).map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      ),
    }));

  const removeTeamMember = (id) =>
    setAboutContent((current) => ({
      ...current,
      team: (current.team || []).filter((member) => member.id !== id),
    }));

  const analyticsCards = [
    { label: "Total Users", value: analytics?.totalUsers ?? 0 },
    { label: "Total Products", value: analytics?.totalProducts ?? 0 },
    { label: "Orders", value: analytics?.totalOrders ?? 0 },
    { label: "Revenue", value: `₹${Number(analytics?.totalRevenue ?? 0).toLocaleString("en-IN")}` },
    { label: "Reviews", value: analytics?.totalReviews ?? 0 },
    { label: "Categories", value: analytics?.totalCategories ?? 0 },
    { label: "Featured Products", value: analytics?.featuredProducts ?? 0 },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">Admin Portal</h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Management Console</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {["overview", "products", "content", "reviews", "users", "seo"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium capitalize transition flex items-center gap-3 ${
                activeTab === tab
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {tab === "overview" && <FaChartBar className="text-lg" />}
              {tab === "products" && <FaImage className="text-lg" />}
              {tab === "content" && <FaEdit className="text-lg" />}
              {tab === "reviews" && <FaThumbtack className="text-lg" />}
              {tab === "users" && <FaKey className="text-lg" />}
              {tab === "seo" && <FaGlobe className="text-lg" />}
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle could go here */}
            <h2 className="text-xl font-bold text-gray-800 dark:text-white capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold border-2 border-rose-200 dark:border-rose-800 shadow-sm">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          
          {/* Mobile Tabs (Fallback) */}
          <div className="md:hidden flex overflow-x-auto gap-2 mb-6 pb-2">
            {["overview", "products", "content", "reviews", "users", "seo"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 whitespace-nowrap rounded-lg font-medium capitalize transition text-sm ${
                  activeTab === tab
                    ? "bg-rose-600 text-white shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Business Overview</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track your store's performance at a glance.</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {analyticsLoading
                  ? [...Array(8)].map((_, index) => (
                      <div key={index} className="h-28 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700" />
                    ))
                  : analyticsCards.map((card, i) => (
                      <div
                        key={card.label}
                        className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 dark:border-gray-700 dark:bg-gray-800 transition hover:shadow-md"
                      >
                        <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-rose-50/50 dark:bg-gray-700/50 blur-2xl" />
                        <div className="relative flex items-center gap-4">
                          <span className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-inner ${
                            i % 2 === 0 ? "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                          }`}>
                            <FaChartBar className="text-xl" />
                          </span>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{card.label}</p>
                            <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{card.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
              <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-500">Merchandising analyzer</p>
                    <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">Order and review insights</h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Latest, High Selling, Offered and Top Rated labels update automatically.</p>
                </div>
                <div className="mt-5 grid gap-3 lg:grid-cols-5">
                  {(analytics?.merchandisingInsights || []).length ? analytics.merchandisingInsights.map((item) => (
                    <article key={item.id} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900/60">
                      <div className="flex items-center gap-3">
                        {item.image ? <img src={item.image} alt="" className="h-11 w-11 rounded-lg object-cover" /> : <div className="h-11 w-11 rounded-lg bg-gray-200 dark:bg-gray-700" />}
                        <div className="min-w-0"><p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p><p className="text-[10px] text-gray-500">Score {item.score}</p></div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">{(item.tags || []).map((tag) => <span key={tag} className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">{tag}</span>)}</div>
                      <p className="mt-3 text-[10px] text-gray-500">{item.unitsSold} sold · {item.reviewCount} reviews · {item.averageRating || 0}★</p>
                    </article>
                  )) : <p className="col-span-full py-4 text-sm text-gray-500">Add products and receive orders or reviews to generate insights.</p>}
                </div>
              </section>
            </div>
          )}

      {activeTab === "products" && (
        <>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Gallery</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">All product changes sync to the user gallery automatically.</p>
            </div>
            <button
              onClick={() => {
                setCurrentProduct(null);
                setIsEditing(false);
                setShowForm(true);
              }}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 font-semibold text-white shadow-lg transition hover:bg-rose-700"
            >
              <FaPlus /> <span className="hidden sm:inline">Add Product</span><span className="sm:hidden">Add</span>
            </button>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="h-80 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700" />
              ))}
            </div>
          ) : products.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <AdminProductCard
                  key={product._id}
                  product={product}
                  onEdit={(item) => {
                    setCurrentProduct(item);
                    setIsEditing(true);
                    setShowForm(true);
                  }}
                  onDelete={setProductToDelete}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center dark:border-gray-700">
              <FaImage className="mx-auto mb-3 text-4xl text-gray-300" />
              <p className="font-semibold text-gray-700 dark:text-gray-200">No gallery products yet</p>
            </div>
          )}
        </>
      )}

      {activeTab === "content" && (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 flex flex-col gap-2">
            {["home", "about", "contact"].map((tab) => (
              <button
                key={tab}
                onClick={() => setContentTab(tab)}
                className={`p-3 text-left rounded-lg transition capitalize ${
                  contentTab === tab
                    ? "bg-rose-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {tab} Page
              </button>
            ))}
          </div>

          <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
            {contentTab === "home" && (
              <form onSubmit={saveHomeContent} className="space-y-5">
                <h2 className="text-xl font-bold dark:text-white border-b pb-2">Home Page Management</h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Hero Text</label>
                    <input className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" value={homeContent.heroText || ""} onChange={(e) => setHomeContent({ ...homeContent, heroText: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Badge Text</label>
                    <input className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" value={homeContent.badgeText || ""} onChange={(e) => setHomeContent({ ...homeContent, badgeText: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Hero Description</label>
                  <textarea rows="4" className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" value={homeContent.heroDescription || ""} onChange={(e) => setHomeContent({ ...homeContent, heroDescription: e.target.value })} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Primary Button Label</label>
                    <input className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" value={homeContent.primaryButtonLabel || ""} onChange={(e) => setHomeContent({ ...homeContent, primaryButtonLabel: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Primary Button Link</label>
                    <input className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" value={homeContent.primaryButtonLink || ""} onChange={(e) => setHomeContent({ ...homeContent, primaryButtonLink: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Secondary Button Label</label>
                    <input className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" value={homeContent.secondaryButtonLabel || ""} onChange={(e) => setHomeContent({ ...homeContent, secondaryButtonLabel: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Secondary Button Link</label>
                    <input className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" value={homeContent.secondaryButtonLink || ""} onChange={(e) => setHomeContent({ ...homeContent, secondaryButtonLink: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Features List (Comma Separated)</label>
                  <input className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" placeholder="Handcrafted daily, Same-day delivery" value={homeContent.features ? homeContent.features.join(", ") : ""} onChange={(e) => setHomeContent({ ...homeContent, features: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Floating Badge Title</label>
                    <input className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" placeholder="Wrapped beautifully" value={homeContent.floatingBadgeTitle || ""} onChange={(e) => setHomeContent({ ...homeContent, floatingBadgeTitle: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Floating Badge Subtitle</label>
                    <input className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" placeholder="Ready to make their day" value={homeContent.floatingBadgeSubtitle || ""} onChange={(e) => setHomeContent({ ...homeContent, floatingBadgeSubtitle: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold dark:text-white">Event / Atelier Image</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">This controls the large image in the wedding/event section on the Home page.</p>
                  </div>
                  {homeContent.eventImage && <img src={homeContent.eventImage} alt="Home event section" className="h-44 w-full max-w-md rounded-xl object-cover" />}
                  {homeEventImageFile && <p className="text-xs font-medium text-emerald-600">{homeEventImageFile.name} ready to upload.</p>}
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer rounded-lg bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600">
                      Upload / Replace Image
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => setHomeEventImageFile(e.target.files?.[0] || null)} />
                    </label>
                    <button type="button" onClick={() => { setHomeContent({ ...homeContent, eventImage: "" }); setHomeEventImageFile(null); }} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-500">
                      Remove Image
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold dark:text-white">Home Banner Posters</h3>
                    <label className="cursor-pointer rounded-lg bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600">
                      Upload Posters
                      <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setHomeBannerFiles(Array.from(e.target.files || []))} />
                    </label>
                  </div>
                  {homeContent.banners?.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {homeContent.banners.map((banner) => (
                        <div key={banner} className="relative overflow-hidden rounded-xl border border-gray-200">
                          <img src={banner} alt="Home banner" className="h-28 w-full object-cover" />
                          <button type="button" onClick={() => setHomeContent({ ...homeContent, banners: homeContent.banners.filter((item) => item !== banner) })} className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-red-500">
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {homeBannerFiles.length > 0 && <p className="text-xs text-gray-500">{homeBannerFiles.length} new banner file(s) ready to upload.</p>}
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold dark:text-white">Home Category Card Images</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Upload, replace, or remove the images used in the category cards.</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {(homeContent.categoryTiles || []).map((tile, index) => (
                      <div key={tile.id || index} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                        {tile.image ? (
                          <img src={tile.image} alt={tile.name || "Home category"} className="h-28 w-full rounded-lg object-cover" />
                        ) : (
                          <div className="grid h-28 place-items-center rounded-lg bg-gray-100 text-xs text-gray-400 dark:bg-gray-700">No image</div>
                        )}
                        {homeCategoryImageFiles[index] && <p className="mt-2 text-xs font-medium text-emerald-600">{homeCategoryImageFiles[index].name} ready.</p>}
                        <input className="mt-3 w-full rounded border p-2 text-sm dark:bg-gray-700 dark:border-gray-600" placeholder="Card title" value={tile.name || ""} onChange={(e) => updateHomeListItem("categoryTiles", index, "name", e.target.value)} />
                        <input className="mt-2 w-full rounded border p-2 text-sm dark:bg-gray-700 dark:border-gray-600" placeholder="Card subtitle" value={tile.note || ""} onChange={(e) => updateHomeListItem("categoryTiles", index, "note", e.target.value)} />
                        <div className="mt-3 flex flex-wrap gap-2">
                          <label className="cursor-pointer rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                            Upload / Replace
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => setHomeCategoryImageFiles((current) => ({ ...current, [index]: e.target.files?.[0] || null }))} />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              updateHomeListItem("categoryTiles", index, "image", "");
                              setHomeCategoryImageFiles((current) => {
                                const next = { ...current };
                                delete next[index];
                                return next;
                              });
                            }}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold dark:text-white">Manage Featured Products</h3>
                  <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                      <label key={product._id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <input
                          type="checkbox"
                          checked={homeContent.featuredProductIds?.includes(product._id)}
                          onChange={(e) =>
                            setHomeContent((current) => ({
                              ...current,
                              featuredProductIds: e.target.checked
                                ? [...(current.featuredProductIds || []), product._id]
                                : (current.featuredProductIds || []).filter((id) => id !== product._id),
                            }))
                          }
                        />
                        <span className="text-sm dark:text-gray-200">{product.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold dark:text-white">Most-Loved Fallback Images</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">These are used only when no featured products are available. Product images themselves are managed in the Products tab.</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {(homeContent.fallbackProductImages || defaultHomeFallbackProductImages).map((image, index) => (
                      <div key={index} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                        {image ? (
                          <img src={image} alt={`Fallback product ${index + 1}`} className="h-28 w-full rounded-lg object-cover" />
                        ) : (
                          <div className="grid h-28 place-items-center rounded-lg bg-gray-100 text-xs text-gray-400 dark:bg-gray-700">No image</div>
                        )}
                        {homeFallbackProductImageFiles[index] && <p className="mt-2 text-xs font-medium text-emerald-600">{homeFallbackProductImageFiles[index].name} ready.</p>}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <label className="cursor-pointer rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                            Upload / Replace
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => setHomeFallbackProductImageFiles((current) => ({ ...current, [index]: e.target.files?.[0] || null }))} />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              updateHomeFallbackImage(index, "");
                              setHomeFallbackProductImageFiles((current) => {
                                const next = { ...current };
                                delete next[index];
                                return next;
                              });
                            }}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold dark:text-white">Home Inspiration Gallery Images</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Controls the image grid near the bottom of the Home page.</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {(homeContent.inspirationTiles || []).map((tile, index) => (
                      <div key={tile.id || index} className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                        {tile.src ? (
                          <img src={tile.src} alt={tile.label || "Home inspiration"} className="h-28 w-full rounded-lg object-cover" />
                        ) : (
                          <div className="grid h-28 place-items-center rounded-lg bg-gray-100 text-xs text-gray-400 dark:bg-gray-700">No image</div>
                        )}
                        {homeInspirationImageFiles[index] && <p className="mt-2 text-xs font-medium text-emerald-600">{homeInspirationImageFiles[index].name} ready.</p>}
                        <input className="mt-3 w-full rounded border p-2 text-sm dark:bg-gray-700 dark:border-gray-600" placeholder="Image label" value={tile.label || ""} onChange={(e) => updateHomeListItem("inspirationTiles", index, "label", e.target.value)} />
                        <div className="mt-3 flex flex-wrap gap-2">
                          <label className="cursor-pointer rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                            Upload / Replace
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => setHomeInspirationImageFiles((current) => ({ ...current, [index]: e.target.files?.[0] || null }))} />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              updateHomeListItem("inspirationTiles", index, "src", "");
                              setHomeInspirationImageFiles((current) => {
                                const next = { ...current };
                                delete next[index];
                                return next;
                              });
                            }}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold dark:text-white">Promotional Sections</h3>
                    <button type="button" onClick={addPromoSection} className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600">
                      <FaPlus className="inline mr-2" /> Add Section
                    </button>
                  </div>
                  {(homeContent.promotionalSections || []).map((section) => (
                    <div key={section.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                        <input className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" placeholder="Section Title" value={section.title || ""} onChange={(e) => updatePromoSection(section.id, "title", e.target.value)} />
                        <button type="button" onClick={() => removePromoSection(section.id)} className="rounded-lg border border-red-200 px-4 py-2 text-red-500">
                          <FaTrash />
                        </button>
                      </div>
                      <textarea rows="3" className="mt-3 w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" placeholder="Section Description" value={section.description || ""} onChange={(e) => updatePromoSection(section.id, "description", e.target.value)} />
                    </div>
                  ))}
                </div>

                <button type="submit" className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-lg flex items-center gap-2 hover:bg-rose-700">
                  <FaSave /> Save Home Content
                </button>
              </form>
            )}

            {contentTab === "about" && (
              <form onSubmit={saveAboutContent} className="space-y-5">
                <h2 className="text-xl font-bold dark:text-white border-b pb-2">About Page Management</h2>

                {["title", "description", "mission", "vision", "companyStory"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-1 capitalize dark:text-gray-300">{field}</label>
                    {field === "description" || field === "companyStory" || field === "mission" || field === "vision" ? (
                      <textarea rows="4" className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" value={aboutContent[field] || ""} onChange={(e) => setAboutContent({ ...aboutContent, [field]: e.target.value })} />
                    ) : (
                      <input className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" value={aboutContent[field] || ""} onChange={(e) => setAboutContent({ ...aboutContent, [field]: e.target.value })} />
                    )}
                  </div>
                ))}

                <div className="space-y-3">
                  <h3 className="font-semibold dark:text-white">Hero Image</h3>
                  {aboutContent.heroImage && <img src={aboutContent.heroImage} alt="About hero" className="h-40 rounded-xl object-cover" />}
                  <label className="cursor-pointer rounded-lg bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 inline-flex">
                    Upload Hero Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setAboutHeroFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold dark:text-white">Gallery Images</h3>
                  {aboutContent.galleryImages?.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {aboutContent.galleryImages.map((image) => (
                        <div key={image} className="relative overflow-hidden rounded-xl border border-gray-200">
                          <img src={image} alt="About gallery" className="h-24 w-full object-cover" />
                          <button type="button" onClick={() => setAboutContent({ ...aboutContent, galleryImages: aboutContent.galleryImages.filter((item) => item !== image) })} className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-red-500">
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="cursor-pointer rounded-lg bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 inline-flex">
                    Upload Gallery Images
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setAboutGalleryFiles(Array.from(e.target.files || []))} />
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold dark:text-white">Team Section</h3>
                    <button type="button" onClick={addTeamMember} className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600">
                      <FaPlus className="inline mr-2" /> Add Team Member
                    </button>
                  </div>
                  {(aboutContent.team || []).map((member) => (
                    <div key={member.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                        <input className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" placeholder="Name" value={member.name || ""} onChange={(e) => updateTeamMember(member.id, "name", e.target.value)} />
                        <input className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" placeholder="Role" value={member.role || ""} onChange={(e) => updateTeamMember(member.id, "role", e.target.value)} />
                        <button type="button" onClick={() => removeTeamMember(member.id)} className="rounded-lg border border-red-200 px-4 py-2 text-red-500">
                          <FaTrash />
                        </button>
                      </div>
                      <textarea rows="3" className="mt-3 w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" placeholder="Bio" value={member.bio || ""} onChange={(e) => updateTeamMember(member.id, "bio", e.target.value)} />
                    </div>
                  ))}
                </div>

                <button type="submit" className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-lg flex items-center gap-2 hover:bg-rose-700">
                  <FaSave /> Save About Content
                </button>
              </form>
            )}

            {contentTab === "contact" && (
              <form onSubmit={saveContactContent} className="space-y-4">
                <h2 className="text-xl font-bold dark:text-white border-b pb-2">Contact Page Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ["title", "Title"],
                    ["shopName", "Shop Name"],
                    ["workingHours", "Working Hours"],
                    ["phonePrimary", "Primary Phone"],
                    ["phoneSecondary", "Secondary Phone"],
                    ["whatsapp", "WhatsApp"],
                    ["email", "Email"],
                    ["instaUrl", "Instagram URL"],
                    ["facebookUrl", "Facebook URL"],
                    ["youtubeUrl", "YouTube URL"],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">{label}</label>
                      <input className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" value={contactContent[field] || ""} onChange={(e) => setContactContent({ ...contactContent, [field]: e.target.value })} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                  <textarea rows="3" className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" value={contactContent.description || ""} onChange={(e) => setContactContent({ ...contactContent, description: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Address</label>
                  <textarea rows="3" className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600" value={contactContent.address || ""} onChange={(e) => setContactContent({ ...contactContent, address: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Google Maps Link or Embed Code</label>
                  <textarea
                    rows="3"
                    className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600"
                    placeholder='Paste a Google Maps share link, place URL, or full <iframe src="..."> embed code'
                    value={contactContent.googleMapUrl || ""}
                    onChange={(e) => setContactContent({ ...contactContent, googleMapUrl: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">The Contact page converts this automatically into an embeddable map.</p>
                  <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                    <iframe title="Contact map preview" src={toGoogleMapsEmbedUrl(contactContent.googleMapUrl || contactContent.address)} className="h-64 w-full border-0" loading="lazy" />
                  </div>
                </div>
                <button type="submit" className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-lg flex items-center gap-2 hover:bg-rose-700">
                  <FaSave /> Save Contact Content
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <th className="p-4 border-b dark:border-gray-600">User</th>
                  <th className="p-4 border-b dark:border-gray-600">Rating</th>
                  <th className="p-4 border-b dark:border-gray-600">Comment</th>
                  <th className="p-4 border-b dark:border-gray-600">Flags</th>
                  <th className="p-4 border-b dark:border-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b dark:border-gray-700">
                    <td className="p-4 text-gray-600 dark:text-gray-300">{review.userName}</td>
                    <td className="p-4 text-yellow-500 font-bold">{review.rating} ★</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400 text-sm max-w-sm truncate">{review.comment}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {review.isPinned && <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">Pinned</span>}
                        {review.isHidden && <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-bold text-slate-700">Hidden</span>}
                      </div>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button onClick={() => { setEditingReview({ ...review }); setShowReviewModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteReview(review._id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "seo" && (
        <div className="space-y-6">
          {/* SEO Score Banner */}
          {seoHealth && (
            <div className={`rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 ${seoHealth.score >= 80 ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800" : seoHealth.score >= 60 ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"}`}>
              <div className={`text-5xl font-black ${seoHealth.score >= 80 ? "text-emerald-600" : seoHealth.score >= 60 ? "text-amber-600" : "text-red-600"}`}>{seoHealth.score}</div>
              <div className="flex-1">
                <p className="font-bold text-gray-800 dark:text-white text-lg">SEO Health Score — Grade {seoHealth.grade}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{seoHealth.totalPages} pages · {seoHealth.productsWithImages}/{seoHealth.totalProducts} products with images</p>
                {seoHealth.issues?.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{seoHealth.issues.length} issue(s) found — check Health tab to fix</p>
                )}
              </div>
              <button onClick={fetchSeoHealth} className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">Refresh Score</button>
            </div>
          )}

          {/* Sub-tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "global", label: "⚙️ Global Settings" },
              { key: "pages", label: "📄 Page SEO" },
              { key: "sitemap", label: "🗺️ Sitemap & Robots" },
              { key: "health", label: "🔍 Health Check" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSeoSubTab(key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${seoSubTab === key ? "bg-rose-600 text-white shadow" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {seoLoading && (
            <div className="h-32 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
          )}

          {/* ── Global Settings ── */}
          {!seoLoading && seoSubTab === "global" && (
            <form onSubmit={saveSeoConfig} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow p-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Business & SEO Configuration</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ["businessName", "Business Name"],
                  ["businessSlogan", "Tagline / Slogan"],
                  ["address", "Address"],
                  ["city", "City"],
                  ["state", "State"],
                  ["postalCode", "Postal Code"],
                  ["phone", "Phone"],
                  ["whatsapp", "WhatsApp"],
                  ["email", "Email"],
                  ["latitude", "Latitude (GPS)"],
                  ["longitude", "Longitude (GPS)"],
                  ["googleMapsUrl", "Google Maps URL"],
                  ["siteUrl", "Website URL (Production)"],
                  ["logoUrl", "Logo URL"],
                  ["faviconUrl", "Favicon URL"],
                  ["defaultOgImage", "Default OG Social Image URL"],
                ].map(([field, label]) => (
                  <label key={field} className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
                    <input
                      type="text"
                      value={seoConfigForm[field] || ""}
                      onChange={(e) => setSeoConfigForm((p) => ({ ...p, [field]: e.target.value }))}
                      className="rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </label>
                ))}
              </div>

              <div className="border-t dark:border-gray-700 pt-4">
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">🔍 Analytics & Verification</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    ["ga4MeasurementId", "Google Analytics 4 ID (G-XXXXXX)"],
                    ["gtmContainerId", "Google Tag Manager ID (GTM-XXXXX)"],
                    ["gscVerificationCode", "Google Search Console Verification Code"],
                    ["bingVerificationCode", "Bing Webmaster Verification Code"],
                  ].map(([field, label]) => (
                    <label key={field} className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
                      <input
                        type="text"
                        value={seoConfigForm[field] || ""}
                        onChange={(e) => setSeoConfigForm((p) => ({ ...p, [field]: e.target.value }))}
                        className="rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t dark:border-gray-700 pt-4">
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">📱 Social Media Links</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    ["instagramUrl", "Instagram URL"],
                    ["facebookUrl", "Facebook URL"],
                    ["twitterHandle", "Twitter/X Handle (@username)"],
                    ["facebookAppId", "Facebook App ID"],
                  ].map(([field, label]) => (
                    <label key={field} className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
                      <input
                        type="text"
                        value={seoConfigForm[field] || ""}
                        onChange={(e) => setSeoConfigForm((p) => ({ ...p, [field]: e.target.value }))}
                        className="rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t dark:border-gray-700 pt-4">
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">🤖 Custom Robots.txt Rules</h4>
                <textarea
                  rows={4}
                  value={seoConfigForm.robotsCustomRules || ""}
                  onChange={(e) => setSeoConfigForm((p) => ({ ...p, robotsCustomRules: e.target.value }))}
                  placeholder="e.g. Disallow: /private/"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={seoSaving} className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition shadow disabled:opacity-60">
                  {seoSaving ? "Saving…" : "💾 Save SEO Settings"}
                </button>
              </div>
            </form>
          )}

          {/* ── Page SEO Manager ── */}
          {!seoLoading && seoSubTab === "pages" && (
            <div className="space-y-4">
              {!seoPageEditKey ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Page</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">SEO Title</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Title Length</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Desc Length</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {seoPages.map((page) => {
                        const tLen = (page.metaTitle || "").length;
                        const dLen = (page.metaDescription || "").length;
                        const tOk = tLen >= 50 && tLen <= 65;
                        const dOk = dLen >= 120 && dLen <= 165;
                        return (
                          <tr key={page.pageKey} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                            <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white capitalize">{page.pageTitle || page.pageKey}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">{page.metaTitle}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${tOk ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                {tLen} chars
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${dOk ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                {dLen} chars
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => { setSeoPageEditKey(page.pageKey); setSeoPageForm({ ...page }); }}
                                className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-semibold hover:bg-rose-100 transition"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <form onSubmit={saveSeoPage} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white capitalize">Edit: {seoPageEditKey} Page SEO</h3>
                    <button type="button" onClick={() => { setSeoPageEditKey(null); setSeoPageForm({}); }} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
                  </div>

                  {[
                    { field: "metaTitle", label: "Meta Title", hint: "50–60 chars ideal", max: 65 },
                    { field: "metaDescription", label: "Meta Description", hint: "150–160 chars ideal", max: 165, textarea: true },
                    { field: "keywords", label: "Keywords (comma separated)", hint: "" },
                    { field: "ogTitle", label: "Open Graph Title", hint: "Shown on Facebook/WhatsApp" },
                    { field: "ogDescription", label: "Open Graph Description", hint: "" },
                    { field: "ogImage", label: "OG Image URL", hint: "1200×630px recommended" },
                    { field: "canonicalUrl", label: "Canonical URL", hint: "Leave empty for auto" },
                  ].map(({ field, label, hint, max, textarea }) => (
                    <label key={field} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
                        {hint && <span className="text-xs text-gray-400">{hint}</span>}
                        {max && (
                          <span className={`text-xs font-mono ${(seoPageForm[field] || "").length > max ? "text-red-500" : "text-gray-400"}`}>
                            {(seoPageForm[field] || "").length}/{max}
                          </span>
                        )}
                      </div>
                      {textarea ? (
                        <textarea
                          rows={3}
                          value={seoPageForm[field] || ""}
                          onChange={(e) => setSeoPageForm((p) => ({ ...p, [field]: e.target.value }))}
                          className="rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={seoPageForm[field] || ""}
                          onChange={(e) => setSeoPageForm((p) => ({ ...p, [field]: e.target.value }))}
                          className="rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                        />
                      )}
                    </label>
                  ))}

                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Robots Tag</span>
                    <select
                      value={seoPageForm.robots || "index, follow"}
                      onChange={(e) => setSeoPageForm((p) => ({ ...p, robots: e.target.value }))}
                      className="rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="index, follow">index, follow</option>
                      <option value="noindex, follow">noindex, follow</option>
                      <option value="index, nofollow">index, nofollow</option>
                      <option value="noindex, nofollow">noindex, nofollow</option>
                    </select>
                  </label>

                  <div className="flex justify-end gap-3 pt-2 border-t dark:border-gray-700">
                    <button type="button" onClick={() => { setSeoPageEditKey(null); setSeoPageForm({}); }} className="px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm">Cancel</button>
                    <button type="submit" disabled={seoSaving} className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition shadow disabled:opacity-60 text-sm">
                      {seoSaving ? "Saving…" : "Save Page SEO"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ── Sitemap & Robots ── */}
          {!seoLoading && seoSubTab === "sitemap" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <a
                  href="/api/seo/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition shadow"
                >
                  🗺️ Open sitemap.xml
                </a>
                <a
                  href="/api/seo/robots.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition shadow"
                >
                  🤖 Open robots.txt
                </a>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow p-4">
                  <h4 className="font-semibold text-gray-700 dark:text-white mb-3 text-sm">sitemap.xml Preview</h4>
                  <pre className="text-xs font-mono text-gray-600 dark:text-gray-300 overflow-auto max-h-80 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 whitespace-pre-wrap">{seoSitemap || "Loading…"}</pre>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow p-4">
                  <h4 className="font-semibold text-gray-700 dark:text-white mb-3 text-sm">robots.txt Preview</h4>
                  <pre className="text-xs font-mono text-gray-600 dark:text-gray-300 overflow-auto max-h-80 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 whitespace-pre-wrap">{seoRobots || "Loading…"}</pre>
                </div>
              </div>
              <p className="text-xs text-gray-400">Sitemap auto-includes all AVAILABLE products. Edit your Custom Robots Rules in Global Settings.</p>
            </div>
          )}

          {/* ── SEO Health Check ── */}
          {!seoLoading && seoSubTab === "health" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">SEO Issue Report</h3>
                <button onClick={fetchSeoHealth} className="px-4 py-2 text-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  🔄 Re-run Check
                </button>
              </div>
              {seoHealth ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow overflow-hidden">
                  {seoHealth.issues?.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="text-4xl mb-2">🎉</div>
                      <p className="font-bold text-emerald-600 text-lg">No SEO issues found!</p>
                      <p className="text-gray-500 text-sm mt-1">Your site SEO looks great.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {seoHealth.issues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                          <div className="mt-0.5 flex-shrink-0">
                            {issue.severity === "error" && <FaTimesCircle className="text-red-500 text-lg" />}
                            {issue.severity === "warning" && <FaExclamationTriangle className="text-amber-500 text-lg" />}
                            {issue.severity === "info" && <FaInfoCircle className="text-blue-500 text-lg" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 dark:text-white text-sm">{issue.issue}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Page: <span className="font-mono">{issue.page}</span></p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${issue.severity === "error" ? "bg-red-100 text-red-700" : issue.severity === "warning" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                            {issue.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-32 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 dark:border-gray-700 md:flex-row md:items-center md:justify-between">
            <input
              value={userFilters.search}
              onChange={(event) => setUserFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search users by name, email, or phone"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-rose-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white md:max-w-sm"
            />

            <div className="flex gap-3">
              <select
                value={userFilters.role}
                onChange={(event) => setUserFilters((current) => ({ ...current, role: event.target.value }))}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-rose-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
              </select>
              <select
                value={userFilters.status}
                onChange={(event) => setUserFilters((current) => ({ ...current, status: event.target.value }))}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-rose-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <th className="p-4 border-b dark:border-gray-600">Name</th>
                  <th className="p-4 border-b dark:border-gray-600">Email</th>
                  <th className="p-4 border-b dark:border-gray-600">Role</th>
                  <th className="p-4 border-b dark:border-gray-600">Status</th>
                  <th className="p-4 border-b dark:border-gray-600">Activity</th>
                  <th className="p-4 border-b dark:border-gray-600">Joined</th>
                  <th className="p-4 border-b dark:border-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b dark:border-gray-700">
                    <td className="p-4 text-gray-800 dark:text-gray-200">{user.name}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${user.isActive === false ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {user.isActive === false ? "Disabled" : "Active"}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                      <div>{user.orderCount || 0} orders</div>
                      <div>{user.reviewCount || 0} reviews</div>
                      <div>{user.cartCount || 0} cart items</div>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 flex justify-end gap-2">
                      <button onClick={() => openUserDetails(user)} className="rounded p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" title="View user details">
                        <FaEye />
                      </button>
                      <button onClick={() => { setSelectedUser(user); setEditUserForm({ name: user.name || user.fullName || "", email: user.email || "", phone: user.phoneNumber || user.phone || "", password: "", role: user.role?.toLowerCase() || "user" }); setShowEditUserModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition" title="Edit User">
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        disabled={user.role === "admin"}
                        className={`rounded p-2 transition ${user.role === "admin" ? "text-gray-300 cursor-not-allowed" : user.isActive === false ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30" : "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30"}`}
                        title={user.isActive === false ? "Enable user" : "Disable user"}
                      >
                        {user.isActive === false ? "On" : "Off"}
                      </button>
                      <button onClick={() => handleDeleteUser(user._id)} disabled={user.role === "admin"} className={`p-2 rounded transition ${user.role === "admin" ? "text-gray-300 cursor-not-allowed" : "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"}`}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}



      <ProductFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setCurrentProduct(null);
          setIsEditing(false);
        }}
        onSubmit={handleSubmit}
        initialData={currentProduct}
        isDarkMode={isDarkMode}
        categories={categories}
      />

      <DeleteProductDialog
        product={productToDelete}
        isDeleting={isDeletingProduct}
        onCancel={() => !isDeletingProduct && setProductToDelete(null)}
        onConfirm={handleDeleteProduct}
      />
      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Edit User</h2>
            <p className="text-sm text-gray-500 mb-6">Updating details for <strong>{selectedUser.email}</strong></p>

            <form onSubmit={handleEditUserSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 p-2.5 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email Address</label>
                <input
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 p-2.5 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Mobile Number</label>
                <input
                  type="tel"
                  value={editUserForm.phone}
                  onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 p-2.5 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Role</label>
                <select
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 p-2.5 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                >
                  <option value="user">User</option>
                  <option value="subadmin">Subadmin</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">New Password <span className="text-xs text-gray-500">(Leave blank to keep current)</span></label>
                <input
                  type="password"
                  value={editUserForm.password}
                  onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 p-2.5 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                  minLength="8"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowEditUserModal(false); setEditUserForm({ name: "", email: "", phone: "", password: "", role: "user" }); }} className="px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition shadow">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(loadingUserDetail || viewingUser) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-4xl shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">User Details</h2>
                {viewingUser && <p className="text-sm text-gray-500 dark:text-gray-400">{viewingUser.email}</p>}
              </div>
              <button type="button" onClick={() => setViewingUser(null)} className="rounded-lg border px-3 py-2 text-sm dark:border-gray-600">
                Close
              </button>
            </div>

            {loadingUserDetail || !viewingUser ? (
              <div className="h-40 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-700" />
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-900">
                    <p className="text-xs uppercase tracking-wide text-rose-500">Likes</p>
                    <p className="mt-2 text-2xl font-bold">{viewingUser.likes?.length || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="text-xs uppercase tracking-wide text-amber-500">Wishlist</p>
                    <p className="mt-2 text-2xl font-bold">{viewingUser.wishlist?.length || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">
                    <p className="text-xs uppercase tracking-wide text-blue-500">Orders</p>
                    <p className="mt-2 text-2xl font-bold">{viewingUser.orders?.length || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
                    <p className="text-xs uppercase tracking-wide text-emerald-500">Cart Items</p>
                    <p className="mt-2 text-2xl font-bold">{viewingUser.cartItems?.length || 0}</p>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Order History</h3>
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                      {(viewingUser.orders || []).length === 0 ? (
                        <p className="text-sm text-gray-500">No orders</p>
                      ) : (
                        viewingUser.orders.map((order) => (
                          <div key={order._id} className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-semibold text-gray-900 dark:text-white">#{order._id.slice(-6).toUpperCase()}</span>
                              <span className="text-rose-600 font-bold">₹{Number(order.totalPrice || 0).toLocaleString("en-IN")}</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{order.orderItems?.length || 0} items • {String(order.status || "").replaceAll("_", " ")}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Recent Activities</h3>
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                      {(viewingUser.activities || []).length === 0 ? (
                        <p className="text-sm text-gray-500">No activities</p>
                      ) : (
                        viewingUser.activities.map((activity) => (
                          <div key={activity._id} className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                            <p className="font-semibold capitalize text-gray-900 dark:text-white">{activity.action.replace(/_/g, " ")}</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{new Date(activity.createdAt).toLocaleString()}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Reviews</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {(viewingUser.reviews || []).length === 0 ? (
                        <p className="text-sm text-gray-500">No reviews</p>
                      ) : (
                        viewingUser.reviews.map((review) => (
                          <div key={review._id} className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{review.rating} ★</p>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Cart Items</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {(viewingUser.cartItems || []).length === 0 ? (
                        <p className="text-sm text-gray-500">No cart items</p>
                      ) : (
                        viewingUser.cartItems.map((item) => (
                          <div key={item._id} className="rounded-xl border border-gray-100 p-4 dark:border-gray-700">
                            <p className="font-semibold text-gray-900 dark:text-white">{item.productId?.name || "Product"}</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
      </main>

      {showReviewModal && editingReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Edit Review</h2>
            <form onSubmit={submitReviewEdit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Author Name</label>
                <input value={editingReview.userName} onChange={(e) => setEditingReview({ ...editingReview, userName: e.target.value })} className="w-full border dark:border-gray-600 dark:bg-gray-700 p-2 rounded-lg" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Rating (1-5)</label>
                <input type="number" min="1" max="5" value={editingReview.rating} onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })} className="w-full border dark:border-gray-600 dark:bg-gray-700 p-2 rounded-lg" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Comment</label>
                <textarea rows="3" value={editingReview.comment} onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })} className="w-full border dark:border-gray-600 dark:bg-gray-700 p-2 rounded-lg" required />
              </div>
              <div className="mb-6 grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <input type="checkbox" checked={Boolean(editingReview.isPinned)} onChange={(e) => setEditingReview({ ...editingReview, isPinned: e.target.checked })} />
                  <span className="text-sm font-medium dark:text-gray-200"><FaThumbtack className="inline mr-2 text-amber-500" />Pin Featured Review</span>
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <input type="checkbox" checked={Boolean(editingReview.isHidden)} onChange={(e) => setEditingReview({ ...editingReview, isHidden: e.target.checked })} />
                  <span className="text-sm font-medium dark:text-gray-200"><FaEyeSlash className="inline mr-2 text-slate-500" />Hide Review</span>
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowReviewModal(false)} className="px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition shadow">Save Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;

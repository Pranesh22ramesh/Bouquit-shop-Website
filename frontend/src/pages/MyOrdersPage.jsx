import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { userService } from "../api/userService";
import api from "../api/axios";
import { SITE_EVENTS, subscribeToSiteEvent } from "../lib/siteEvents";

const MyOrdersPage = () => {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [orders, setOrders] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });
  const [isDarkMode] = React.useState(() => document.documentElement.classList.contains("dark"));

  const loadData = async () => {
    if (!isAuthenticated || !user?._id) return;

    try {
      const [activityData, orderRes, reviewData] = await Promise.all([
        userService.getActivities(),
        api.get("/orders/myorders"),
        api.get("/reviews", { params: { userId: user._id } }),
      ]);

      setActivities(activityData);
      setOrders(orderRes.data || []);
      setMyReviews(reviewData.data || []);
    } catch (error) {
      console.error("Failed to fetch profile data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      mobile: user?.mobile || "",
      password: "",
    });

    loadData();
  }, [isAuthenticated, user?._id]);

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return undefined;

    const unsubscribers = [
      subscribeToSiteEvent(SITE_EVENTS.privateOrdersChanged, loadData),
      subscribeToSiteEvent(SITE_EVENTS.privateActivitiesChanged, loadData),
      subscribeToSiteEvent(SITE_EVENTS.privateReviewsChanged, loadData),
      subscribeToSiteEvent(SITE_EVENTS.privateProfileChanged, loadData),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe?.());
    };
  }, [isAuthenticated, user?._id]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    try {
      const updated = await userService.updateProfile(profileForm);
      toast.success("Profile updated successfully!");
      updateUser(updated);
      setShowEditProfile(false);
      setProfileForm((current) => ({ ...current, password: "" }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-10 text-center">
        <p>Please login to view your profile.</p>
        <Link to="/login" className="text-[#651F3C] font-semibold underline">
          Login here
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-[#171116] text-[#FAF5EF]" : "bg-[#FAF5EF] text-[#30232A]"}`}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className={`p-8 rounded-3xl shadow-lg mb-8 flex flex-col md:flex-row items-center gap-6 border ${isDarkMode ? "bg-[#261B22] border-[#493640]" : "bg-white border-[#E8DDD5]"}`}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#651F3C] to-[#C5A15B] p-1 shadow-md">
            <div className={`w-full h-full rounded-full flex items-center justify-center text-3xl font-bold font-serif ${isDarkMode ? "bg-[#171116] text-[#D5B36C]" : "bg-white text-[#651F3C]"}`}>
              {user?.name?.charAt(0)}
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-serif font-bold mb-1">{user?.name}</h1>
            <p className="opacity-70 text-sm">
              @{user?.email?.split("@")[0] || "user"} • {user?.email}
            </p>
            {user?.mobile && <p className="opacity-70 text-sm mt-1">📞 {user.mobile}</p>}
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              {user?.role === "admin" && <span className="px-3 py-1 bg-[#C5A15B]/20 text-[#C5A15B] rounded-full text-xs font-bold">Admin</span>}
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${user?.isActive === false ? "bg-red-100 text-red-700" : "bg-[#78836B]/20 text-[#78836B]"}`}>
                {user?.isActive === false ? "Disabled" : "Active Member"}
              </span>
              <span className="px-3 py-1 bg-[#651F3C]/10 text-[#651F3C] dark:text-[#D5B36C] rounded-full text-xs font-bold">{orders.length} Orders</span>
              <span className="px-3 py-1 bg-[#30232A]/10 dark:bg-white/10 rounded-full text-xs font-bold">{myReviews.length} Reviews</span>
              <span className="px-3 py-1 bg-[#F5EAE9] text-[#651F3C] rounded-full text-xs font-bold">{user?.likes?.length || 0} Likes</span>
              <span className="px-3 py-1 border border-[#C5A15B]/40 text-[#C5A15B] rounded-full text-xs font-bold">{user?.wishlist?.length || 0} Wishlist</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowEditProfile(true)}
              className={`px-4 py-2 border rounded-xl flex items-center gap-2 transition ${isDarkMode ? "border-[#493640] hover:bg-[#30232A]" : "border-[#E8DDD5] hover:bg-[#FAF5EF]"}`}
            >
              <FaEdit /> Edit Profile
            </button>
            <button onClick={logout} className="px-4 py-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition">
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={`p-6 rounded-3xl shadow-sm border ${isDarkMode ? "bg-[#261B22] border-[#493640]" : "bg-white border-[#E8DDD5]"}`}>
            <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
              <span>🕒</span> Recent Activity
            </h2>

            {loading ? (
              <p>Loading...</p>
            ) : activities.length === 0 ? (
              <p className="text-sm opacity-60">No recent activity found.</p>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {activities.map((log) => (
                  <div key={log._id} className={`p-3 rounded-xl text-sm border-l-4 ${isDarkMode ? "bg-[#171116] border-[#651F3C]" : "bg-[#FAF5EF] border-[#651F3C]"}`}>
                    <p className="font-semibold capitalize">{log.action.replace(/_/g, " ")}</p>
                    <p className="opacity-70 text-xs mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className={`p-6 rounded-3xl shadow-sm border ${isDarkMode ? "bg-[#261B22] border-[#493640]" : "bg-white border-[#E8DDD5]"}`}>
              <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
                <span>📦</span> Orders
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-6 opacity-60 border-2 border-dashed border-[#E8DDD5] dark:border-[#493640] rounded-2xl">
                  <p className="font-medium">No orders yet</p>
                  <Link to="/gallery" className="inline-block mt-2 text-[#651F3C] dark:text-[#D5B36C] hover:underline text-sm font-semibold">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {orders.map((order) => (
                    <div key={order._id} className={`p-4 rounded-xl border ${isDarkMode ? "border-[#493640] bg-[#171116]" : "border-[#E8DDD5] bg-[#FAF5EF]"}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-bold text-sm block">Order #{order._id.slice(-6).toUpperCase()}</span>
                          <span className="text-xs opacity-60">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="font-bold text-[#651F3C] dark:text-[#D5B36C]">₹{order.totalPrice?.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#F5EAE9] text-[#651F3C] dark:bg-[#30232A] dark:text-[#FAF5EF]">{order.status}</span>
                        <span className="text-xs opacity-70">{order.orderItems?.length} items</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`p-6 rounded-3xl shadow-sm border ${isDarkMode ? "bg-[#261B22] border-[#493640]" : "bg-white border-[#E8DDD5]"}`}>
              <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
                <span>⭐</span> My Reviews
              </h2>

              {myReviews.length === 0 ? (
                <div className="text-center py-6 opacity-60 border-2 border-dashed border-[#E8DDD5] dark:border-[#493640] rounded-2xl">
                  <p className="font-medium">No reviews written</p>
                  <Link to="/reviews" className="inline-block mt-2 text-[#651F3C] dark:text-[#D5B36C] hover:underline text-sm font-semibold">
                    Write a Review
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  {myReviews.map((review) => (
                    <div key={review._id} className={`p-4 rounded-xl border ${isDarkMode ? "border-[#493640] bg-[#171116]" : "border-[#E8DDD5] bg-white"}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm">{review.userName || user?.name}</h4>
                          <div className="text-[#C5A15B] text-xs mt-1">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                        </div>
                        <span className="text-xs opacity-50">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm mt-3 opacity-80 italic">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {showEditProfile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 border ${isDarkMode ? "bg-[#261B22] border-[#493640]" : "bg-white border-[#E8DDD5]"}`}>
              <h2 className="text-2xl font-serif font-bold mb-6">Edit Profile</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 opacity-80">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-[#651F3C] outline-none ${isDarkMode ? "bg-[#171116] border-[#493640] text-white" : "bg-[#FAF5EF] border-[#E8DDD5]"}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 opacity-80">Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-[#651F3C] outline-none ${isDarkMode ? "bg-[#171116] border-[#493640] text-white" : "bg-[#FAF5EF] border-[#E8DDD5]"}`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 opacity-80">Mobile Number (Optional)</label>
                  <input
                    type="tel"
                    value={profileForm.mobile}
                    onChange={(event) => setProfileForm((current) => ({ ...current, mobile: event.target.value }))}
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-[#651F3C] outline-none ${isDarkMode ? "bg-[#171116] border-[#493640] text-white" : "bg-[#FAF5EF] border-[#E8DDD5]"}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 opacity-80">New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={profileForm.password}
                    onChange={(event) => setProfileForm((current) => ({ ...current, password: event.target.value }))}
                    className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-[#651F3C] outline-none ${isDarkMode ? "bg-[#171116] border-[#493640] text-white" : "bg-[#FAF5EF] border-[#E8DDD5]"}`}
                    minLength="8"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => setShowEditProfile(false)} className="px-5 py-2 border border-[#E8DDD5] dark:border-[#493640] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-[#651F3C] hover:bg-[#4D172D] text-white rounded-lg transition shadow-md shadow-[#651F3C]/20">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;

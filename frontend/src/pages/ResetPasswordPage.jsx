import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { authService } from "../api/authService";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, { password, confirmPassword });
      await refreshUser();
      toast.success("Password reset successful!");
      navigate("/my-orders", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password. The link might be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-rose-50/50"}`}>
      <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl relative overflow-hidden ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-rose-100"}`}>
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className={`text-2xl font-bold font-serif ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Reset Password
          </h1>
          <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Please enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>New Password</label>
            <input 
              type="password" 
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-rose-500 outline-none transition-all ${
                isDarkMode ? "bg-gray-900/50 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
              }`}
              placeholder="New password"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Confirm Password</label>
            <input 
              type="password" 
              required
              minLength="6"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-rose-500 outline-none transition-all ${
                isDarkMode ? "bg-gray-900/50 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
              }`}
              placeholder="Confirm new password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className={`text-sm font-semibold hover:underline ${isDarkMode ? "text-rose-400" : "text-rose-600"}`}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

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
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? "bg-[#171116]" : "bg-[#FAF5EF]"}`}>
      <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl relative overflow-hidden ${isDarkMode ? "bg-[#261B22] border border-[#493640]" : "bg-white border border-[#E8DDD5]"}`}>
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className={`text-2xl font-bold font-serif ${isDarkMode ? "text-[#FAF5EF]" : "text-[#30232A]"}`}>
            Reset Password
          </h1>
          <p className={`mt-2 text-sm ${isDarkMode ? "text-[#8E7A83]" : "text-[#81747A]"}`}>
            Please enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-[#FAF5EF]" : "text-[#30232A]"}`}>New Password</label>
            <input 
              type="password" 
              required
              minLength="8"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#651F3C] outline-none transition-all ${
                isDarkMode ? "bg-[#171116] border-[#493640] text-white" : "bg-[#FAF5EF] border-[#E8DDD5] text-[#30232A]"
              }`}
              placeholder="New password (min 8 characters)"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? "text-[#FAF5EF]" : "text-[#30232A]"}`}>Confirm Password</label>
            <input 
              type="password" 
              required
              minLength="8"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#651F3C] outline-none transition-all ${
                isDarkMode ? "bg-[#171116] border-[#493640] text-white" : "bg-[#FAF5EF] border-[#E8DDD5] text-[#30232A]"
              }`}
              placeholder="Confirm new password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-[#651F3C] hover:bg-[#4D172D] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#651F3C]/20 transition-colors disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className={`text-sm font-semibold hover:underline ${isDarkMode ? "text-[#D5B36C]" : "text-[#651F3C]"}`}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

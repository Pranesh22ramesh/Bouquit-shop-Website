import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { authService } from "../api/authService";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      if (response.resetUrl) {
        toast.success("Reset link generated. The backend returned a development reset URL.");
      } else {
        toast.success(response.message || "If the email exists, a reset link has been generated.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? "bg-[#171116]" : "bg-[#FAF5EF]"}`}>
      <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl relative overflow-hidden ${isDarkMode ? "bg-[#261B22] border border-[#493640]" : "bg-white border border-[#E8DDD5]"}`}>
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">💐</div>
          <h1 className={`text-2xl font-bold font-serif ${isDarkMode ? "text-[#FAF5EF]" : "text-[#30232A]"}`}>
            Forgot Password
          </h1>
          <p className={`mt-2 text-sm ${isDarkMode ? "text-[#8E7A83]" : "text-[#81747A]"}`}>
            Enter your email to receive a password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-[#FAF5EF]" : "text-[#30232A]"}`}>Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#651F3C] outline-none transition-all ${
                isDarkMode ? "bg-[#171116] border-[#493640] text-white placeholder-[#8E7A83]" : "bg-[#FAF5EF] border-[#E8DDD5] text-[#30232A]"
              }`}
              placeholder="Enter your email"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#651F3C] hover:bg-[#4D172D] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#651F3C]/20 transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPasswordPage;

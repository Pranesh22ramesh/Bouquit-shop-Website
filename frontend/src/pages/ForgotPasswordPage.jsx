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
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? "bg-gray-900" : "bg-rose-50/50"}`}>
      <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl relative overflow-hidden ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-rose-100"}`}>
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">💐</div>
          <h1 className={`text-2xl font-bold font-serif ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Forgot Password
          </h1>
          <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Enter your email to receive a password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-rose-500 outline-none transition-all ${
                isDarkMode ? "bg-gray-900/50 border-gray-600 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900"
              }`}
              placeholder="Enter your email"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPasswordPage;

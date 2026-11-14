import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShield, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const isDarkMode = document.documentElement.classList.contains("dark");
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [wakeRetryCount, setWakeRetryCount] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: adminLogin,
    onSuccess: () => {
      toast.success("Admin login successful! Welcome back.");
      navigate("/admin", { replace: true });
    },
    onError: async (error) => {
      const status = error.response?.status;
      const isTimeout = error.code === "ECONNABORTED" || error.message?.includes("timeout");
      const isServerDown = status === 404 || status === 502 || status === 503 || isTimeout || !error.response;

      if (isServerDown && wakeRetryCount < 3) {
        setIsWakingUp(true);
        setWakeRetryCount((c) => c + 1);
        toast.loading("Backend is waking up... retrying in 15 seconds", { id: "wakeup", duration: 15000 });

        try {
          await api.get("/health").catch(() => {});
          await new Promise((resolve) => setTimeout(resolve, 15000));
          toast.dismiss("wakeup");
          setIsWakingUp(false);
          mutation.mutate(getValues());
        } catch {
          toast.dismiss("wakeup");
          setIsWakingUp(false);
          toast.error("Backend server is still starting up. Please wait and try again.");
        }
        return;
      }

      if (status === 401) {
        toast.error("Incorrect email or password. Please check your credentials.");
      } else if (status === 403) {
        toast.error(error.response?.data?.message || "Access denied. Only the administrator can log in here.");
      } else if (status === 429) {
        toast.error("Too many attempts. Please wait a few minutes before trying again.");
      } else if (isServerDown) {
        toast.error("Backend server is offline. Please verify the backend service on Render is active.");
      } else {
        toast.error(error.response?.data?.message || error.message || "Admin login failed");
      }
    },
  });

  const isLoading = mutation.isPending || isWakingUp;

  return (
    <div className={`relative min-h-[90vh] flex items-center justify-center px-4 py-10 sm:py-16 transition-colors duration-500 ${isDarkMode ? "bg-[#171116]" : "bg-[#FAF5EF]"}`}>
      
      {/* Ambient luxury glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-[#651F3C]/10 blur-[120px] dark:bg-[#651F3C]/20" />
        <div className="absolute bottom-10 right-1/4 h-[350px] w-[350px] rounded-full bg-[#C5A15B]/15 blur-[100px] dark:bg-[#C5A15B]/10" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Top Shop Crest */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block group">
            <span className="font-serif text-3xl font-bold tracking-tight text-[#651F3C] group-hover:text-[#4D172D] transition-colors dark:text-[#D5B36C]">
              MIDHUNYAS
            </span>
            <span className="block text-[11px] uppercase tracking-[0.28em] text-[#C5A15B] font-medium mt-0.5">
              Petals & Bridal Flowers
            </span>
          </Link>
        </div>

        {/* Elevated Executive Card */}
        <div className="overflow-hidden rounded-[26px] border border-[#ECD9CE] bg-white shadow-[0_22px_55px_rgba(48,35,42,0.12)] transition-all dark:border-[#493640] dark:bg-[#261B22]">
          
          {/* Executive Gold & Royal Burgundy Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#30232A] via-[#4D172D] to-[#651F3C] px-8 py-7 text-[#FAF5EF]">
            {/* Subtle floral watermark & sparkle */}
            <div className="pointer-events-none absolute top-4 right-6 text-[#C5A15B]/35 text-2xl select-none">✦</div>
            <div className="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-white/5 blur-sm" />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C5A15B]/50 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A15B] backdrop-blur-xs">
                  <FiShield className="text-xs" />
                  <span>Executive Access</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#FAF5EF]/70 font-medium">
                  Karur Admin
                </span>
              </div>

              <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF5EF]">
                Administrator Portal
              </h2>
              <p className="mt-1 text-xs text-[#FAF5EF]/80 leading-relaxed">
                Authorized management console for products, orders, reviews, and site contents.
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-7 sm:p-9">
            {/* Backend Wake-up / Retry Notice */}
            {isWakingUp && (
              <div className="mb-5 flex items-start gap-3 rounded-xl bg-[#FFF4DE] border border-[#C5A15B]/40 p-3.5 text-xs text-[#30232A] dark:bg-[#30232A] dark:border-[#C5A15B]/50 dark:text-[#FAF5EF]">
                <svg className="animate-spin mt-0.5 h-4 w-4 shrink-0 text-[#C5A15B]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <div className="leading-relaxed">
                  <p className="font-bold text-[#651F3C] dark:text-[#D5B36C]">Backend Server Awakening...</p>
                  <p className="mt-0.5 text-[11px] text-[#51454B] dark:text-[#C4B1B8]">
                    Free servers rest when idle. Re-authenticating automatically in 15 seconds (attempt {wakeRetryCount}/3).
                  </p>
                </div>
              </div>
            )}

            <form
              className="space-y-4 sm:space-y-5"
              onSubmit={handleSubmit((values) => {
                setWakeRetryCount(0);
                mutation.mutate(values);
              })}
              noValidate
            >
              {/* Admin Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#30232A] dark:text-[#FAF1EC] mb-1.5">
                  Admin Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#81747A] dark:text-[#C4B1B8]">
                    <FiMail className="text-base" />
                  </div>
                  <input
                    type="email"
                    {...register("email")}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-[#D9C9C3] bg-[#FAF5EF]/60 pl-10 pr-4 py-3 text-sm text-[#30232A] placeholder-[#81747A]/60 outline-none transition focus:border-[#651F3C] focus:bg-white focus:ring-3 focus:ring-[#651F3C]/15 disabled:opacity-60 dark:border-[#493640] dark:bg-[#171116] dark:text-[#FAF1EC] dark:focus:border-[#D5B36C] dark:focus:ring-[#D5B36C]/20"
                    placeholder="midhunyas2012karur@gmail.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Admin Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#30232A] dark:text-[#FAF1EC] mb-1.5">
                  Administrator Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#81747A] dark:text-[#C4B1B8]">
                    <FiLock className="text-base" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    disabled={isLoading}
                    className="w-full rounded-xl border border-[#D9C9C3] bg-[#FAF5EF]/60 pl-10 pr-11 py-3 text-sm text-[#30232A] placeholder-[#81747A]/60 outline-none transition focus:border-[#651F3C] focus:bg-white focus:ring-3 focus:ring-[#651F3C]/15 disabled:opacity-60 dark:border-[#493640] dark:bg-[#171116] dark:text-[#FAF1EC] dark:focus:border-[#D5B36C] dark:focus:ring-[#D5B36C]/20"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#81747A] hover:text-[#30232A] transition-colors dark:text-[#C4B1B8] dark:hover:text-[#FAF1EC]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Sign In Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-[#651F3C] px-5 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-[0_8px_20px_rgba(101,31,60,0.22)] transition-all hover:bg-[#4D172D] hover:shadow-[0_12px_26px_rgba(101,31,60,0.32)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#651F3C] dark:hover:bg-[#4D172D]"
                >
                  {isLoading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{isWakingUp ? "Waking Up Server..." : "Authenticating..."}</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <FiArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Navigation Links */}
            <div className="mt-6 pt-5 border-t border-[#E8DDD5] dark:border-[#493640] flex items-center justify-between text-xs">
              <Link
                to="/login"
                className="font-semibold text-[#651F3C] hover:text-[#4D172D] hover:underline transition-colors dark:text-[#D5B36C]"
              >
                ← Customer Login
              </Link>
              <Link
                to="/"
                className="font-medium text-[#81747A] hover:text-[#30232A] transition-colors dark:text-[#C4B1B8] dark:hover:text-[#FAF1EC]"
              >
                Back to Site
              </Link>
            </div>
          </div>
        </div>

        {/* Security & Confidentiality Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#81747A] dark:text-[#C4B1B8]">
          <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 text-xs shrink-0" />
          <span>Encrypted Session • Restricted to Configured Administrator</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

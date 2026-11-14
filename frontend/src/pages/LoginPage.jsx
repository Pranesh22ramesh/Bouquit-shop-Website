import React, { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiTruck, FiHeart, FiShield } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const redirect = searchParams.get("redirect");
  const fallback = redirect ? `/${redirect.replace(/^\//, "")}` : "/";
  const destination = location.state?.from?.pathname || fallback;
  const isDarkMode = document.documentElement.classList.contains("dark");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      toast.success("Welcome back to MIDHUNYAS!");
      if (user?.role === "ADMIN" || user?.role === "admin" || user?.isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        navigate(destination, { replace: true });
      }
    },
    onError: (error) => {
      if (error.response?.status === 404) {
        toast.error("Backend server is starting up. Please wait 20 seconds and try again.");
      } else if (error.response?.status === 401) {
        toast.error("Invalid email or password. Please check your credentials.");
      } else {
        toast.error(error.response?.data?.message || error.message || "Login failed");
      }
    },
  });

  return (
    <div className={`relative min-h-[90vh] flex items-center justify-center px-4 py-8 sm:py-14 transition-colors duration-500 ${isDarkMode ? "bg-[#171116]" : "bg-[#FAF5EF]"}`}>
      
      {/* Subtle luxury ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#651F3C]/10 blur-[100px] dark:bg-[#651F3C]/15" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#C5A15B]/15 blur-[100px] dark:bg-[#C5A15B]/10" />
      </div>

      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#E8DDD5] bg-white shadow-[0_20px_50px_rgba(48,35,42,0.08)] transition-all dark:border-[#493640] dark:bg-[#261B22]">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Hero Brand Panel (Hidden on mobile, visible on desktop) */}
          <div className="relative hidden lg:col-span-5 lg:flex flex-col justify-between overflow-hidden bg-[#30232A] p-10 text-[#FAF5EF]">
            {/* Background Bouquet Photo with Rich Dark Overlay */}
            <img
              src="/gallery/bouquet/bouquet13.jpg"
              alt="Floral Arrangement"
              className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-luminosity scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#30232A]/90 via-[#30232A]/75 to-[#651F3C]/85" />
            
            {/* Subtle decorative gold sparkles */}
            <div className="pointer-events-none absolute top-6 right-6 text-[#C5A15B]/40 text-xl select-none">✦</div>
            <div className="pointer-events-none absolute bottom-8 left-8 text-[#C5A15B]/30 text-lg select-none">✦</div>

            {/* Top Branding */}
            <div className="relative z-10">
              <Link to="/" className="inline-block group">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#FAF5EF] group-hover:text-[#C5A15B] transition-colors">
                  MIDHUNYAS
                </span>
                <span className="block text-[10px] uppercase tracking-[0.25em] text-[#C5A15B] font-medium mt-0.5">
                  Petals & Bridal Flowers
                </span>
              </Link>
            </div>

            {/* Middle Quote & Visual Presentation */}
            <div className="relative z-10 my-auto py-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C5A15B]/40 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#C5A15B] backdrop-blur-xs mb-4">
                <span>✦</span> Royal Botanical Experience
              </span>
              <h2 className="font-serif text-3xl font-bold leading-tight text-[#FAF5EF]">
                Fresh flowers crafted for your most cherished moments.
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-[#FAF5EF]/80">
                Sign in to manage your orders, save your favorite handcrafted arrangements, and receive personalized floral recommendations.
              </p>

              {/* 3 Luxury Value Props */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 p-2.5 backdrop-blur-xs">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#C5A15B]/20 text-[#C5A15B]">
                    <FiTruck className="text-sm" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-[#FAF5EF]">Same Day Delivery</p>
                    <p className="text-[10px] text-[#FAF5EF]/70">Freshly handpicked and dispatched in Karur</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 p-2.5 backdrop-blur-xs">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#D9B8B8]/20 text-[#D9B8B8]">
                    <FiHeart className="text-sm" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-[#FAF5EF]">Artisanal Handcrafting</p>
                    <p className="text-[10px] text-[#FAF5EF]/70">Custom bridal jadai, garlands & hat boxes</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 p-2.5 backdrop-blur-xs">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#78836B]/25 text-[#A2B095]">
                    <FiShield className="text-sm" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-[#FAF5EF]">Guaranteed Freshness</p>
                    <p className="text-[10px] text-[#FAF5EF]/70">Hand-selected fresh blooms direct from farms</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Tagline */}
            <div className="relative z-10 pt-4 border-t border-white/15 text-[11px] text-[#FAF5EF]/60">
              Handcrafted with devotion in Karur, Tamil Nadu
            </div>
          </div>

          {/* Right Side: Clean Elegant Sign In Form */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 md:p-12">
            <div>
              {/* Header Title */}
              <div className="mb-6 sm:mb-8 text-left">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#C5A15B]">
                    <span>✦</span> Member Sign In
                  </span>
                  <Link
                    to="/"
                    className="text-xs text-[#81747A] hover:text-[#651F3C] transition-colors dark:text-[#C4B1B8] dark:hover:text-[#D5B36C]"
                  >
                    Back to Store
                  </Link>
                </div>
                <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#30232A] dark:text-[#FAF1EC]">
                  Welcome Back
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-[#81747A] dark:text-[#C4B1B8]">
                  Enter your email address and password to access your account.
                </p>
              </div>

              {/* Form Elements */}
              <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4 sm:space-y-5" noValidate>
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#30232A] dark:text-[#FAF1EC] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#81747A] dark:text-[#C4B1B8]">
                      <FiMail className="text-base" />
                    </div>
                    <input
                      type="email"
                      {...register("email")}
                      disabled={mutation.isPending}
                      className="w-full rounded-xl border border-[#D9C9C3] bg-[#FAF5EF]/60 pl-10 pr-4 py-3 text-sm text-[#30232A] placeholder-[#81747A]/60 outline-none transition focus:border-[#651F3C] focus:bg-white focus:ring-3 focus:ring-[#651F3C]/15 dark:border-[#493640] dark:bg-[#171116] dark:text-[#FAF1EC] dark:focus:border-[#D5B36C] dark:focus:ring-[#D5B36C]/20"
                      placeholder="name@example.com"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#30232A] dark:text-[#FAF1EC]">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-[#651F3C] hover:text-[#4D172D] hover:underline transition-colors dark:text-[#D5B36C]"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#81747A] dark:text-[#C4B1B8]">
                      <FiLock className="text-base" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      disabled={mutation.isPending}
                      className="w-full rounded-xl border border-[#D9C9C3] bg-[#FAF5EF]/60 pl-10 pr-11 py-3 text-sm text-[#30232A] placeholder-[#81747A]/60 outline-none transition focus:border-[#651F3C] focus:bg-white focus:ring-3 focus:ring-[#651F3C]/15 dark:border-[#493640] dark:bg-[#171116] dark:text-[#FAF1EC] dark:focus:border-[#D5B36C] dark:focus:ring-[#D5B36C]/20"
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

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-[#651F3C] px-5 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-[0_8px_20px_rgba(101,31,60,0.22)] transition-all hover:bg-[#4D172D] hover:shadow-[0_12px_26px_rgba(101,31,60,0.32)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#651F3C] dark:hover:bg-[#4D172D]"
                  >
                    {mutation.isPending ? (
                      <>
                        <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <FiArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Create Account Divider & Link */}
              <div className="mt-6 pt-5 border-t border-[#E8DDD5] dark:border-[#493640] text-center">
                <p className="text-xs text-[#81747A] dark:text-[#C4B1B8]">
                  Don't have an account yet?{" "}
                  <Link
                    to="/signup"
                    className="font-bold text-[#651F3C] hover:text-[#4D172D] hover:underline transition-colors dark:text-[#D5B36C]"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </div>

            {/* Bottom Portal Link for Store Admin */}
            <div className="mt-8 rounded-xl bg-[#FAF5EF] border border-[#ECD9CE] p-3 text-center dark:bg-[#1E1420] dark:border-[#493640]">
              <span className="text-[11px] text-[#81747A] dark:text-[#C4B1B8] block sm:inline">
                Are you a store manager or administrator?{" "}
              </span>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#651F3C] hover:text-[#4D172D] hover:underline dark:text-[#D5B36C] ml-1"
              >
                <span>Admin Login Portal</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

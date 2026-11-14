import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
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
        // Try to wake up the backend server and auto-retry
        setIsWakingUp(true);
        setWakeRetryCount((c) => c + 1);
        toast.loading("Backend is waking up... retrying in 15 seconds", { id: "wakeup", duration: 15000 });

        try {
          // Ping health endpoint to wake up the server
          await api.get("/health").catch(() => {});
          await new Promise((resolve) => setTimeout(resolve, 15000));
          toast.dismiss("wakeup");
          setIsWakingUp(false);
          // Auto-retry the login
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
        toast.error("Backend server is offline. Please go to dashboard.render.com and resume the bouquit-shop-backend service.");
      } else {
        toast.error(error.response?.data?.message || error.message || "Admin login failed");
      }
    },
  });

  const isLoading = mutation.isPending || isWakingUp;

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 transition-colors duration-300 ${isDarkMode ? "bg-[#171116] text-[#FAF5EF]" : "bg-[#FAF5EF] text-[#30232A]"}`}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <h1 className="text-3xl font-serif font-black text-[#651F3C] dark:text-[#D5B36C] tracking-tight">
              MIDHUNYAS
            </h1>
            <p className="text-xs text-[#81747A] dark:text-[#8E7A83] uppercase tracking-widest mt-1">Petals & Blooms</p>
          </Link>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-[2rem] border border-[#E8DDD5] bg-white shadow-2xl dark:border-[#493640] dark:bg-[#261B22]">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-[#651F3C] via-[#4D172D] to-[#30232A] px-8 py-7 text-[#FAF5EF]">
            <span className="inline-flex rounded-full border border-[#C5A15B]/50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#C5A15B]">
              Admin Access Only
            </span>
            <h2 className="mt-4 text-2xl font-serif font-bold text-[#FAF5EF]">Administrator Login</h2>
            <p className="mt-2 text-sm text-[#FAF5EF]/70">
              Manage products, orders, gallery, and site content.
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {/* Wake-up status banner */}
            {isWakingUp && (
              <div className="mb-5 flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300">
                <svg className="animate-spin mt-0.5 h-4 w-4 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>
                  <strong>Backend is waking up...</strong> Free servers sleep when inactive.
                  Auto-retrying in 15 seconds (attempt {wakeRetryCount}/3).
                </span>
              </div>
            )}

            <form
              className="space-y-5"
              onSubmit={handleSubmit((values) => {
                setWakeRetryCount(0);
                mutation.mutate(values);
              })}
              noValidate
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#30232A] dark:text-[#FAF5EF]">
                  Admin Email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-[#E8DDD5] bg-[#FAF5EF] px-4 py-3 text-[#30232A] outline-none transition focus:border-[#651F3C] focus:ring-2 focus:ring-[#651F3C]/20 disabled:opacity-60 dark:border-[#493640] dark:bg-[#171116] dark:text-white"
                  placeholder="midhunyas2012karur@gmail.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#30232A] dark:text-[#FAF5EF]">
                  Password
                </label>
                <input
                  type="password"
                  {...register("password")}
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-[#E8DDD5] bg-[#FAF5EF] px-4 py-3 text-[#30232A] outline-none transition focus:border-[#651F3C] focus:ring-2 focus:ring-[#651F3C]/20 disabled:opacity-60 dark:border-[#493640] dark:bg-[#171116] dark:text-white"
                  placeholder="Enter administrator password"
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#651F3C] hover:bg-[#4D172D] px-4 py-3.5 font-semibold text-white shadow-lg shadow-[#651F3C]/20 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {isWakingUp ? "Waking up server..." : "Signing in..."}
                  </>
                ) : (
                  "Login as Admin"
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm">
              <Link to="/login" className="font-medium text-[#651F3C] dark:text-[#D5B36C] hover:underline">
                ← Customer Login
              </Link>
              <Link to="/" className="font-medium text-[#81747A] hover:text-[#30232A] dark:text-[#8E7A83] dark:hover:text-[#FAF5EF]">
                Back to Site
              </Link>
            </div>
          </div>
        </div>

        {/* Help text */}
        <p className="mt-6 text-center text-xs text-[#81747A] dark:text-[#8E7A83]">
          First login may take up to 60 seconds while the server wakes up.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;

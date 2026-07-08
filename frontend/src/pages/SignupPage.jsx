import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const signupSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email address"),
    phoneNumber: z
      .string()
      .min(10, "Phone number is required")
      .regex(/^[0-9+\-\s]{10,20}$/, "Enter a valid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const isDarkMode = document.documentElement.classList.contains("dark");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", phoneNumber: "", password: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      toast.success("Account created successfully");
      navigate("/", { replace: true });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || "Signup failed");
    },
  });

  return (
    <div className={`relative min-h-screen flex items-center justify-center p-4 sm:p-8 overflow-hidden transition-colors duration-700 ${isDarkMode ? "bg-gray-950" : "bg-gray-50"}`}>
      
      {/* Subtle Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.15] animate-aurora bg-emerald-400 dark:mix-blend-screen dark:opacity-[0.1]"></div>
        <div className="absolute top-[20%] -left-[20%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.15] animate-aurora animation-delay-2000 bg-teal-300 dark:mix-blend-screen dark:opacity-[0.1]"></div>
        <div className="absolute -bottom-[20%] right-[20%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.15] animate-aurora animation-delay-4000 bg-cyan-400 dark:mix-blend-screen dark:opacity-[0.1]"></div>
      </div>

      {/* Main Card */}
      <div className={`relative z-10 w-full max-w-5xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] ${isDarkMode ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-100"}`}>
        
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col justify-between p-12 lg:p-16 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-100 dark:border-gray-800 relative overflow-hidden order-2 md:order-1">
          {/* Subtle decoration inside branding panel */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/3 translate-x-1/3"></div>

          <div className="relative z-10">
            <Link to="/" className="inline-block">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                FloralAura
              </h2>
            </Link>
          </div>

          <div className="relative z-10 my-auto">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Begin your floral journey.
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-8">
              Create an account to manage your wishlist, track deliveries, and access premium seasonal arrangements.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Secure Checkout</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your details are protected and saved.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Quick Reordering</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Easily reorder your favorite products.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center order-1 md:order-2">
          <div className="mb-10">
            <h2 className={`text-3xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>Sign up</h2>
            <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
            <div>
              <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Full name</label>
              <input
                type="text"
                {...register("fullName")}
                className={`w-full rounded-xl px-4 py-3 outline-none transition-all duration-200 border ${
                  isDarkMode 
                  ? "bg-gray-950 border-gray-800 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                  : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                }`}
                placeholder="John Doe"
              />
              {errors.fullName && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.fullName.message}</p>}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Email address</label>
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full rounded-xl px-4 py-3 outline-none transition-all duration-200 border ${
                    isDarkMode 
                    ? "bg-gray-950 border-gray-800 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                    : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  }`}
                  placeholder="name@example.com"
                />
                {errors.email && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Phone number <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  {...register("phoneNumber")}
                  className={`w-full rounded-xl px-4 py-3 outline-none transition-all duration-200 border ${
                    isDarkMode 
                    ? "bg-gray-950 border-gray-800 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                    : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  }`}
                  placeholder="Required"
                />
                {errors.phoneNumber && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.phoneNumber.message}</p>}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Password</label>
                <input
                  type="password"
                  {...register("password")}
                  className={`w-full rounded-xl px-4 py-3 outline-none transition-all duration-200 border ${
                    isDarkMode 
                    ? "bg-gray-950 border-gray-800 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                    : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  }`}
                  placeholder="Min 8 characters"
                />
                {errors.password && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.password.message}</p>}
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Confirm</label>
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className={`w-full rounded-xl px-4 py-3 outline-none transition-all duration-200 border ${
                    isDarkMode 
                    ? "bg-gray-950 border-gray-800 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                    : "bg-white border-gray-300 text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  }`}
                  placeholder="Repeat password"
                />
                {errors.confirmPassword && <p className="mt-1.5 text-sm font-medium text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full mt-2 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 active:scale-[0.98] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {mutation.isPending ? "Signing up..." : "Create account"}
            </button>
          </form>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes aurora {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-5vw, 5vh) scale(1.1); }
        }
        .animate-aurora {
          animation: aurora 15s ease-in-out infinite alternate;
        }
        .animation-delay-2000 { animation-delay: -5s; }
        .animation-delay-4000 { animation-delay: -10s; }
      `}</style>
    </div>
  );
};

export default SignupPage;

import React from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
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
      toast.success("Welcome back");
      if (user?.role === "ADMIN" || user?.isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        navigate(destination, { replace: true });
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || "Login failed");
    },
  });

  return (
    <div className={`relative min-h-screen flex items-center justify-center p-4 sm:p-8 overflow-hidden transition-colors duration-700 ${isDarkMode ? "bg-gray-950" : "bg-gray-50"}`}>
      
      {/* Subtle Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.15] animate-aurora bg-rose-400 dark:mix-blend-screen dark:opacity-[0.1]"></div>
        <div className="absolute top-[20%] -right-[20%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.15] animate-aurora animation-delay-2000 bg-orange-300 dark:mix-blend-screen dark:opacity-[0.1]"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.15] animate-aurora animation-delay-4000 bg-purple-400 dark:mix-blend-screen dark:opacity-[0.1]"></div>
      </div>

      {/* Main Card */}
      <div className={`relative z-10 w-full max-w-5xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] ${isDarkMode ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-100"}`}>
        
        {/* Left Side: Form */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h2 className={`text-3xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>Sign in</h2>
            <p className={`mt-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-rose-600 hover:text-rose-500 transition-colors">
                Create one now
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Email address</label>
              <input
                type="email"
                {...register("email")}
                className={`w-full rounded-xl px-4 py-3.5 outline-none transition-all duration-200 border ${
                  isDarkMode 
                  ? "bg-gray-950 border-gray-800 text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500" 
                  : "bg-white border-gray-300 text-gray-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                }`}
                placeholder="name@example.com"
              />
              {errors.email && <p className="mt-2 text-sm font-medium text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={`block text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Password</label>
                <Link to="/forgot-password" className="text-sm font-medium text-rose-600 hover:text-rose-500 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                {...register("password")}
                className={`w-full rounded-xl px-4 py-3.5 outline-none transition-all duration-200 border ${
                  isDarkMode 
                  ? "bg-gray-950 border-gray-800 text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500" 
                  : "bg-white border-gray-300 text-gray-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                }`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-2 text-sm font-medium text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full mt-4 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 active:scale-[0.98] bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {mutation.isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        {/* Right Side: Branding */}
        <div className="hidden md:flex flex-col justify-between p-12 lg:p-16 bg-gray-50 dark:bg-gray-800/50 border-l border-gray-100 dark:border-gray-800 relative overflow-hidden">
          {/* Subtle decoration inside branding panel */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

          <div className="relative z-10">
            <Link to="/" className="inline-block">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                FloralAura
              </h2>
            </Link>
          </div>

          <div className="relative z-10 my-auto">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Welcome back to your floral journey.
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-8">
              Sign in to manage your wishlist, track your upcoming deliveries, and explore our newest seasonal collections.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Saved Favorites</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Access your saved bouquets anytime.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Order Tracking</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Keep an eye on your pending deliveries.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes aurora {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5vw, 5vh) scale(1.1); }
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

export default LoginPage;

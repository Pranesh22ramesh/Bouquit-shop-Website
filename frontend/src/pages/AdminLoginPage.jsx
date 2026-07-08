import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const isDarkMode = document.documentElement.classList.contains("dark");

  const {
    register,
    handleSubmit,
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
      toast.success("Admin login successful");
      navigate("/admin", { replace: true });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || "Admin login failed");
    },
  });

  return (
    <div className={`min-h-screen px-4 py-12 ${isDarkMode ? "bg-gray-900 text-white" : "bg-[#fff8f5] text-slate-900"}`}>
      <div className="mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] border border-amber-200 bg-white shadow-[0_24px_80px_-24px_rgba(251,191,36,0.35)] dark:border-gray-700 dark:bg-gray-800">
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-8 text-white">
          <p className="inline-flex rounded-full border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
            Admin Access
          </p>
          <h1 className="mt-5 text-3xl font-bold">Administrator login</h1>
          <p className="mt-3 text-sm text-white/85">
            Only the configured administrator account can enter the dashboard and manage users, products, reviews, and site content.
          </p>
        </div>

        <div className="p-8">
          <form className="space-y-5" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-gray-200">Admin Email</label>
              <input
                type="email"
                {...register("email")}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-amber-900"
                placeholder="midhunyas2012karur@gmail.com"
              />
              {errors.email && <p className="mt-2 text-sm text-rose-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-gray-200">Password</label>
              <input
                type="password"
                {...register("password")}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-amber-900"
                placeholder="Enter administrator password"
              />
              {errors.password && <p className="mt-2 text-sm text-rose-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-amber-500 px-4 py-3 font-semibold text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {mutation.isPending ? "Signing in..." : "Login as Admin"}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <Link to="/login" className="font-medium text-rose-600 hover:text-rose-700">
              User login
            </Link>
            <Link to="/" className="font-medium text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white">
              Back to site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

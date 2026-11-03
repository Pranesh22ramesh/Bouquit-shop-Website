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
    <div className={`min-h-screen px-4 py-12 transition-colors duration-300 ${isDarkMode ? "bg-[#171116] text-[#FAF5EF]" : "bg-[#FAF5EF] text-[#30232A]"}`}>
      <div className="mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] border border-[#E8DDD5] bg-white shadow-2xl dark:border-[#493640] dark:bg-[#261B22]">
        <div className="bg-gradient-to-r from-[#651F3C] via-[#4D172D] to-[#30232A] p-8 text-[#FAF5EF]">
          <p className="inline-flex rounded-full border border-[#C5A15B]/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#C5A15B]">
            Admin Access
          </p>
          <h1 className="mt-5 text-3xl font-serif font-bold text-[#FAF5EF]">Administrator login</h1>
          <p className="mt-3 text-sm text-[#FAF5EF]/80">
            Only the configured administrator account can enter the dashboard and manage users, products, reviews, and site content.
          </p>
        </div>

        <div className="p-8">
          <form className="space-y-5" onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#30232A] dark:text-[#FAF5EF]">Admin Email</label>
              <input
                type="email"
                {...register("email")}
                className="w-full rounded-2xl border border-[#E8DDD5] px-4 py-3 outline-none transition focus:border-[#651F3C] focus:ring-2 focus:ring-[#651F3C]/20 dark:border-[#493640] dark:bg-[#171116] dark:text-white"
                placeholder="midhunyas2012karur@gmail.com"
              />
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#30232A] dark:text-[#FAF5EF]">Password</label>
              <input
                type="password"
                {...register("password")}
                className="w-full rounded-2xl border border-[#E8DDD5] px-4 py-3 outline-none transition focus:border-[#651F3C] focus:ring-2 focus:ring-[#651F3C]/20 dark:border-[#493640] dark:bg-[#171116] dark:text-white"
                placeholder="Enter administrator password"
              />
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-[#651F3C] hover:bg-[#4D172D] px-4 py-3 font-semibold text-white shadow-lg shadow-[#651F3C]/20 transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {mutation.isPending ? "Signing in..." : "Login as Admin"}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <Link to="/login" className="font-medium text-[#651F3C] dark:text-[#D5B36C] hover:underline">
              User login
            </Link>
            <Link to="/" className="font-medium text-[#81747A] hover:text-[#30232A] dark:text-[#8E7A83] dark:hover:text-[#FAF5EF]">
              Back to site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

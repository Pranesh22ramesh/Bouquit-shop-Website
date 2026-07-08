import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import AIChatbot from "./components/AIChatbot.jsx";

import { Suspense, lazy } from "react";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const ReviewPage = lazy(() => import("./pages/ReviewPage.jsx"));
const CartPage = lazy(() => import("./pages/CartPage.jsx"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage.jsx"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));
const GalleryPage = lazy(() => import("./pages/GalleryPage.jsx"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const SignupPage = lazy(() => import("./pages/SignupPage.jsx"));
const MyOrdersPage = lazy(() => import("./pages/MyOrdersPage.jsx"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage.jsx"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage.jsx"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage.jsx"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage.jsx"));
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const Layout = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  React.useEffect(() => {
    // Check theme on mount
    setIsDarkMode(document.documentElement.classList.contains("dark"));

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode
      ? "bg-gray-900 text-gray-100"
      : "bg-[#fff7f3] text-slate-900"
      }`}>
      <Navbar />
      <main className="flex-1 relative">
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center min-h-[50vh]"><div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div></div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="reviews" element={<ReviewPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route
          path="order-confirmation"
          element={<OrderConfirmationPage />}
        />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="product/:id" element={<ProductDetailsPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="my-orders" element={<MyOrdersPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
        </Route>
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="admin" element={<AdminDashboardPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;

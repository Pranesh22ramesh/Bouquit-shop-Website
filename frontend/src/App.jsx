import React from "react";
import { Navigate, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import SiteUtilities from "./components/SiteUtilities.jsx";
import PolicyPage from "./pages/PolicyPage.jsx";
import FAQ from "./components/FAQ.jsx";

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
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage.jsx"));
const SignupPage = lazy(() => import("./pages/SignupPage.jsx"));
const MyOrdersPage = lazy(() => import("./pages/MyOrdersPage.jsx"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage.jsx"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage.jsx"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage.jsx"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage.jsx"));
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";


const Layout = () => <div className="site-shell"><Navbar /><main id="main-content" tabIndex={-1} className="flex-1"><ErrorBoundary><Suspense fallback={<div role="status" className="loading-state"><span className="loading-spinner" />Loading page...</div>}><Outlet /></Suspense></ErrorBoundary></main><Footer /><SiteUtilities /></div>;

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="reviews" element={<ReviewPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="privacy" element={<PolicyPage type="privacy" />} />
        <Route path="terms" element={<PolicyPage type="terms" />} />
        <Route path="faq" element={<div className="page-width"><h1 className="faq-page-title">Ordering questions</h1><FAQ /></div>} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="shop" element={<GalleryPage />} />
        <Route path="product/:id" element={<ProductDetailsPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="admin-login" element={<AdminLoginPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="my-orders" element={<MyOrdersPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
        </Route>
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="admin" element={<AdminDashboardPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;

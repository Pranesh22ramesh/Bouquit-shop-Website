import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHeart, FiLogOut, FiMenu, FiMoon, FiSearch, FiShoppingBag, FiSun, FiUser, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import SearchModal from "./SearchModal";

const navItems = [
  { label: "Shop", to: "/gallery" },
  { label: "Events", to: "/#events" },
  { label: "Our story", to: "/about" },
  { label: "Love notes", to: "/reviews" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { items } = useCart();
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const cartCount = items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
  const isHome = location.pathname === "/";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
    if (location.hash) {
      requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView({ behavior: "smooth" }));
    }
  }, [location.pathname, location.hash]);

  const handleNav = (event, to) => {
    if (!to.includes("#")) return;
    event.preventDefault();
    const hash = to.split("#")[1];
    setShowMobileMenu(false);
    if (!isHome) {
      navigate(`/#${hash}`);
      return;
    }
    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
  };

  const shell = isScrolled
    ? "border-[#E8E5E0]/80 bg-[#FFF9F6]/92 shadow-[0_8px_30px_rgba(60,42,35,0.08)] backdrop-blur-xl dark:border-zinc-800 dark:bg-[#121212]/92"
    : isHome
      ? "border-transparent bg-[#FFF9F6]/55 backdrop-blur-md dark:bg-[#121212]/55"
      : "border-[#E8E5E0] bg-[#FFF9F6] dark:border-zinc-800 dark:bg-[#121212]";

  return (
    <>
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
      <header className={`sticky top-0 z-50 h-20 border-b transition-all duration-300 ${shell}`}>
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-5 sm:px-8 xl:px-14">
          <button type="button" onClick={() => setShowMobileMenu(true)} className="grid h-10 w-10 place-items-center text-xl lg:hidden" aria-label="Open navigation"><FiMenu /></button>

          <Link to="/" className="group flex items-center gap-3" aria-label="Midhunyas home">
            <span className="relative grid h-10 w-10 place-items-center rounded-full border border-[#D4AF37]/45 text-lg text-[#E85D8E] transition group-hover:rotate-12">✦</span>
            <span>
              <span className="block font-serif text-[25px] font-semibold leading-5 tracking-[0.08em]">MIDHUNYAS</span>
              <span className="mt-1 block text-[8px] font-medium uppercase tracking-[0.33em] text-[#9B8273] dark:text-zinc-400">Flowers & gifting</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex xl:gap-10">
            {navItems.map((item) => (
              <Link key={item.label} to={item.to} onClick={(event) => handleNav(event, item.to)} className={`relative py-7 text-[13px] font-medium transition hover:text-[#E85D8E] ${location.pathname === item.to ? "text-[#E85D8E]" : ""}`}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button onClick={() => setShowSearch(true)} className="hidden h-10 w-10 place-items-center rounded-full transition hover:bg-[#FCEFF3] hover:text-[#E85D8E] sm:grid" aria-label="Search"><FiSearch /></button>
            <Link to="/favorites" className="hidden h-10 w-10 place-items-center rounded-full transition hover:bg-[#FCEFF3] hover:text-[#E85D8E] sm:grid" aria-label="Wishlist"><FiHeart /></Link>
            <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-[#FCEFF3] hover:text-[#E85D8E]" aria-label={`Shopping bag with ${cartCount} items`}>
              <FiShoppingBag />
              {cartCount > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#E85D8E] px-1 text-[9px] font-semibold text-white">{cartCount}</span>}
            </Link>
            <button onClick={() => setIsDarkMode((value) => !value)} className="hidden h-10 w-10 place-items-center rounded-full transition hover:bg-[#FCEFF3] hover:text-[#E85D8E] md:grid" aria-label={isDarkMode ? "Use light theme" : "Use dark theme"}>{isDarkMode ? <FiSun /> : <FiMoon />}</button>

            {isAuthenticated ? (
              <div className="relative hidden md:block">
                <button onClick={() => setShowUserMenu((value) => !value)} className="ml-1 flex h-10 items-center gap-2 rounded-full border border-[#E8E5E0] px-3 text-xs dark:border-zinc-700"><FiUser /> {user?.name?.split(" ")[0]}</button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-[#E8E5E0] bg-white p-2 text-sm shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                    <Link to="/my-orders" className="block rounded-xl px-3 py-2.5 hover:bg-[#FFF9F6] dark:hover:bg-zinc-800">My orders</Link>
                    {isAdmin && <Link to="/admin" className="block rounded-xl px-3 py-2.5 text-[#E85D8E] hover:bg-[#FFF9F6] dark:hover:bg-zinc-800">Admin dashboard</Link>}
                    <button onClick={() => { logout(); navigate("/"); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-red-600 hover:bg-red-50"><FiLogOut /> Sign out</button>
                  </div>
                )}
              </div>
            ) : <Link to="/login" className="ml-2 hidden rounded-full bg-[#2D2D2D] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#E85D8E] md:block dark:bg-white dark:text-[#2D2D2D]">Sign in</Link>}
          </div>
        </div>
      </header>

      {showMobileMenu && (
        <div className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setShowMobileMenu(false)}>
          <aside className="h-full w-[min(88vw,380px)] bg-[#FFF9F6] p-6 shadow-2xl dark:bg-[#121212]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E8E5E0] pb-5 dark:border-zinc-800"><span className="font-serif text-2xl tracking-wider">MIDHUNYAS</span><button onClick={() => setShowMobileMenu(false)} className="grid h-10 w-10 place-items-center rounded-full bg-white text-xl shadow-sm dark:bg-zinc-800" aria-label="Close navigation"><FiX /></button></div>
            <nav className="mt-7 flex flex-col">
              <Link to="/" className="border-b border-[#E8E5E0] py-4 text-2xl font-serif dark:border-zinc-800">Home</Link>
              {navItems.map((item) => <Link key={item.label} to={item.to} onClick={(event) => handleNav(event, item.to)} className="border-b border-[#E8E5E0] py-4 text-2xl font-serif dark:border-zinc-800">{item.label}</Link>)}
              <Link to="/favorites" className="border-b border-[#E8E5E0] py-4 text-2xl font-serif dark:border-zinc-800">Wishlist</Link>
            </nav>
            <div className="mt-7 flex gap-3">
              <button onClick={() => setShowSearch(true)} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#E8E5E0] py-3 text-xs dark:border-zinc-700"><FiSearch /> Search</button>
              <button onClick={() => setIsDarkMode((value) => !value)} className="grid h-11 w-11 place-items-center rounded-full border border-[#E8E5E0] dark:border-zinc-700">{isDarkMode ? <FiSun /> : <FiMoon />}</button>
            </div>
            <Link to={isAuthenticated ? "/my-orders" : "/login"} className="mt-4 block rounded-full bg-[#E85D8E] py-3 text-center text-xs font-semibold text-white">{isAuthenticated ? "My account" : "Sign in"}</Link>
          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;

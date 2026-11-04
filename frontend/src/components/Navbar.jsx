import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHeart, FiLogOut, FiMenu, FiMoon, FiSearch, FiShoppingBag, FiSun, FiUser, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import SearchModal from "./SearchModal";
import ToolbarDynamic from "./ToolbarDynamic";

const navItems = [
  { label: "Shop", to: "/gallery" },
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
    ? "border-[#C5A15B]/40 bg-[#FAF5EE]/95 shadow-[0_8px_30px_rgba(101,31,60,0.08)] backdrop-blur-xl dark:border-[#493640] dark:bg-[#211820]/95"
    : isHome
      ? "border-transparent bg-[#FAF5EE]/70 backdrop-blur-md dark:bg-[#171116]/70"
      : "border-[#E8DDD5] bg-[#FAF5EE] dark:border-[#493640] dark:bg-[#211820]";

  return (
    <>
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
      <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${shell} ${isScrolled ? "h-[72px]" : "h-[96px]"}`}>
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-5 sm:px-8 xl:px-14">
          <button type="button" onClick={() => setShowMobileMenu(true)} className="grid h-10 w-10 place-items-center text-xl text-[#30232A] lg:hidden dark:text-[#FAF5EF]" aria-label="Open navigation"><FiMenu /></button>

          <Link to="/" className="group flex items-center" aria-label="Midhunyas home">
            <img src="/logo.png" alt="Midhunyas Petals Logo" className={`w-auto object-contain transition-all duration-300 group-hover:scale-105 dark:brightness-125 dark:drop-shadow-[0_0_2px_rgba(255,255,255,0.5)] ${isScrolled ? "h-[48px]" : "h-[64px]"}`} />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex xl:gap-10">
            {navItems.map((item) => (
              <Link key={item.label} to={item.to} onClick={(event) => handleNav(event, item.to)} className={`relative py-7 text-[13px] font-medium transition hover:text-[#C5A15B] ${location.pathname === item.to ? "text-[#651F3C] dark:text-[#D5B36C]" : "text-[#30232A] dark:text-[#FAF5EF]"}`}>
                {item.label}
                {location.pathname === item.to && <span className="absolute bottom-5 left-0 right-0 h-0.5 bg-[#651F3C] dark:bg-[#D5B36C] rounded-full" />}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <ToolbarDynamic />
            <Link to="/favorites" className="grid h-10 w-10 place-items-center rounded-full text-[#30232A] transition hover:bg-[#F5EAE9] hover:text-[#651F3C] dark:text-[#FAF5EF] dark:hover:bg-[#261B22] dark:hover:text-[#D5B36C]" aria-label="Wishlist"><FiHeart /></Link>
            <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-full text-[#30232A] transition hover:bg-[#F5EAE9] hover:text-[#651F3C] dark:text-[#FAF5EF] dark:hover:bg-[#261B22] dark:hover:text-[#D5B36C]" aria-label={`Shopping bag with ${cartCount} items`}>
              <FiShoppingBag />
              {cartCount > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#651F3C] px-1 text-[9px] font-semibold text-white">{cartCount}</span>}
            </Link>
            <button onClick={() => setIsDarkMode((value) => !value)} className="hidden h-10 w-10 place-items-center rounded-full text-[#30232A] transition hover:bg-[#F5EAE9] hover:text-[#651F3C] dark:text-[#FAF5EF] dark:hover:bg-[#261B22] dark:hover:text-[#D5B36C] md:grid" aria-label={isDarkMode ? "Use light theme" : "Use dark theme"}>{isDarkMode ? <FiSun /> : <FiMoon />}</button>

            {isAuthenticated ? (
              <div className="relative hidden md:block">
                <button onClick={() => setShowUserMenu((value) => !value)} className="ml-1 flex h-10 items-center gap-2 rounded-full border border-[#E8DDD5] hover:border-[#C5A15B]/50 px-3 text-xs text-[#30232A] dark:border-[#493640] dark:text-[#FAF5EF] transition-colors"><FiUser /> {user?.name?.split(" ")[0]}</button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-[#E8DDD5] bg-white p-2 text-sm shadow-xl dark:border-[#493640] dark:bg-[#261B22]">
                    <Link to="/my-orders" className="block rounded-xl px-3 py-2.5 text-[#30232A] hover:bg-[#FAF5EF] dark:text-[#FAF5EF] dark:hover:bg-[#30232A]">My orders</Link>
                    {isAdmin && <Link to="/admin" className="block rounded-xl px-3 py-2.5 text-[#651F3C] hover:bg-[#FAF5EF] dark:text-[#D5B36C] dark:hover:bg-[#30232A]">Admin dashboard</Link>}
                    <button onClick={() => { logout(); navigate("/"); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><FiLogOut /> Sign out</button>
                  </div>
                )}
              </div>
            ) : <Link to="/login" className="ml-2 hidden rounded-full bg-[#651F3C] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#4D172D] shadow-sm md:block dark:bg-[#651F3C] dark:text-white dark:hover:bg-[#C5A15B]">Sign in</Link>}
          </div>
        </div>
      </header>

      {showMobileMenu && (
        <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setShowMobileMenu(false)}>
          <aside className="h-full w-[min(88vw,380px)] bg-[#FAF5EE] p-6 shadow-2xl dark:bg-[#211820]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#E8DDD5] pb-5 dark:border-[#493640]">
              <span className="font-serif text-2xl tracking-wider text-[#651F3C] dark:text-[#D5B36C]">MIDHUNYAS</span>
              <button onClick={() => setShowMobileMenu(false)} className="grid h-10 w-10 place-items-center rounded-full bg-white text-xl shadow-sm dark:bg-[#30232A]" aria-label="Close navigation"><FiX /></button>
            </div>
            <nav className="mt-7 flex flex-col">
              <Link to="/" className="border-b border-[#E8DDD5] py-4 text-2xl font-serif text-[#30232A] dark:border-[#493640] dark:text-[#FAF5EF]">Home</Link>
              {navItems.map((item) => <Link key={item.label} to={item.to} onClick={(event) => handleNav(event, item.to)} className="border-b border-[#E8DDD5] py-4 text-2xl font-serif text-[#30232A] dark:border-[#493640] dark:text-[#FAF5EF]">{item.label}</Link>)}
              <Link to="/favorites" className="border-b border-[#E8DDD5] py-4 text-2xl font-serif text-[#30232A] dark:border-[#493640] dark:text-[#FAF5EF]">Wishlist</Link>
            </nav>
            <div className="mt-7 flex gap-3">
              <button onClick={() => setShowSearch(true)} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#E8DDD5] py-3 text-xs text-[#30232A] dark:border-[#493640] dark:text-[#FAF5EF]"><FiSearch /> Search</button>
              <button onClick={() => setIsDarkMode((value) => !value)} className="grid h-11 w-11 place-items-center rounded-full border border-[#E8DDD5] text-[#30232A] dark:border-[#493640] dark:text-[#FAF5EF]">{isDarkMode ? <FiSun /> : <FiMoon />}</button>
            </div>
            <Link to={isAuthenticated ? "/my-orders" : "/login"} className="mt-4 block rounded-full bg-[#651F3C] py-3 text-center text-xs font-semibold text-white transition hover:bg-[#4D172D]">{isAuthenticated ? "My account" : "Sign in"}</Link>
          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;

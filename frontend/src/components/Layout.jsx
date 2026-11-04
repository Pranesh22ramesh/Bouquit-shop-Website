import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5EF] text-[#30232A] dark:bg-[#171116] dark:text-[#FAF1EC]">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;

import React, { useEffect, useState } from "react";
import SeoHead from '../seo/SeoHead.jsx';
import { usePageSeo } from '../seo/useSeo.js';
import axios from "../api/axios";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import { SITE_EVENTS, subscribeToSiteEvent } from "../lib/siteEvents";
import { subscribeToTable } from "../lib/supabaseRealtime";
import { FiMapPin, FiPhone, FiMail, FiInstagram, FiFacebook, FiYoutube, FiClock } from "react-icons/fi";
import { DEFAULT_GOOGLE_MAP_EMBED_URL, toGoogleMapsEmbedUrl } from "../utils/googleMaps";

const defaultContent = {
  title: "Contact Us",
  description: "Reach out for custom floral orders, event packages, and support.",
  shopName: "Midhunya Event Flowers",
  workingHours: "9:00 AM - 8:00 PM",
  phonePrimary: "+91 9942071721",
  phoneSecondary: "",
  whatsapp: "+91 9942071721",
  email: "hello@midhunyaflowers.com",
  instaUrl: "",
  facebookUrl: "",
  youtubeUrl: "",
  address: "Karur, Tamil Nadu, India",
  googleMapUrl: DEFAULT_GOOGLE_MAP_EMBED_URL,
};

const ContactPage = () => {
  const [content, setContent] = useState(defaultContent);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  const loadContact = async () => {
    try {
      const res = await axios.get("/content/contact");
      setContent({ ...defaultContent, ...(res.data || {}) });
    } catch (error) {
      console.error("Failed to load contact content", error);
    }
  };

  useEffect(() => {
    loadContact();
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(
    () =>
      subscribeToSiteEvent(SITE_EVENTS.contentChanged, ({ key }) => {
        if (!key || key === "contact") loadContact();
      }),
    []
  );

  useEffect(
    () =>
      subscribeToTable({
        table: "ContentSection",
        filter: "key=eq.contact",
        onChange: loadContact,
        channelName: "contact-content",
      }),
    []
  );

  const mapEmbedUrl = toGoogleMapsEmbedUrl(content.googleMapUrl || content.address);

  return (
    <div className={`min-h-screen px-4 py-10 ${isDarkMode ? "bg-gray-900 text-white" : "bg-[#fff9f7] text-slate-900"}`}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Contact Page</p>
          <h1 className="mt-3 text-4xl font-bold">{content.title}</h1>
          <p className={`mt-3 max-w-2xl text-base ${isDarkMode ? "text-gray-300" : "text-slate-600"}`}>{content.description}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className={`rounded-[2rem] border p-8 shadow-xl ${isDarkMode ? "border-gray-800 bg-gray-900/50 backdrop-blur-xl" : "border-rose-100 bg-white"}`}>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">{content.shopName}</h2>
            <div className={`mt-3 flex items-center gap-2 text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              <FiClock className="text-rose-500 w-4 h-4" />
              <span>Working Hours: {content.workingHours}</span>
            </div>

            <div className="mt-8 space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                  <FiMapPin className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Address</p>
                  <p className={`text-base font-medium leading-relaxed ${isDarkMode ? "text-gray-200" : "text-slate-700"}`}>{content.address}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                  <FiPhone className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Phone</p>
                  <div className="space-y-1">
                    <a href={`tel:${content.phonePrimary}`} className="block text-base font-medium text-rose-500 hover:text-rose-600 transition-colors">
                      {content.phonePrimary}
                    </a>
                    {content.phoneSecondary && (
                      <a href={`tel:${content.phoneSecondary}`} className="block text-base font-medium text-rose-500 hover:text-rose-600 transition-colors">
                        {content.phoneSecondary}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                  <FiMail className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Email</p>
                  <a href={`mailto:${content.email}`} className="block text-base font-medium text-rose-500 hover:text-rose-600 transition-colors">
                    {content.email}
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">Connect With Us</p>
                <div className="flex flex-wrap gap-3">
                  {content.instaUrl && (
                    <a href={content.instaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 transition-all">
                      <FiInstagram className="w-4 h-4" /> Instagram
                    </a>
                  )}
                  {content.facebookUrl && (
                    <a href={content.facebookUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 transition-all">
                      <FiFacebook className="w-4 h-4" /> Facebook
                    </a>
                  )}
                  {content.youtubeUrl && (
                    <a href={content.youtubeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/20 dark:hover:text-rose-400 transition-all">
                      <FiYoutube className="w-4 h-4" /> YouTube
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className={`overflow-hidden rounded-[2rem] border shadow-lg ${isDarkMode ? "border-gray-700 bg-gray-800" : "border-rose-100 bg-white"}`}>
            <iframe title="Store location" src={mapEmbedUrl} className="h-[480px] w-full border-0" loading="lazy" />
          </section>
        </div>
      </div>

      <FloatingWhatsApp phone={String(content.whatsapp || "").replace(/[^\d]/g, "")} label="Chat on WhatsApp" />
    </div>
  );
};

export default ContactPage;

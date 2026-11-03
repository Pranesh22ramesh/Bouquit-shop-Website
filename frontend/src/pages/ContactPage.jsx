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
  shopName: "MIDHUNYAS Petals & Bridal Flowers",
  workingHours: "9:00 AM - 8:00 PM",
  phonePrimary: "+91 9942071721",
  phoneSecondary: "",
  whatsapp: "+91 9942071721",
  email: "hello@midhunyas.com",
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
    <div className={`min-h-screen px-4 py-10 transition-colors ${isDarkMode ? "bg-[#171116] text-[#FAF5EF]" : "bg-[#FAF5EF] text-[#30232A]"}`}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C5A15B]">Get In Touch</p>
          <h1 className="mt-3 text-4xl font-serif font-bold">{content.title}</h1>
          <p className={`mt-3 max-w-2xl text-base ${isDarkMode ? "text-[#C9B8BF]" : "text-[#51454B]"}`}>{content.description}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className={`rounded-[2rem] border p-8 shadow-xl ${isDarkMode ? "border-[#493640] bg-[#261B22]/80 backdrop-blur-xl" : "border-[#E8DDD5] bg-white shadow-sm"}`}>
            <h2 className="text-3xl font-extrabold font-serif text-[#651F3C] dark:text-[#D5B36C]">{content.shopName}</h2>
            <div className={`mt-3 flex items-center gap-2 text-sm font-medium ${isDarkMode ? "text-[#8E7A83]" : "text-[#81747A]"}`}>
              <FiClock className="text-[#C5A15B] w-4 h-4" />
              <span>Working Hours: {content.workingHours}</span>
            </div>

            <div className="mt-8 space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#F5EAE9] dark:bg-[#30232A] flex items-center justify-center">
                  <FiMapPin className="w-5 h-5 text-[#651F3C] dark:text-[#D5B36C]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#81747A] dark:text-[#8E7A83] mb-1">Address</p>
                  <p className={`text-base font-medium leading-relaxed ${isDarkMode ? "text-[#FAF5EF]" : "text-[#30232A]"}`}>{content.address}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#F5EAE9] dark:bg-[#30232A] flex items-center justify-center">
                  <FiPhone className="w-5 h-5 text-[#651F3C] dark:text-[#D5B36C]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#81747A] dark:text-[#8E7A83] mb-1">Phone</p>
                  <div className="space-y-1">
                    <a href={`tel:${content.phonePrimary}`} className="block text-base font-medium text-[#651F3C] dark:text-[#D5B36C] hover:underline transition-colors">
                      {content.phonePrimary}
                    </a>
                    {content.phoneSecondary && (
                      <a href={`tel:${content.phoneSecondary}`} className="block text-base font-medium text-[#651F3C] dark:text-[#D5B36C] hover:underline transition-colors">
                        {content.phoneSecondary}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#F5EAE9] dark:bg-[#30232A] flex items-center justify-center">
                  <FiMail className="w-5 h-5 text-[#651F3C] dark:text-[#D5B36C]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#81747A] dark:text-[#8E7A83] mb-1">Email</p>
                  <a href={`mailto:${content.email}`} className="block text-base font-medium text-[#651F3C] dark:text-[#D5B36C] hover:underline transition-colors">
                    {content.email}
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8DDD5] dark:border-[#493640]">
                <p className="text-xs font-bold uppercase tracking-widest text-[#81747A] dark:text-[#8E7A83] mb-4">Connect With Us</p>
                <div className="flex flex-wrap gap-3">
                  {content.instaUrl && (
                    <a href={content.instaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-[#FAF5EF] dark:bg-[#30232A] border border-[#E8DDD5] dark:border-[#493640] px-5 py-2.5 text-sm font-semibold text-[#30232A] dark:text-[#FAF5EF] hover:border-[#C5A15B] hover:text-[#651F3C] transition-all">
                      <FiInstagram className="w-4 h-4 text-[#651F3C] dark:text-[#D5B36C]" /> Instagram
                    </a>
                  )}
                  {content.facebookUrl && (
                    <a href={content.facebookUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-[#FAF5EF] dark:bg-[#30232A] border border-[#E8DDD5] dark:border-[#493640] px-5 py-2.5 text-sm font-semibold text-[#30232A] dark:text-[#FAF5EF] hover:border-[#C5A15B] hover:text-[#651F3C] transition-all">
                      <FiFacebook className="w-4 h-4 text-[#651F3C] dark:text-[#D5B36C]" /> Facebook
                    </a>
                  )}
                  {content.youtubeUrl && (
                    <a href={content.youtubeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-[#FAF5EF] dark:bg-[#30232A] border border-[#E8DDD5] dark:border-[#493640] px-5 py-2.5 text-sm font-semibold text-[#30232A] dark:text-[#FAF5EF] hover:border-[#C5A15B] hover:text-[#651F3C] transition-all">
                      <FiYoutube className="w-4 h-4 text-[#651F3C] dark:text-[#D5B36C]" /> YouTube
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className={`overflow-hidden rounded-[2rem] border shadow-lg ${isDarkMode ? "border-[#493640] bg-[#261B22]" : "border-[#E8DDD5] bg-white"}`}>
            <iframe title="Store location" src={mapEmbedUrl} className="h-[480px] w-full border-0" loading="lazy" />
          </section>
        </div>
      </div>

      <FloatingWhatsApp phone={String(content.whatsapp || "").replace(/[^\d]/g, "")} label="Chat on WhatsApp" />
    </div>
  );
};

export default ContactPage;

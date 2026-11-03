import React, { useEffect, useState } from "react";
import SeoHead from '../seo/SeoHead.jsx';
import { usePageSeo } from '../seo/useSeo.js';
import axios from "../api/axios";
import { SITE_EVENTS, subscribeToSiteEvent } from "../lib/siteEvents";
import { subscribeToTable } from "../lib/supabaseRealtime";

const defaultContent = {
  title: "About Our Studio",
  description: "We create event florals with a focus on freshness, color harmony, and personal detail.",
  mission: "",
  vision: "",
  companyStory: "",
  heroImage: "",
  galleryImages: [],
  team: [],
};

const AboutPage = () => {
  const [content, setContent] = useState(defaultContent);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  const loadAbout = async () => {
    try {
      const res = await axios.get("/content/about");
      setContent({ ...defaultContent, ...(res.data || {}) });
    } catch (error) {
      console.error("Failed to load about content", error);
    }
  };

  useEffect(() => {
    loadAbout();
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
        if (!key || key === "about") loadAbout();
      }),
    []
  );

  useEffect(
    () =>
      subscribeToTable({
        table: "ContentSection",
        filter: "key=eq.about",
        onChange: loadAbout,
        channelName: "about-content",
      }),
    []
  );

  return (
    <div className={`min-h-screen py-10 transition-colors ${isDarkMode ? "bg-[#160F17] text-[#FAF5EE]" : "bg-[#FAF5EE] text-[#30232A]"}`}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C5A15B]">Our Story</p>
            <h1 className={`text-4xl font-serif font-bold ${isDarkMode ? "text-[#FAF5EE]" : "text-[#30232A]"}`}>{content.title}</h1>
            <p className={`text-base leading-8 ${isDarkMode ? "text-[#C9B8BF]" : "text-[#51454B]"}`}>{content.description}</p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className={`rounded-[1.75rem] border p-6 ${isDarkMode ? "border-[#493640] bg-[#231722]" : "border-[#E8DDD5] bg-white shadow-sm"}`}>
                <h2 className="text-xl font-serif font-bold text-[#651F3C] dark:text-[#D5B36C]">Mission</h2>
                <p className={`mt-3 text-sm leading-7 ${isDarkMode ? "text-[#C9B8BF]" : "text-[#51454B]"}`}>{content.mission}</p>
              </div>
              <div className={`rounded-[1.75rem] border p-6 ${isDarkMode ? "border-[#493640] bg-[#231722]" : "border-[#E8DDD5] bg-white shadow-sm"}`}>
                <h2 className="text-xl font-serif font-bold text-[#651F3C] dark:text-[#D5B36C]">Vision</h2>
                <p className={`mt-3 text-sm leading-7 ${isDarkMode ? "text-[#C9B8BF]" : "text-[#51454B]"}`}>{content.vision}</p>
              </div>
            </div>

            <div className={`rounded-[1.75rem] border p-6 ${isDarkMode ? "border-[#493640] bg-[#231722]" : "border-[#E8DDD5] bg-white shadow-sm"}`}>
              <h2 className="text-xl font-serif font-bold text-[#651F3C] dark:text-[#D5B36C]">Company Story</h2>
              <p className={`mt-3 text-sm leading-8 ${isDarkMode ? "text-[#C9B8BF]" : "text-[#51454B]"}`}>{content.companyStory}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`overflow-hidden rounded-[2rem] border shadow-xl ${isDarkMode ? "border-[#493640] bg-[#231722]" : "border-[#E8DDD5] bg-white"}`}>
              {content.heroImage ? (
                <img src={content.heroImage} alt="About page" className="h-[420px] w-full object-cover" />
              ) : (
                <div className="flex h-[420px] items-center justify-center bg-[#F6ECE7] text-[#81747A]">
                  No hero image yet
                </div>
              )}
            </div>

            {content.galleryImages?.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {content.galleryImages.slice(0, 6).map((image) => (
                  <div key={image} className="overflow-hidden rounded-2xl border border-[#E8DDD5] dark:border-[#493640] shadow-md">
                    <img src={image} alt="About gallery" className="h-28 w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {content.team?.length > 0 && (
          <section className="mt-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C5A15B]">The Floral Artisans</p>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {content.team.map((member) => (
                <article
                  key={member.id}
                  className={`rounded-[1.75rem] border p-6 ${isDarkMode ? "border-[#493640] bg-[#231722]" : "border-[#E8DDD5] bg-white shadow-sm"}`}
                >
                  <h3 className={`text-xl font-serif font-bold ${isDarkMode ? "text-[#FAF5EE]" : "text-[#30232A]"}`}>{member.name}</h3>
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#C5A15B]">{member.role}</p>
                  <p className={`mt-4 text-sm leading-7 ${isDarkMode ? "text-[#C9B8BF]" : "text-[#51454B]"}`}>{member.bio}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AboutPage;

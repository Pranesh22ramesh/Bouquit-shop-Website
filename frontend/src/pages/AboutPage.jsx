import React, { useEffect, useState } from "react";
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
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">About Page</p>
          <h1 className={`text-4xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>{content.title}</h1>
          <p className={`text-base leading-8 ${isDarkMode ? "text-gray-300" : "text-slate-600"}`}>{content.description}</p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className={`rounded-[1.75rem] border p-6 ${isDarkMode ? "border-gray-700 bg-gray-800" : "border-rose-100 bg-white"}`}>
              <h2 className="text-xl font-bold text-rose-600">Mission</h2>
              <p className={`mt-3 text-sm leading-7 ${isDarkMode ? "text-gray-300" : "text-slate-600"}`}>{content.mission}</p>
            </div>
            <div className={`rounded-[1.75rem] border p-6 ${isDarkMode ? "border-gray-700 bg-gray-800" : "border-rose-100 bg-white"}`}>
              <h2 className="text-xl font-bold text-rose-600">Vision</h2>
              <p className={`mt-3 text-sm leading-7 ${isDarkMode ? "text-gray-300" : "text-slate-600"}`}>{content.vision}</p>
            </div>
          </div>

          <div className={`rounded-[1.75rem] border p-6 ${isDarkMode ? "border-gray-700 bg-gray-800" : "border-rose-100 bg-white"}`}>
            <h2 className="text-xl font-bold text-rose-600">Company Story</h2>
            <p className={`mt-3 text-sm leading-8 ${isDarkMode ? "text-gray-300" : "text-slate-600"}`}>{content.companyStory}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`overflow-hidden rounded-[2rem] border shadow-xl ${isDarkMode ? "border-gray-700 bg-gray-800" : "border-rose-100 bg-white"}`}>
            {content.heroImage ? (
              <img src={content.heroImage} alt="About page" className="h-[420px] w-full object-cover" />
            ) : (
              <div className="flex h-[420px] items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50 text-slate-400">
                No hero image yet
              </div>
            )}
          </div>

          {content.galleryImages?.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {content.galleryImages.slice(0, 6).map((image) => (
                <div key={image} className="overflow-hidden rounded-2xl border border-white/40 shadow-lg">
                  <img src={image} alt="About gallery" className="h-28 w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {content.team?.length > 0 && (
        <section className="mt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Team Section</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {content.team.map((member) => (
              <article
                key={member.id}
                className={`rounded-[1.75rem] border p-6 ${isDarkMode ? "border-gray-700 bg-gray-800" : "border-rose-100 bg-white"}`}
              >
                <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>{member.name}</h3>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">{member.role}</p>
                <p className={`mt-4 text-sm leading-7 ${isDarkMode ? "text-gray-300" : "text-slate-600"}`}>{member.bio}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AboutPage;

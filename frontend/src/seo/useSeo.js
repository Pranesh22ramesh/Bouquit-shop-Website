// src/seo/useSeo.js
import { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';

// Simple in-memory cache: key -> { data, timestamp }
const cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const DEFAULT_CONFIG = {
  businessName: 'MIDHUNYAS Petals',
  businessSlogan: "Karur's Finest Flower Shop",
  address: 'Karur, Tamil Nadu, India',
  city: 'Karur',
  state: 'Tamil Nadu',
  country: 'India',
  postalCode: '639001',
  phone: '+91 9942071721',
  whatsapp: '+91 9942071721',
  email: 'miudhunyas2012karur@gmail.com',
  latitude: '10.9601',
  longitude: '78.0766',
  googleMapsUrl: 'https://maps.google.com/?q=Karur,Tamil+Nadu',
  logoUrl: '',
  faviconUrl: '',
  defaultOgImage: '',
  ga4MeasurementId: '',
  gtmContainerId: '',
  gscVerificationCode: '',
  instagramUrl: '',
  facebookUrl: '',
  twitterHandle: '',
  siteUrl: 'https://karurflowershop.vercel.app',
  businessHours: {},
};

export const PAGE_DEFAULTS = {
  home: {
    metaTitle: 'Flower Shop in Karur - MIDHUNYAS Petals | Fresh Bouquets & Bridal Flowers',
    metaDescription: "MIDHUNYAS Petals — Karur's premier flower shop. Shop handcrafted bouquets, bridal flowers, wedding garlands & custom floral gifts. Order online with WhatsApp delivery.",
    keywords: 'flower shop in karur, karur flower shop, bouquet shop karur, fresh flowers karur, MIDHUNYAS petals, bridal flowers karur',
    schemaType: 'WebSite',
  },
  gallery: {
    metaTitle: 'Bouquets & Flowers Gallery - Karur | MIDHUNYAS Petals',
    metaDescription: "Browse our beautiful gallery of fresh bouquets, bridal flowers, anniversary arrangements, birthday bouquets and customized floral collections from Karur's best flower shop.",
    keywords: 'flower gallery karur, bouquet photos, bridal flowers karur, birthday bouquet karur',
    schemaType: 'CollectionPage',
  },
  about: {
    metaTitle: 'About MIDHUNYAS Petals - Karur Flower Shop Since 2012',
    metaDescription: "Learn about MIDHUNYAS Petals, Karur's trusted flower shop creating handcrafted bouquets, bridal flowers, and customized floral arrangements with love.",
    keywords: 'about midhunyas petals, karur flower shop',
    schemaType: 'AboutPage',
  },
  contact: {
    metaTitle: 'Contact Flower Shop Karur - MIDHUNYAS Petals | +91 9942071721',
    metaDescription: 'Contact MIDHUNYAS Petals for flower orders, custom bouquets, bridal flowers and wedding arrangements in Karur, Tamil Nadu. Call or WhatsApp +91 9942071721.',
    keywords: 'contact flower shop karur, flower delivery karur',
    schemaType: 'ContactPage',
  },
  reviews: {
    metaTitle: 'Customer Reviews - MIDHUNYAS Petals Karur Flower Shop',
    metaDescription: "Read genuine customer reviews for MIDHUNYAS Petals, Karur's best flower shop.",
    keywords: 'midhunyas petals reviews, karur flower shop reviews',
    schemaType: 'WebPage',
  },
};

async function fetchWithCache(key, fetcher) {
  const now = Date.now();
  if (cache[key] && now - cache[key].timestamp < CACHE_TTL) {
    return cache[key].data;
  }
  const data = await fetcher();
  cache[key] = { data, timestamp: now };
  return data;
}

export function useSeoConfig() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    fetchWithCache('seo-config', async () => {
      const { data } = await axios.get('/seo/config');
      return data.config;
    })
      .then((cfg) => { if (mounted.current) setConfig({ ...DEFAULT_CONFIG, ...cfg }); })
      .catch(() => {});
    return () => { mounted.current = false; };
  }, []);

  return config;
}

export function usePageSeo(pageKey) {
  const defaults = PAGE_DEFAULTS[pageKey] || {};
  const [seo, setSeo] = useState(defaults);
  const mounted = useRef(true);

  useEffect(() => {
    if (!pageKey) return;
    mounted.current = true;
    fetchWithCache(`seo-page-${pageKey}`, async () => {
      const { data } = await axios.get(`/seo/pages/${pageKey}`);
      return data.page;
    })
      .then((page) => { if (mounted.current && page) setSeo({ ...defaults, ...page }); })
      .catch(() => {});
    return () => { mounted.current = false; };
  }, [pageKey]);

  return seo;
}

export function invalidateSeoCache(key) {
  if (key) delete cache[key];
  else Object.keys(cache).forEach((k) => delete cache[k]);
}


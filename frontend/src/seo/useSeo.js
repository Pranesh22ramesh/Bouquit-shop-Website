// src/seo/useSeo.js
import { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';

// Simple in-memory cache: key -> { data, timestamp }
const cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const DEFAULT_CONFIG = {
  businessName: 'MIDHUNYAS Petals',
  businessSlogan: "Bouquets and bridal flowers in Karur",
  address: 'Karur, Tamil Nadu, India',
  city: 'Karur',
  state: 'Tamil Nadu',
  country: 'India',
  postalCode: '639001',
  phone: '+91 9942071721',
  whatsapp: '+91 9942071721',
  email: '',
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
    metaDescription: 'Browse bouquets, bridal flowers and garlands from Midhunyas Petals in Karur.',
    keywords: 'flower shop in karur, karur flower shop, bouquet shop karur, fresh flowers karur, MIDHUNYAS petals, bridal flowers karur',
    schemaType: 'WebSite',
  },
  gallery: {
    metaTitle: 'Bouquets & Flowers Gallery - Karur | MIDHUNYAS Petals',
    metaDescription: 'Browse bouquets, bridal flowers and garlands from Midhunyas Petals in Karur.',
    keywords: 'flower gallery karur, bouquet photos, bridal flowers karur, birthday bouquet karur',
    schemaType: 'CollectionPage',
  },
  about: {
    metaTitle: 'About MIDHUNYAS Petals - Flower Shop in Karur',
    metaDescription: 'Browse bouquets, bridal flowers and garlands from Midhunyas Petals in Karur.',
    keywords: 'about midhunyas petals, karur flower shop',
    schemaType: 'AboutPage',
  },
  contact: {
    metaTitle: 'Contact Flower Shop Karur - MIDHUNYAS Petals | +91 9942071721',
    metaDescription: 'Browse bouquets, bridal flowers and garlands from Midhunyas Petals in Karur.',
    keywords: 'contact flower shop karur, flower delivery karur',
    schemaType: 'ContactPage',
  },
  reviews: {
    metaTitle: 'Customer Reviews - MIDHUNYAS Petals Karur Flower Shop',
    metaDescription: 'Browse bouquets, bridal flowers and garlands from Midhunyas Petals in Karur.',
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


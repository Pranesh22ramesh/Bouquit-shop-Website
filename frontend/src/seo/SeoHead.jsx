// src/seo/SeoHead.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSeoConfig } from './useSeo';

const SITE_URL = 'https://karurflowershop.vercel.app';

/**
 * Builds JSON-LD schema objects
 */
function buildSchemas({ schemaType, config, seo, product, canonicalUrl }) {
  const schemas = [];
  const siteUrl = config.siteUrl || SITE_URL;

  // Organization schema (always present)
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.businessName,
    url: siteUrl,
    logo: config.logoUrl || `${siteUrl}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: config.phone,
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Tamil'],
    },
    sameAs: [
      config.instagramUrl,
      config.facebookUrl,
    ].filter(Boolean),
  };
  schemas.push(orgSchema);

  // LocalBusiness / Florist schema
  const localSchema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'Florist'],
    name: config.businessName,
    description: seo.metaDescription,
    url: siteUrl,
    telephone: config.phone,
    email: config.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: config.address,
      addressLocality: config.city,
      addressRegion: config.state,
      postalCode: config.postalCode,
      addressCountry: 'IN',
    },
    geo: config.latitude && config.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: config.latitude,
      longitude: config.longitude,
    } : undefined,
    image: config.logoUrl || config.defaultOgImage || undefined,
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, Online',
    openingHoursSpecification: config.businessHours ? buildOpeningHours(config.businessHours) : undefined,
  };
  schemas.push(localSchema);

  // WebSite + SearchAction (homepage only)
  if (schemaType === 'WebSite') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: config.businessName,
      url: siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/gallery?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    });
  }

  // Product schema
  if (schemaType === 'Product' && product) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || seo.metaDescription,
      image: product.image || undefined,
      brand: { '@type': 'Brand', name: config.businessName },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: product.price || product.offerPrice || '0',
        availability: product.availability === 'AVAILABLE'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: config.businessName },
        url: canonicalUrl,
      },
    });
  }

  // Custom JSON-LD override
  if (seo.customJsonLd) {
    try {
      const custom = JSON.parse(seo.customJsonLd);
      schemas.push(custom);
    } catch (_) {}
  }

  return schemas.filter(Boolean);
}

function buildOpeningHours(hours) {
  const dayMap = {
    monday: 'Mo', tuesday: 'Tu', wednesday: 'We', thursday: 'Th',
    friday: 'Fr', saturday: 'Sa', sunday: 'Su',
  };
  return Object.entries(hours)
    .filter(([, v]) => v)
    .map(([day, timeRange]) => {
      const [opens, closes] = timeRange.split('-');
      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${day.charAt(0).toUpperCase() + day.slice(1)}`,
        opens,
        closes,
      };
    });
}

/**
 * Main SeoHead component. Drop this into any page.
 *
 * @param {object} props
 * @param {string} props.pageKey - key for fetching SEO from backend (e.g. "home", "gallery")
 * @param {object} [props.seoOverride] - per-page overrides (title, description, ogImage, etc.)
 * @param {object} [props.product] - product object for Product schema
 * @param {string[]} [props.breadcrumbs] - array of { name, url } for BreadcrumbList
 */
export default function SeoHead({ pageKey, seoOverride = {}, product, breadcrumbs }) {
  const config = useSeoConfig();
  const location = useLocation();
  const siteUrl = (config.siteUrl || SITE_URL).replace(/\/$/, '');
  const canonicalUrl = seoOverride.canonicalUrl || `${siteUrl}${location.pathname}`;

  // Merge defaults → seoOverride (page-specific dynamic data wins)
  const seo = { ...seoOverride };

  const title = seo.metaTitle || seo.title || `${config.businessName} | Flower Shop in Karur`;
  const description = seo.metaDescription || seo.description || `${config.businessName} — ${config.businessSlogan}`;
  const keywords = seo.keywords || 'flower shop karur, MIDHUNYAS petals, bouquet karur';
  const robots = seo.robots || 'index, follow';
  const ogImage = seo.ogImage || seo.image || config.defaultOgImage || `${siteUrl}/og-default.jpg`;
  const ogTitle = seo.ogTitle || title;
  const ogDescription = seo.ogDescription || description;
  const schemaType = seo.schemaType || 'WebPage';

  const schemas = buildSchemas({ schemaType, config, seo: { metaDescription: description, ...seo, customJsonLd: seo.customJsonLd }, product, canonicalUrl });

  // BreadcrumbList
  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: crumb.name,
        item: crumb.url ? `${siteUrl}${crumb.url}` : undefined,
      })),
    });
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Geo / Local SEO */}
      <meta name="geo.region" content="IN-TN" />
      <meta name="geo.placename" content={config.city} />
      {config.latitude && <meta name="geo.position" content={`${config.latitude};${config.longitude}`} />}
      {config.latitude && <meta name="ICBM" content={`${config.latitude}, ${config.longitude}`} />}

      {/* Open Graph */}
      <meta property="og:type" content={schemaType === 'Product' ? 'product' : 'website'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={ogTitle} />
      <meta property="og:site_name" content={config.businessName} />
      <meta property="og:locale" content="en_IN" />
      {config.facebookAppId && <meta property="fb:app_id" content={config.facebookAppId} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.twitterTitle || ogTitle} />
      <meta name="twitter:description" content={seo.twitterDescription || ogDescription} />
      <meta name="twitter:image" content={seo.twitterImage || ogImage} />
      {config.twitterHandle && <meta name="twitter:site" content={`@${config.twitterHandle.replace('@', '')}`} />}

      {/* Google Search Console verification */}
      {config.gscVerificationCode && (
        <meta name="google-site-verification" content={config.gscVerificationCode} />
      )}

      {/* Favicon */}
      {config.faviconUrl && <link rel="icon" href={config.faviconUrl} />}

      {/* JSON-LD Schemas */}
      {schemas.map((schema, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}


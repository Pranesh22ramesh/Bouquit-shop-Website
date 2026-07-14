// src/seo/Analytics.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSeoConfig } from './useSeo';

/**
 * Dynamically loads GA4 and GTM scripts based on admin config.
 * Add <Analytics /> once in main.jsx or App.jsx.
 */
export default function Analytics() {
  const config = useSeoConfig();
  const location = useLocation();

  // Inject GA4
  useEffect(() => {
    if (!config.ga4MeasurementId) return;
    const id = config.ga4MeasurementId;
    if (document.getElementById('ga4-script')) return; // already loaded

    const script = document.createElement('script');
    script.id = 'ga4-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);

    const inlineScript = document.createElement('script');
    inlineScript.id = 'ga4-init';
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${id}', { page_path: window.location.pathname });
    `;
    document.head.appendChild(inlineScript);
  }, [config.ga4MeasurementId]);

  // Inject GTM
  useEffect(() => {
    if (!config.gtmContainerId) return;
    const id = config.gtmContainerId;
    if (document.getElementById('gtm-script')) return;

    const script = document.createElement('script');
    script.id = 'gtm-script';
    script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');`;
    document.head.appendChild(script);

    // noscript iframe
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(noscript, document.body.firstChild);
  }, [config.gtmContainerId]);

  // Track page views on route change (for GA4)
  useEffect(() => {
    if (!config.ga4MeasurementId || typeof window.gtag !== 'function') return;
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location.pathname, location.search, config.ga4MeasurementId]);

  return null;
}


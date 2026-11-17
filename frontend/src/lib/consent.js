export const CONSENT_KEY = 'shop-consent-v1';
export const CAMPAIGN_KEY = 'shop-campaign-v1';
export function readConsent() {
  try { const value = JSON.parse(localStorage.getItem(CONSENT_KEY)); return value?.version === 1 && typeof value.analytics === 'boolean' ? value : null; } catch { return null; }
}
export function saveConsent(analytics) {
  const value = { version: 1, analytics: Boolean(analytics), updatedAt: new Date().toISOString() };
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(value)); if (!analytics) sessionStorage.removeItem(CAMPAIGN_KEY); } catch { /* essential browsing works without storage */ }
  window.dispatchEvent(new Event('shop:consent'));
}
export function captureCampaign(search) {
  if (!readConsent()?.analytics || navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;
  const params = new URLSearchParams(search);
  const campaign = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const value = params.get(key);
    if (value && /^[\p{L}\p{N} ._-]{1,100}$/u.test(value)) campaign[key] = value;
  }
  if (Object.keys(campaign).length) { try { sessionStorage.setItem(CAMPAIGN_KEY, JSON.stringify(campaign)); } catch { /* optional storage */ } }
}

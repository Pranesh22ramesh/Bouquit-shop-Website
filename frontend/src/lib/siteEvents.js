const CHANNEL_NAME = "shop-web-site-events";
const STORAGE_KEY = "shop-web-site-event";

let channel = null;

const getChannel = () => {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME);
  return channel;
};

export const emitSiteEvent = (type, payload = {}) => {
  const event = {
    type,
    payload,
    at: Date.now(),
  };

  window.dispatchEvent(new CustomEvent(type, { detail: payload }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(event));
  getChannel()?.postMessage(event);
};

export const subscribeToSiteEvent = (type, callback) => {
  const handleWindowEvent = (event) => callback(event.detail || {});
  const handleStorage = (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue);
      if (parsed.type === type) callback(parsed.payload || {});
    } catch (error) {
      console.error("Failed to parse site event", error);
    }
  };
  const handleChannel = (event) => {
    if (event.data?.type === type) callback(event.data.payload || {});
  };

  window.addEventListener(type, handleWindowEvent);
  window.addEventListener("storage", handleStorage);
  getChannel()?.addEventListener("message", handleChannel);

  return () => {
    window.removeEventListener(type, handleWindowEvent);
    window.removeEventListener("storage", handleStorage);
    getChannel()?.removeEventListener("message", handleChannel);
  };
};

export const SITE_EVENTS = {
  galleryChanged: "site:gallery-changed",
  contentChanged: "site:content-changed",
  reviewsChanged: "site:reviews-changed",
  privateCartChanged: "site:private-cart-changed",
  privateOrdersChanged: "site:private-orders-changed",
  privateActivitiesChanged: "site:private-activities-changed",
  privateReviewsChanged: "site:private-reviews-changed",
  privateProfileChanged: "site:private-profile-changed",
  privateAccountDisabled: "site:private-account-disabled",
};

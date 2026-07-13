export const DEFAULT_GOOGLE_MAP_EMBED_URL =
  "https://www.google.com/maps?q=10.9601,78.0766&z=16&output=embed";

const decodeHtmlEntities = (value = "") =>
  String(value)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

const buildEmbedFromQuery = (query) =>
  query
    ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`
    : DEFAULT_GOOGLE_MAP_EMBED_URL;

const extractIframeSrc = (value) => {
  const match = value.match(/<iframe[^>]*\ssrc=["']([^"']+)["'][^>]*>/i);
  return match?.[1] || "";
};

const extractCoordinates = (value) => {
  const atMatch = value.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if (atMatch) return `${atMatch[1]},${atMatch[2]}`;

  const queryMatch = value.match(/[?&](?:q|query)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i);
  if (queryMatch) return `${queryMatch[1]},${queryMatch[2]}`;

  return "";
};

const extractPlaceNameFromPath = (pathname = "") => {
  const placeSegment = pathname.match(/\/maps\/place\/([^/@]+)/i)?.[1];
  return placeSegment ? decodeURIComponent(placeSegment.replace(/\+/g, " ")) : "";
};

export const toGoogleMapsEmbedUrl = (input) => {
  const raw = decodeHtmlEntities(input);
  const iframeSrc = extractIframeSrc(raw);
  const source = decodeHtmlEntities(iframeSrc || raw);

  if (!source) return DEFAULT_GOOGLE_MAP_EMBED_URL;

  const coordinates = extractCoordinates(source);
  if (coordinates) return buildEmbedFromQuery(coordinates);

  try {
    const url = new URL(source);
    const host = url.hostname.toLowerCase();
    const isGoogleMapsHost =
      host.includes("google.") || host.includes("goo.gl") || host.includes("maps.app.goo.gl");

    if (!isGoogleMapsHost) return buildEmbedFromQuery(source);

    if (url.pathname.includes("/maps/embed")) return source;

    const query = url.searchParams.get("q") || url.searchParams.get("query");
    if (query) return buildEmbedFromQuery(query);

    const placeName = extractPlaceNameFromPath(url.pathname);
    if (placeName) return buildEmbedFromQuery(placeName);

    return buildEmbedFromQuery(source);
  } catch {
    return buildEmbedFromQuery(source);
  }
};

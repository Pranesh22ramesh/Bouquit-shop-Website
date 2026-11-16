const { ApiError } = require('../utils/apiError');
const { isSafeUrl } = require('../utils/safeUrl');

const text = (max, pattern) => ({ type: 'string', max, pattern });
const boolean = { type: 'boolean' };
const integer = { type: 'integer' };
const list = (item, max) => ({ type: 'array', item, max });
const object = (fields) => ({ type: 'object', fields });

const link = { ...text(1000), check: isSafeUrl };
const image = link;
const categoryTile = object({ id: text(100, /^[\w-]+$/), name: text(120), note: text(500), image });
const contentSchemas = {
  'home-highlight': object({
    heroText: text(180), heroDescription: text(1500), badgeText: text(120),
    heroHeadline1: text(180), heroHeadline2: text(180), heroHeadline3: text(180),
    collections: list(object({ id: text(100, /^[\w-]+$/), title: text(120), startingPrice: text(80), image, link }), 30),
    primaryButtonLabel: text(80), primaryButtonLink: link, secondaryButtonLabel: text(80), secondaryButtonLink: link,
    features: list(text(120), 20), floatingBadgeTitle: text(120), floatingBadgeSubtitle: text(300),
    homeImagesEditableVersion: integer, banners: list(image, 20), featuredProductIds: list(text(36, /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i), 100),
    categoryTiles: list(categoryTile, 30), occasionTiles: list(object({ id: text(100, /^[\w-]+$/), name: text(120), note: text(500), icon: text(80), image, link }), 30),
    whyChooseUs: list(object({ id: text(100, /^[\w-]+$/), title: text(120), note: text(500), icon: text(80, /^[A-Za-z][A-Za-z0-9]*$/) }), 30),
    deliveryBanner: object({ title: text(180), subtitle: text(1500), buttonLabel: text(80), buttonLink: link, image }),
    midBanner: object({ eyebrow: text(120), title: text(180), subtitle: text(1500), buttonLabel: text(80), buttonLink: link, badgeText: text(120), image }),
    offerPopup: object({ enabled: boolean, badge: text(120), title: text(180), subtitle: text(500), description: text(1500), couponCode: text(50, /^[A-Za-z0-9_-]*$/), buttonLabel: text(120), buttonLink: link, whatsappMessage: text(500), image }),
    eventImage: image,
    inspirationTiles: list(object({ id: text(100, /^[\w-]+$/), src: image, label: text(120), className: text(80, /^[\w: -]*$/) }), 30),
    fallbackProductImages: list(image, 30),
    promotionalSections: list(object({ id: text(100, /^[\w-]+$/), title: text(180), description: text(1000) }), 30),
  }),
  about: object({
    title: text(180), description: text(1500), mission: text(1500), vision: text(1500), companyStory: text(5000),
    heroImage: image, galleryImages: list(image, 30),
    team: list(object({ id: text(100, /^[\w-]+$/), name: text(120), role: text(120), bio: text(1500) }), 30),
  }),
  contact: object({
    title: text(180), description: text(1500), shopName: text(180), workingHours: text(120),
    phonePrimary: text(30, /^(?:|\+?[0-9 ()-]{7,30})$/), phoneSecondary: text(30, /^\+?[0-9 ()-]{0,30}$/),
    whatsapp: text(30, /^\+?[0-9 ()-]{0,30}$/), email: text(254, /^(?:|[^\s@]+@[^\s@]+\.[^\s@]+)$/),
    instaUrl: link, facebookUrl: link, youtubeUrl: link, address: text(500), googleMapUrl: link,
  }),
};

const unsafeText = /(?:<\s*\/?\s*(?:script|iframe|object|embed)\b|javascript\s*:|<[^>]+\bon[a-z]+\s*=)/i;

const validate = (value, schema, field, errors) => {
  if (schema.type === 'string') {
    if (typeof value !== 'string' || value.length > schema.max || (schema.pattern && !schema.pattern.test(value)) || (schema.check && !schema.check(value)) || unsafeText.test(value)) {
      errors.push({ field, message: 'Invalid string value or format' });
    }
    return;
  }
  if (schema.type === 'boolean') {
    if (typeof value !== 'boolean') errors.push({ field, message: 'Must be a boolean' });
    return;
  }
  if (schema.type === 'integer') {
    if (!Number.isSafeInteger(value) || value < 1) errors.push({ field, message: 'Must be a positive integer' });
    return;
  }
  if (schema.type === 'array') {
    if (!Array.isArray(value) || value.length > schema.max) {
      errors.push({ field, message: `Must be an array with no more than ${schema.max} items` });
      return;
    }
    value.forEach((entry, index) => validate(entry, schema.item, `${field}[${index}]`, errors));
    return;
  }
  if (schema.type === 'object') {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
      errors.push({ field, message: 'Must be an object' });
      return;
    }
    for (const [key, entry] of Object.entries(value)) {
      if (!Object.prototype.hasOwnProperty.call(schema.fields, key)) {
        errors.push({ field: `${field}.${key}`, message: 'Unsupported field' });
      } else {
        validate(entry, schema.fields[key], `${field}.${key}`, errors);
      }
    }
  }
};

const validateContentPayload = (key, value, files = []) => {
  const schema = contentSchemas[key];
  if (!schema || value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(400, 'Content data must be a supported object');
  }
  const errors = [];
  validate(value, schema, 'data', errors);

  const validFileField = (field) => {
    if (key === 'home-highlight') return ['bannerFiles', 'homeEventImageFile', 'offerPosterImageFile', 'midBannerImageFile', 'deliveryBannerImageFile'].includes(field) || /^home(?:Occasion|Category|Inspiration|FallbackProduct)Image_\d{1,2}$/.test(field);
    if (key === 'about') return field === 'heroImageFile' || field === 'galleryFiles';
    return false;
  };
  if (files.some((file) => !validFileField(file.fieldname))) {
    errors.push({ field: 'files', message: 'Unsupported upload field' });
  }
  const fileFields = new Set();
  for (const file of files) {
    if (fileFields.has(file.fieldname) && !['bannerFiles', 'galleryFiles'].includes(file.fieldname)) {
      errors.push({ field: 'files', message: 'Duplicate image field' });
    }
    fileFields.add(file.fieldname);
    const indexed = /^home(Occasion|Category|Inspiration|FallbackProduct)Image_(\d+)$/.exec(file.fieldname);
    if (indexed) {
      const field = { Occasion: 'occasionTiles', Category: 'categoryTiles', Inspiration: 'inspirationTiles', FallbackProduct: 'fallbackProductImages' }[indexed[1]];
      if (!Array.isArray(value[field]) || Number(indexed[2]) >= value[field].length) errors.push({ field: 'files', message: 'Image index must refer to an existing tile' });
    }
  }
  if (key === 'contact' && files.length) errors.push({ field: 'files', message: 'Contact content does not support uploads' });

  if (errors.length) throw new ApiError(400, 'Content data failed validation', errors);
};

module.exports = { contentSchemas, validateContentPayload };

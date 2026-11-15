const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { env } = require('../config/env');
const { supabase, hasSupabaseConfig } = require('../config/supabase');
const { ApiError } = require('../utils/apiError');

const localUploadRoot = path.join(__dirname, '..', '..', env.uploadDir);

const ensureLocalDirectory = async (folder) => {
  const fullPath = path.join(localUploadRoot, folder);
  await fs.promises.mkdir(fullPath, { recursive: true });
  return fullPath;
};

/**
 * Automatically enhance and optimize uploaded images for maximum visual clarity.
 * Regardless of original upload quality (low-res, camera blur, dark lighting),
 * this pipeline upscales, normalizes contrast, sharpens floral edges, boosts vibrant colors,
 * and encodes with ultra-high quality WebP.
 */
const optimizeImage = async (fileBuffer) => {
  let image;
  let metadata;
  try {
    image = sharp(fileBuffer, { limitInputPixels: env.upload.maxImagePixels }).rotate();
    metadata = await image.metadata();
  } catch (_) {
    throw new ApiError(400, 'Uploaded file is not a valid image.');
  }

  if (!['jpeg', 'png', 'webp'].includes(metadata.format) || !metadata.width || !metadata.height || metadata.width * metadata.height > env.upload.maxImagePixels) {
    throw new ApiError(400, 'Uploaded file is not a valid image.');
  }

  const width = metadata.width || 1200;
  const height = metadata.height || 1200;

  let pipeline = image;

  // 1. Intelligent Super-Resolution / Adaptive Scaling
  if (width < 1200 && height < 1200) {
    const scaleFactor = Math.min(2.5, Math.max(1200 / width, 1200 / height));
    const targetWidth = Math.round(width * scaleFactor);
    const targetHeight = Math.round(height * scaleFactor);
    pipeline = pipeline.resize(targetWidth, targetHeight, {
      kernel: sharp.kernel.lanczos3,
      fit: 'inside',
    });
  } else if (width > 1920 || height > 1920) {
    pipeline = pipeline.resize(1920, 1920, {
      fit: 'inside',
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    });
  }

  // 2. Dynamic Range & Contrast Normalization (removes haze, mud, and dark exposure)
  pipeline = pipeline.normalize();

  // 3. Flower Petal & Texture Micro-Sharpening (crisp definition of jasmine, rose petals, ribbons)
  pipeline = pipeline.sharpen({
    sigma: 1.25,
    m1: 1.0,
    m2: 2.2,
  });

  // 4. Floral Color Vibrance & Freshness Boost
  pipeline = pipeline.modulate({
    brightness: 1.02,
    saturation: 1.10,
  });

  // 5. Ultra-Clear High-Fidelity WebP Output
  try {
    // Decoding and re-encoding produces an isolated WebP payload; original bytes are never served.
    return await pipeline
      .webp({ quality: 94, effort: 6, smartSubsample: true, alphaQuality: 100 })
      .toBuffer();
  } catch (_) {
    throw new ApiError(400, 'Uploaded file is not a valid image.');
  }
};

const buildStoragePath = (folder, filenameBase) => {
  const safeName = filenameBase.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
  return `${folder}/${Date.now()}-${safeName}.webp`;
};

const getPublicStorageUrl = (storagePath) => {
  if (hasSupabaseConfig) {
    const { data } = supabase.storage.from(env.supabaseStorageBucket).getPublicUrl(storagePath);
    return data.publicUrl;
  }
  return `/${env.uploadDir}/${storagePath.replace(/\\/g, '/')}`;
};

const extractStoragePath = (url) => {
  if (!url) return null;

  const marker = `/storage/v1/object/public/${env.supabaseStorageBucket}/`;
  if (url.includes(marker)) {
    return safeStoragePath(url.split(marker).pop());
  }

  const localMarker = `/${env.uploadDir}/`;
  if (url.includes(localMarker)) {
    return safeStoragePath(url.split(localMarker).pop());
  }

  return null;
};

const safeStoragePath = (value) => {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/\\/g, '/');
  const segments = normalized.split('/');
  if (!normalized || normalized.startsWith('/') || segments.some((segment) => !segment || segment === '.' || segment === '..')) return null;
  if (!/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\.webp$/.test(normalized)) return null;
  return normalized;
};

const uploadImage = async ({ file, folder, filenameBase }) => {
  if (!file?.buffer) return null;

  const optimizedBuffer = await optimizeImage(file.buffer);
  const storagePath = buildStoragePath(folder, filenameBase);

  if (hasSupabaseConfig) {
    const { error } = await supabase.storage
      .from(env.supabaseStorageBucket)
      .upload(storagePath, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (error) throw error;
    return { url: getPublicStorageUrl(storagePath), path: storagePath };
  }

  const fullFolderPath = await ensureLocalDirectory(folder);
  const fullFilePath = path.join(fullFolderPath, path.basename(storagePath));
  await fs.promises.writeFile(fullFilePath, optimizedBuffer);
  return { url: getPublicStorageUrl(storagePath), path: storagePath };
};

const deleteImage = async (urlOrPath) => {
  const storagePath = extractStoragePath(urlOrPath) || safeStoragePath(urlOrPath);
  if (!storagePath) return;

  if (hasSupabaseConfig) {
    const { error } = await supabase.storage.from(env.supabaseStorageBucket).remove([storagePath]);
    if (error && error.message && !error.message.includes('The resource was not found')) {
      throw error;
    }
    return;
  }

  const fullPath = path.resolve(localUploadRoot, storagePath);
  if (!fullPath.startsWith(`${path.resolve(localUploadRoot)}${path.sep}`)) return;
  try {
    await fs.promises.unlink(fullPath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

module.exports = {
  deleteImage,
  extractStoragePath,
  getPublicStorageUrl,
  hasSupabaseConfig,
  uploadImage,
};

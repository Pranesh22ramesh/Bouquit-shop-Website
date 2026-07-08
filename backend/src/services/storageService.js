const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { env } = require('../config/env');
const { supabase, hasSupabaseConfig } = require('../config/supabase');

const localUploadRoot = path.join(__dirname, '..', '..', env.uploadDir);

const ensureLocalDirectory = async (folder) => {
  const fullPath = path.join(localUploadRoot, folder);
  await fs.promises.mkdir(fullPath, { recursive: true });
  return fullPath;
};

const optimizeImage = async (fileBuffer) =>
  sharp(fileBuffer)
    .rotate()
    .resize({ width: 1800, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

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
    return url.split(marker).pop();
  }

  const localMarker = `/${env.uploadDir}/`;
  if (url.includes(localMarker)) {
    return url.split(localMarker).pop();
  }

  return null;
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
  const storagePath = urlOrPath?.includes?.('/') ? extractStoragePath(urlOrPath) || urlOrPath : urlOrPath;
  if (!storagePath) return;

  if (hasSupabaseConfig) {
    const { error } = await supabase.storage.from(env.supabaseStorageBucket).remove([storagePath]);
    if (error && error.message && !error.message.includes('The resource was not found')) {
      throw error;
    }
    return;
  }

  const fullPath = path.join(localUploadRoot, storagePath);
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

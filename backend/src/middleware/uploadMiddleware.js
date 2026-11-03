const path = require('path');
const multer = require('multer');

const maxImageSize = 10 * 1024 * 1024; // 10MB max limit
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

/**
 * Validates the true binary magic numbers of an image buffer
 * to prevent disguised executables or malicious polyglots.
 */
const isValidImageSignature = (buffer) => {
  if (!buffer || buffer.length < 12) return false;

  // 1. JPEG signature: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // 2. PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }

  // 3. WebP signature: "RIFF" .... "WEBP"
  const isRiff =
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
  const isWebp =
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
  if (isRiff && isWebp) {
    return true;
  }

  return false;
};

const sanitizeFileName = (originalName = 'image') => {
  const ext = path.extname(originalName).toLowerCase();
  const base = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 50);
  return `${base || 'upload'}${ext}`;
};

const multerInstance = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxImageSize,
    files: 8,
  },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    // Whitelist extension and reported MIME type
    if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(ext)) {
      const error = new Error('Invalid file type. Only JPG, PNG, and WebP images are allowed.');
      error.code = 'INVALID_IMAGE_TYPE';
      return cb(error, false);
    }

    file.originalname = sanitizeFileName(file.originalname);
    return cb(null, true);
  },
});

/**
 * Middleware that verifies magic bytes of uploaded buffer before allowing processing.
 */
const verifyUploadedFiles = (req, res, next) => {
  const filesToVerify = [];
  if (req.file) filesToVerify.push(req.file);
  if (Array.isArray(req.files)) filesToVerify.push(...req.files);
  else if (req.files && typeof req.files === 'object') {
    Object.values(req.files).forEach((val) => {
      if (Array.isArray(val)) filesToVerify.push(...val);
      else if (val) filesToVerify.push(val);
    });
  }

  for (const file of filesToVerify) {
    if (file && file.buffer) {
      if (!isValidImageSignature(file.buffer)) {
        return res.status(400).json({
          message: 'File security verification failed: Not a genuine image file.',
        });
      }
    }
  }

  next();
};

const upload = {
  single: (fieldName) => [multerInstance.single(fieldName), verifyUploadedFiles],
  array: (fieldName, maxCount) => [multerInstance.array(fieldName, maxCount), verifyUploadedFiles],
  any: () => [multerInstance.any(), verifyUploadedFiles],
};

module.exports = {
  upload,
  isValidImageSignature,
  sanitizeFileName,
};

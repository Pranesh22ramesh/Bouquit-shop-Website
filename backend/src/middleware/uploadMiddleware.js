const path = require('path');
const multer = require('multer');
const maxImageSize = 5 * 1024 * 1024;
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxImageSize, files: 8 },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(ext)) {
      return cb(null, true);
    }
    const error = new Error('Only JPG, PNG, and WEBP images are allowed');
    error.code = 'INVALID_IMAGE_TYPE';
    return cb(error);
  },
});

module.exports = { upload };

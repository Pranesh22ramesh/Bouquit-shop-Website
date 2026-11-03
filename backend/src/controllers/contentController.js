const { body, param } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const contentService = require('../services/contentService');
const { logActivity } = require('../services/activityService');
const { ApiError } = require('../utils/apiError');

const contentKeyValidator = [
  param('key')
    .trim()
    .notEmpty().withMessage('Content key is required')
    .matches(/^[a-z0-9_-]{2,60}$/).withMessage('Invalid content section key format (alphanumeric, hyphens and underscores only)'),
];

const getContent = asyncHandler(async (req, res) => {
  res.json(await contentService.getContent(req.params.key));
});

const updateContent = asyncHandler(async (req, res) => {
  let payload;
  if (typeof req.body.data === 'string') {
    try {
      payload = JSON.parse(req.body.data);
    } catch (err) {
      throw new ApiError(400, 'Invalid JSON payload in data field');
    }
  } else {
    payload = req.body.data || req.body;
  }

  if (!payload || typeof payload !== 'object') {
    throw new ApiError(400, 'Content data must be a valid object');
  }

  const updated = await contentService.updateContent(req.params.key, payload, req.files || []);
  await logActivity({
    userId: req.user.id,
    action: `content_updated_${req.params.key.replace(/-/g, '_')}`,
    resourceType: 'content',
    resourceId: req.params.key,
    details: { key: req.params.key },
  });

  res.json(updated);
});

module.exports = {
  contentKeyValidator,
  getContent,
  updateContent,
};

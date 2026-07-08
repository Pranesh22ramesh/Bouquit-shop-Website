const { body, param } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const contentService = require('../services/contentService');
const { logActivity } = require('../services/activityService');

const getContent = asyncHandler(async (req, res) => {
  res.json(await contentService.getContent(req.params.key));
});

const updateContent = asyncHandler(async (req, res) => {
  const payload =
    typeof req.body.data === 'string'
      ? JSON.parse(req.body.data)
      : req.body.data || req.body;

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

module.exports = { getContent, updateContent };

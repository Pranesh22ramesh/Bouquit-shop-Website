const { prisma } = require('../config/prisma');

const logActivity = async ({ userId, action, resourceType = null, resourceId = null, details = null }) =>
  prisma.activityLog.create({
    data: {
      userId,
      action,
      resourceType,
      resourceId,
      details,
    },
  });

module.exports = { logActivity };

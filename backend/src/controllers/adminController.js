const { asyncHandler } = require('../utils/asyncHandler');
const { getDashboardAnalytics } = require('../services/analyticsService');

const dashboardAnalytics = asyncHandler(async (req, res) => {
  res.json(await getDashboardAnalytics());
});

module.exports = { dashboardAnalytics };

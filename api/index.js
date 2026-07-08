const { app } = require('../backend/src/app');

// Vercel Serverless Functions expect the raw Express app instance
module.exports = app;

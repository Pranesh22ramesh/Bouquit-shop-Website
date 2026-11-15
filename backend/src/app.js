const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { env } = require('./config/env');
const { notFound } = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorMiddleware');
const { sanitizeInput } = require('./middleware/sanitizeInput');
const { strictRequest } = require('./middleware/strictRequest');
const {
  globalLimiter,
  publicLimiter,
} = require('./middleware/rateLimiter');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const contentRoutes = require('./routes/contentRoutes');
const productRoutes = require('./routes/productRoutes');
const productController = require('./controllers/productController');
const adminRoutes = require('./routes/adminRoutes');
const eventRoutes = require('./routes/eventRoutes');
const seoRoutes = require('./routes/seoRoutes');

const app = express();
const knownFrontendOrigins = new Set(['https://karurflowershop.vercel.app']);

// Set the number of trusted reverse-proxy hops explicitly in production so IP limits
// use the client address without trusting arbitrary forwarded headers.
app.set('trust proxy', env.trustProxyHops);

// Security HTTP headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows cross-origin asset loading from CDNs/Supabase
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration with whitelist check
app.use(
  cors({
    origin: function (origin, callback) {
      let configuredOrigin = '';
      try {
        configuredOrigin = new URL(env.frontendUrl).origin;
      } catch (_) {
        configuredOrigin = '';
      }
      const isLocalDevelopmentOrigin = env.nodeEnv !== 'production' &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');
      if (
        !origin ||
        origin === configuredOrigin ||
        knownFrontendOrigins.has(origin) ||
        isLocalDevelopmentOrigin
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Global IP-based rate limiter (configurable via env vars)
app.use(globalLimiter);

// Payload size limits to mitigate large-body denial-of-service
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb', parameterLimit: 200 }));
app.use(cookieParser());

// Global XSS and prototype pollution sanitizer
app.use(sanitizeInput);

morgan.token('safe-path', (req) => (req.route ? `${req.baseUrl}${req.route.path}` : '/unmatched'));
app.use(morgan(':method :safe-path :status :response-time ms'));

// Secure static delivery of uploaded files:
// - Directory indexing disabled
// - dotfiles hidden
// - nosniff header enforced
// - sandboxed Content-Security-Policy to prevent script execution
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', env.uploadDir), {
    dotfiles: 'ignore',
    index: false,
    etag: true,
    maxAge: '7d',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
    },
  })
);

app.get('/api/health', publicLimiter, strictRequest(), (req, res) => {
  res.json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() });
});

// Auth endpoints (strictly rate limited & protected with exponential backoff)
app.use('/api/auth', authRoutes);

// Authenticated user action endpoints (looser rate limits)
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Public browse endpoints (moderate rate limits)
app.use('/api/products', publicLimiter, productRoutes);
app.use('/api/gallery', publicLimiter, productRoutes);
app.get('/api/categories', publicLimiter, strictRequest(), productController.listCategories);
app.get('/api/categories/list', publicLimiter, strictRequest(), productController.listCategories);
app.use('/api/reviews', reviewRoutes); // Has internal publicLimiter / authenticatedLimiter by method
app.use('/api/content', contentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/seo', seoRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = { app };

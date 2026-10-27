require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const listingRoutes = require('./routes/listing.routes');
const requestRoutes = require('./routes/request.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminRoutes = require('./routes/admin.routes');
const verificationRoutes = require('./routes/verification.routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB (skip in test environment so Jest setup controls test DB)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Security headers
app.use(helmet());

// Explicit CORS Origin Allowlist
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : []),
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. curl, tests, mobile native)
    if (!origin) return callback(null, true);

    if (isProduction) {
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS Error: Origin ${origin} not allowed by Access-Control-Allow-Origin.`));
    }

    // In development / testing: allow configured client or standard local dev ports
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (isLocalhost || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS Error: Origin ${origin} is not allowed.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', globalLimiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

// Health check
app.get(['/health', '/api/health', '/api/v1/health'], (req, res) => {
  res.json({ success: true, message: 'FoodBridge API is running', timestamp: new Date() });
});

// API Routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1', listingRoutes);
app.use('/api/v1', requestRoutes);
app.use('/api/v1', dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/verification', verificationRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

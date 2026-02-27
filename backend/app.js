const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');

// XSS clean middleware (xss-clean yerine)
const xssClean = (req, res, next) => {
  if (req.body) {
    const clean = (obj) => {
      if (typeof obj === 'string') return xss(obj);
      if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach((k) => { obj[k] = clean(obj[k]); });
      }
      return obj;
    };
    req.body = clean(req.body);
  }
  next();
};
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const analysisRoutes = require('./routes/analysis');
const matchRoutes = require('./routes/matches');
const reportRoutes = require('./routes/reports');
const paymentRoutes = require('./routes/payments');
const enterpriseRoutes = require('./routes/enterprise');
const coachRoutes = require('./routes/coach');
const seedRoutes = require('./routes/seed');
const adminRoutes = require('./routes/admin');
const communityRoutes = require('./routes/community');

const app = express();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xssClean);
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// CORS
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) {
        cb(null, true);
      } else {
        cb(new Error(`CORS: ${origin} izin verilmedi`));
      }
    },
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    time: new Date().toISOString(),
    version: '1.0.0',
    service: 'X-Neu API',
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/analysis', analysisRoutes);
app.use('/api/v1/matches', matchRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/enterprise', enterpriseRoutes);
app.use('/api/v1/coach', coachRoutes);
app.use('/api/v1/seed', seedRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/community', communityRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;

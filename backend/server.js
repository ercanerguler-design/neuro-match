const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
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

dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io for real-time coach
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
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
      // allow server-to-server calls (no origin) and listed origins
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
    service: 'NEURO-MATCH API',
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

// Socket.io - Real-time AI Coach
require('./socket/coachSocket')(io);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`NEURO-MATCH Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = { app, server };

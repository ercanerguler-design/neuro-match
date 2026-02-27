// Local development server — socket.io dahil
// Production (Vercel) için: backend/api/index.js kullanılır

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const app = require('./app');

// Connect to database
connectDB();

const server = http.createServer(app);

// Socket.io for real-time coach (sadece local dev'de aktif)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

require('./socket/coachSocket')(io);

// Weekly email cron job
const { startWeeklyEmailJob } = require('./utils/weeklyEmail');
startWeeklyEmailJob();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`X-Neu Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = { app, server };

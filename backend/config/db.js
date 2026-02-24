const mongoose = require('mongoose');
const logger = require('../utils/logger');

let cached = null;

const connectDB = async () => {
  if (cached && mongoose.connection.readyState === 1) return cached;
  try {
    cached = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB Connected: ${mongoose.connection.host}`);
    return cached;
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    // process.exit kaldırıldı — serverless'ta tüm süreci öldürür
    throw error;
  }
};

module.exports = connectDB;

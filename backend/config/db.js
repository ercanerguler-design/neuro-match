const mongoose = require('mongoose');
const logger = require('../utils/logger');

let cached = null;

const connectDB = async () => {
  if (cached && mongoose.connection.readyState === 1) return cached;
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Mongo connection string is missing. Set MONGO_URI or MONGODB_URI.');
    }
    cached = await mongoose.connect(mongoUri);
    logger.info(`MongoDB Connected: ${mongoose.connection.host}`);
    return cached;
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    // process.exit kaldırıldı — serverless'ta tüm süreci öldürür
    throw error;
  }
};

module.exports = connectDB;

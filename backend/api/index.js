require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const app = require('../app');

// MongoDB bağlantısını lazy yönet — serverless'ta her invocation'da kontrol et
let isConnected = false;

const connectIfNeeded = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = true;
};

// Vercel serverless handler
module.exports = async (req, res) => {
  await connectIfNeeded();
  return app(req, res);
};

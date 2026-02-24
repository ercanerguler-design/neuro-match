require('dotenv').config();

const mongoose = require('mongoose');
const app = require('../app');

let cachedConn = null;

const connectDB = async () => {
  if (cachedConn && mongoose.connection.readyState === 1) return cachedConn;
  cachedConn = await mongoose.connect(process.env.MONGO_URI);
  return cachedConn;
};

// Vercel serverless handler
module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error('HANDLER ERROR:', err);
    return res.status(500).json({ error: 'Internal Server Error', detail: err.message });
  }
};

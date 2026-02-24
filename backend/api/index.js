require('dotenv').config();

const connectDB = require('../config/db');
const app = require('../app');

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

const logger = require('../utils/logger');
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  logger.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new ErrorResponse('Kaynak bulunamadı', 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'Alan';
    const msg = field === 'email' ? 'Bu email adresi zaten kayıtlı' : `${field} zaten kullanımda`;
    error = new ErrorResponse(msg, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ErrorResponse('Geçersiz token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new ErrorResponse('Token süresi doldu', 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Sunucu hatası',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;

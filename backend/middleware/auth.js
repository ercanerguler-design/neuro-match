const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) return next(new ErrorResponse('Giriş yapmanız gerekiyor', 401));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return next(new ErrorResponse('Kullanıcı bulunamadı', 401));
    if (!req.user.isActive) return next(new ErrorResponse('Hesap devre dışı', 401));
    next();
  } catch (err) {
    return next(new ErrorResponse('Geçersiz token', 401));
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`${req.user.role} rolü bu işlem için yetkisiz`, 403));
    }
    next();
  };
};

exports.checkSubscription = (...plans) => {
  return (req, res, next) => {
    const userPlan = req.user.subscription.plan;
    if (!plans.includes(userPlan)) {
      return next(new ErrorResponse('Bu özellik için plan yükseltmeniz gerekiyor', 402));
    }
    next();
  };
};

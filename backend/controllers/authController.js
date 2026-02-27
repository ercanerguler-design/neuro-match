const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, password, birthDate, gender } = req.body;
  const email = req.body.email ? req.body.email.toLowerCase().trim() : '';

  if (!email) {
    return next(new ErrorResponse('Email adresi gereklidir', 400));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ErrorResponse('Bu email adresi zaten kayıtlı', 400));
  }

  const user = await User.create({ name, email, password, birthDate, gender });

  // Send verification email
  const verifyToken = crypto.randomBytes(20).toString('hex');
  user.emailVerificationToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'X-Neu - Email Doğrulama',
      message: `Hesabınızı doğrulamak için: ${verifyUrl}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0a0a1a;color:#fff;border-radius:16px">
          <h1 style="color:#00d4ff;text-align:center">🧠 X-Neu</h1>
          <h2 style="color:#fff">Hoş Geldiniz, ${user.name}!</h2>
          <p>Email adresinizi doğrulamak için aşağıdaki butona tıklayın:</p>
          <a href="${verifyUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#00d4ff,#7c3aed);color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0">Email Doğrula</a>
          <p style="color:#aaa;font-size:12px">Bu link 24 saat geçerlidir.</p>
        </div>
      `,
    });
  } catch (err) {
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });
  }

  sendTokenResponse(user, 201, res, 'Kayıt başarılı! Email doğrulaması gönderildi.');
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Email ve şifre gereklidir', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return next(new ErrorResponse('Geçersiz email veya şifre', 401));
  }

  if (!user.isActive) {
    return next(new ErrorResponse('Hesabınız devre dışı bırakıldı', 401));
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Giriş başarılı');
});

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

// @desc    Logout
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Çıkış yapıldı' });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ErrorResponse('Bu email ile kayıtlı kullanıcı bulunamadı', 404));

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'X-Neu - Şifre Sıfırlama',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#0a0a1a;color:#fff;border-radius:16px">
          <h1 style="color:#00d4ff;text-align:center">🧠 X-Neu</h1>
          <h2>Şifre Sıfırlama</h2>
          <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
          <a href="${resetUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#00d4ff,#7c3aed);color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0">Şifremi Sıfırla</a>
          <p style="color:#aaa;font-size:12px">Bu link 10 dakika geçerlidir.</p>
        </div>
      `,
    });
    res.status(200).json({ success: true, message: 'Şifre sıfırlama emaili gönderildi' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Email gönderilemedi', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/reset-password/:token
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) return next(new ErrorResponse('Geçersiz veya süresi dolmuş token', 400));

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Şifre başarıyla sıfırlandı');
});

// Helper - Send token
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRE) || 30) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
      neuroProfile: user.neuroProfile,
      isEmailVerified: user.isEmailVerified,
    },
  });
};

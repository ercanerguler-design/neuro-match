const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.post('/register', [
  body('name').notEmpty().withMessage('İsim gereklidir').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Geçerli bir email girin'),
  body('password').isLength({ min: 8 }).withMessage('Şifre en az 8 karakter olmalıdır'),
  validate,
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Geçerli bir email girin'),
  body('password').notEmpty().withMessage('Şifre gereklidir'),
  validate,
], login);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;

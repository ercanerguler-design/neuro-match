const express = require('express');
const router = express.Router();
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get user profile
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
}));

// Update profile
router.put('/profile', asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'birthDate', 'gender', 'country', 'language'];
  const updateData = {};
  allowed.forEach((field) => { if (req.body[field] !== undefined) updateData[field] = req.body[field]; });

  const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: user });
}));

// Change password
router.put('/change-password', asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    return next(new ErrorResponse('Mevcut şifre yanlış', 401));
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({ success: true, message: 'Şifre başarıyla değiştirildi' });
}));

// Daily check-in
router.post('/checkin', asyncHandler(async (req, res) => {
  const { mood, energy, stress, focus, notes } = req.body;
  const user = await User.findById(req.user.id);

  user.dailyCheckin.push({ date: new Date(), mood, energy, stress, focus, notes });
  if (user.dailyCheckin.length > 90) user.dailyCheckin.shift();
  await user.save();

  res.status(200).json({ success: true, message: 'Günlük check-in kaydedildi' });
}));

// Log sleep
router.post('/sleep', asyncHandler(async (req, res) => {
  const { duration, quality, bedTime, wakeTime } = req.body;
  const user = await User.findById(req.user.id);

  user.sleepData.push({ date: new Date(), duration, quality, bedTime, wakeTime });
  if (user.sleepData.length > 90) user.sleepData.shift();
  await user.save();

  res.status(200).json({ success: true, message: 'Uyku verisi kaydedildi' });
}));

// Get dashboard stats
router.get('/dashboard', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const recentCheckins = user.dailyCheckin.slice(-7);
  const recentSleep = user.sleepData.slice(-7);

  const avgMood = recentCheckins.length ? (recentCheckins.reduce((s, c) => s + c.mood, 0) / recentCheckins.length).toFixed(1) : 0;
  const avgSleep = recentSleep.length ? (recentSleep.reduce((s, c) => s + c.duration, 0) / recentSleep.length).toFixed(1) : 0;

  res.status(200).json({
    success: true,
    data: {
      neuroProfile: user.neuroProfile,
      subscription: user.subscription,
      stats: { avgMood, avgSleep, checkinsThisWeek: recentCheckins.length },
      recentCheckins,
      recentSleep,
    },
  });
}));

module.exports = router;

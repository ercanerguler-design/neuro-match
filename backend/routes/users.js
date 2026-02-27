const express = require('express');
const router = express.Router();
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { protect } = require('../middleware/auth');
const { updateStreak, awardBadge, awardXP, getLevelFromXP, xpForLevel } = require('../utils/gamification');
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  // Gamification
  const streak = await updateStreak(req.user.id);

  // AI mood analysis — run for last 3+ entries
  let aiInsight = null;
  const recent = user.dailyCheckin.slice(-7);
  if (recent.length >= 3) {
    try {
      const avg = (arr) => (arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1);
      const summary = [
        `Bugün: Ruh Hali=${mood}/10, Enerji=${energy}/10, Stres=${stress}/10, Odak=${focus}/10`,
        `Son ${recent.length} gün ortalaması: Ruh Hali=${avg(recent.map(c=>c.mood))}, Enerji=${avg(recent.map(c=>c.energy))}, Stres=${avg(recent.map(c=>c.stress))}, Odak=${avg(recent.map(c=>c.focus))}`,
        `Beyin tipi: ${user.neuroProfile?.brainType || 'bilinmiyor'}`,
      ].join('\n');

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sen X-Neu platformunun nörobilim tabanlı ruh hali analistisisin. Kullanıcının günlük check-in verilerine bakarak 3-4 cümlelik Türkçe, kişisel ve uygulanabilir bir içgörü yaz. Empati kur, güçlü yanları vurgula, bir pratik öneri sun.',
          },
          { role: 'user', content: summary },
        ],
        max_tokens: 200,
        temperature: 0.7,
      });
      aiInsight = completion.choices[0]?.message?.content?.trim() || null;
    } catch (err) {
      // AI failure is non-critical — continue without it
      console.error('Checkin AI error:', err.message);
    }
  }

  res.status(200).json({ success: true, message: 'Günlük check-in kaydedildi', streak, aiInsight });
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
  const recentCheckins = user.dailyCheckin.slice(-30); // last 30 for trend
  const recentSleep = user.sleepData.slice(-7);

  const avgMood = recentCheckins.length ? (recentCheckins.reduce((s, c) => s + c.mood, 0) / recentCheckins.length).toFixed(1) : 0;
  const avgSleep = recentSleep.length ? (recentSleep.reduce((s, c) => s + c.duration, 0) / recentSleep.length).toFixed(1) : 0;

  // Gamification level info
  const xp = user.gamification?.xp || 0;
  const levelInfo = getLevelFromXP(xp);

  res.status(200).json({
    success: true,
    data: {
      neuroProfile: user.neuroProfile,
      subscription: user.subscription,
      stats: { avgMood, avgSleep, checkinsThisWeek: recentCheckins.slice(-7).length },
      recentCheckins: recentCheckins.slice(-7),
      checkinHistory: recentCheckins, // full 30 days for trend chart
      recentSleep,
      gamification: {
        xp,
        level: levelInfo.level,
        currentXP: levelInfo.currentXP,
        neededXP: levelInfo.neededXP,
        streak: user.gamification?.streak || 0,
        badges: user.gamification?.badges || [],
      },
    },
  });
}));

module.exports = router;

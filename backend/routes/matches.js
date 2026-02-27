const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Match = require('../models/Match');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const neuroAI = require('../ai/neuroAI');
const { protect } = require('../middleware/auth');

router.use(protect);

// Calculate compatibility with another user
router.post('/calculate', asyncHandler(async (req, res, next) => {
  const { targetUserId, matchType = 'professional' } = req.body;

  const [currentUser, targetUser] = await Promise.all([
    User.findById(req.user.id),
    User.findById(targetUserId),
  ]);

  if (!targetUser) return next(new ErrorResponse('Kullanıcı bulunamadı', 404));
  if (!currentUser.neuroProfile?.brainType) {
    return next(new ErrorResponse('Önce kendi analizini tamamla', 400));
  }
  if (!targetUser.neuroProfile?.brainType) {
    return next(new ErrorResponse('Hedef kullanıcı analizini tamamlamamış', 400));
  }

  const compatResult = await neuroAI.calculateCompatibility(
    currentUser.neuroProfile,
    targetUser.neuroProfile,
    matchType
  );

  const match = await Match.create({
    requester: req.user.id,
    target: targetUserId,
    type: matchType,
    ...compatResult,
    status: 'completed',
  });

  res.status(201).json({ success: true, data: match });
}));

// Get my matches
router.get('/', asyncHandler(async (req, res, next) => {
  const matches = await Match.find({ requester: req.user.id })
    .populate('target', 'name avatar neuroProfile')
    .sort('-createdAt')
    .limit(20);
  res.status(200).json({ success: true, count: matches.length, data: matches });
}));

// Find compatible users
router.get('/find/:matchType', asyncHandler(async (req, res, next) => {
  const currentUser = await User.findById(req.user.id);
  if (!currentUser.neuroProfile?.brainType) {
    return next(new ErrorResponse('Önce analizini tamamla', 400));
  }

  // Normalize current user's brainType in memory for scoring
  currentUser.neuroProfile.brainType = currentUser.neuroProfile.brainType.toLowerCase();

  const compatibleUsers = await User.find({
    _id: { $ne: req.user.id },
    'neuroProfile.brainType': { $exists: true, $nin: [null, ''] },
    isActive: { $ne: false },
  }).select('name avatar neuroProfile').limit(50);

  const scoredUsers = compatibleUsers.map((user) => {
    const score = calculateQuickScore(currentUser.neuroProfile, user.neuroProfile);
    return { user, score };
  });

  scoredUsers.sort((a, b) => b.score - a.score);

  res.status(200).json({ success: true, data: scoredUsers.slice(0, 10) });
}));

function calculateQuickScore(profile1, profile2) {
  let score = 0;
  const compatible = { analytical: ['empathetic', 'creative'], creative: ['strategic', 'analytical'], empathetic: ['analytical', 'strategic'], strategic: ['creative', 'empathetic'] };
  const bt1 = (profile1.brainType || '').toLowerCase();
  const bt2 = (profile2.brainType || '').toLowerCase();
  if (compatible[bt1]?.includes(bt2)) score += 30;
  if (profile1.energyRhythm === profile2.energyRhythm) score += 20;
  if (profile1.socialPattern !== profile2.socialPattern) score += 10;
  score += Math.floor(Math.random() * 20) + 30;
  return Math.min(score, 100);
}

module.exports = router;

const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

router.use(protect);

// Enterprise dashboard — real data from MongoDB
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [totalTeam, brainDist, checkinStats] = await Promise.all([
    User.countDocuments({ role: { $in: ['enterprise', 'user'] } }),
    User.aggregate([
      { $match: { 'neuroProfile.brainType': { $exists: true, $ne: null } } },
      { $group: { _id: '$neuroProfile.brainType', count: { $sum: 1 } } },
    ]),
    User.aggregate([
      { $unwind: '$dailyCheckin' },
      { $group: {
        _id: null,
        avgMood: { $avg: '$dailyCheckin.mood' },
        avgEnergy: { $avg: '$dailyCheckin.energy' },
        avgStress: { $avg: '$dailyCheckin.stress' },
      }},
    ]),
  ]);

  const brainMap = {};
  brainDist.forEach((b) => { brainMap[b._id] = b.count; });
  const totalWithProfile = Object.values(brainMap).reduce((a, b) => a + b, 0) || 1;

  const avgStress = checkinStats[0]?.avgStress || 3.5;
  const burnoutRisk = Math.min(100, Math.round((avgStress / 10) * 100));
  const teamCompatibility = Math.max(60, Math.round(100 - burnoutRisk * 0.3 + (brainMap['empathetic'] || 0) * 2));
  const productivityScore = Math.round((checkinStats[0]?.avgEnergy || 7) * 10);

  res.status(200).json({
    success: true,
    data: {
      totalTeam,
      teamCompatibility: Math.min(99, teamCompatibility),
      burnoutRisk,
      productivityScore: Math.min(99, productivityScore),
      brainDistribution: {
        analytical: brainMap['analytical'] || 0,
        creative: brainMap['creative'] || 0,
        empathetic: brainMap['empathetic'] || 0,
        strategic: brainMap['strategic'] || 0,
      },
      checkinStats: checkinStats[0] || { avgMood: 7, avgEnergy: 7, avgStress: 3.5 },
    },
  });
}));

// Team analysis
router.post('/team-analysis', asyncHandler(async (req, res) => {
  const { teamMemberIds } = req.body;
  const users = teamMemberIds?.length
    ? await User.find({ _id: { $in: teamMemberIds } }).select('name neuroProfile')
    : await User.find({ 'neuroProfile.brainType': { $exists: true } }).select('name neuroProfile').limit(20);

  const brainMap = {};
  users.forEach((u) => {
    const bt = u.neuroProfile?.brainType;
    if (bt) brainMap[bt] = (brainMap[bt] || 0) + 1;
  });

  res.status(200).json({
    success: true,
    data: {
      teamSize: users.length,
      overallCompatibility: 82,
      brainDistribution: brainMap,
      recommendations: [
        'Analytical ve Empathetic üyelerinizi iş birliği projelerinde eşleştirin',
        'Creative ekip üyelerinize daha fazla özerklik ve esneklik tanıyın',
        'Strategic üyeleri liderlik rollerine ve karar alma süreçlerine atayın',
        'Haftalık beyin tipi farkındalık oturumları düzenleyin',
      ],
    },
  });
}));

// HR insights — real data
router.get('/hr-insights', asyncHandler(async (req, res) => {
  const [highStressUsers, brainDist] = await Promise.all([
    User.aggregate([
      { $unwind: { path: '$dailyCheckin', preserveNullAndEmptyArrays: false } },
      { $group: { _id: '$_id', name: { $first: '$name' }, avgStress: { $avg: '$dailyCheckin.stress' } } },
      { $match: { avgStress: { $gt: 7 } } },
      { $limit: 5 },
    ]),
    User.aggregate([
      { $match: { 'neuroProfile.brainType': { $exists: true } } },
      { $group: { _id: '$neuroProfile.brainType', count: { $sum: 1 } } },
    ]),
  ]);

  const brainMap = {};
  brainDist.forEach((b) => { brainMap[b._id] = b.count; });

  res.status(200).json({
    success: true,
    data: {
      hiringRecommendations: [
        'Empatik beyin tipleri müşteri hizmetleri rolü için ideal',
        'Analitik beyin tipleri veri ve teknik rollere uygun',
        'Stratejik beyin tipleri liderlik pozisyonlarında başarılı',
      ],
      retentionRisk: highStressUsers.length > 0
        ? highStressUsers.map((u) => `Yüksek stres tespiti: ${u.name} (${u.avgStress.toFixed(1)}/10)`)
        : ['Şu an yüksek burnout riski taşıyan üye yok ✅'],
      teamBalance: brainMap,
    },
  });
}));

module.exports = router;


// Enterprise dashboard
router.get('/dashboard', asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      teamCompatibility: 87,
      burnoutRisk: 23,
      productivityScore: 91,
      topPerformers: [],
      alerts: [],
    },
  });
}));

// Team analysis
router.post('/team-analysis', asyncHandler(async (req, res) => {
  const { teamMemberIds } = req.body;
  res.status(200).json({
    success: true,
    data: {
      teamSize: teamMemberIds?.length || 0,
      overallCompatibility: 82,
      recommendations: [
        'Analytical ve Empathetic üyelerinizi iş birliği projelerinde eşleştirin',
        'Creative ekip üyelerinize daha fazla özerklik tanıyın',
        'Strategic üyeleri liderlik rollerine atayın',
      ],
    },
  });
}));

// HR insights
router.get('/hr-insights', asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      hiringRecommendations: ['Empathetic brain types için müşteri hizmetleri rolü'],
      retentionRisk: ['High burnout risk detected in 3 members'],
      teamBalance: { analytical: 3, creative: 2, empathetic: 4, strategic: 1 },
    },
  });
}));

module.exports = router;

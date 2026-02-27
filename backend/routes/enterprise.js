const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.use(protect);

// POST /enterprise/members/search
router.post('/members/search', asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email gereklidir' });
  const found = await User.findOne({ email: email.toLowerCase().trim() }).select('name email neuroProfile gamification createdAt');
  if (!found) return res.status(404).json({ success: false, message: 'Bu email ile kayitli kullanici bulunamadi' });
  res.json({ success: true, data: { _id: found._id, name: found.name, email: found.email, brainType: found.neuroProfile?.brainType || null, overallScore: found.neuroProfile?.overallScore || 0, registeredAt: found.createdAt } });
}));

// POST /enterprise/members/add
router.post('/members/add', asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: 'userId gereklidir' });
  const enterpriseUser = await User.findById(req.user.id);
  const targetUser = await User.findById(userId);
  if (!targetUser) return res.status(404).json({ success: false, message: 'Kullanici bulunamadi' });
  if (String(targetUser._id) === String(req.user.id)) return res.status(400).json({ success: false, message: 'Kendinizi ekleyemezsiniz' });
  if (enterpriseUser.enterpriseMembers.map(String).includes(String(userId))) return res.status(400).json({ success: false, message: 'Bu kullanici zaten panelinizde' });
  await User.findByIdAndUpdate(req.user.id, { $addToSet: { enterpriseMembers: userId } });
  await User.findByIdAndUpdate(userId, { enterpriseId: req.user.id });
  res.json({ success: true, message: `${targetUser.name} panelinize eklendi` });
}));

// DELETE /enterprise/members/:userId
router.delete('/members/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  await User.findByIdAndUpdate(req.user.id, { $pull: { enterpriseMembers: userId } });
  await User.findByIdAndUpdate(userId, { enterpriseId: null });
  res.json({ success: true, message: 'Uye panelden kaldirildi' });
}));

// GET /enterprise/members
router.get('/members', asyncHandler(async (req, res) => {
  const eu = await User.findById(req.user.id).select('enterpriseMembers');
  if (!eu?.enterpriseMembers?.length) return res.json({ success: true, data: [] });
  const members = await User.find({ _id: { $in: eu.enterpriseMembers } }).select('name email neuroProfile gamification dailyCheckin createdAt lastLogin').lean();
  const formatted = members.map((m) => {
    const rc = (m.dailyCheckin || []).slice(-7);
    const avgMood = rc.length ? (rc.reduce((s,c)=>s+c.mood,0)/rc.length).toFixed(1) : null;
    const avgStress = rc.length ? (rc.reduce((s,c)=>s+c.stress,0)/rc.length).toFixed(1) : null;
    return { _id: m._id, name: m.name, email: m.email, brainType: m.neuroProfile?.brainType||null, overallScore: m.neuroProfile?.overallScore||0, energyRhythm: m.neuroProfile?.energyRhythm||null, decisionStyle: m.neuroProfile?.decisionStyle||null, stressResponse: m.neuroProfile?.stressResponse||null, socialPattern: m.neuroProfile?.socialPattern||null, level: m.gamification?.level||1, streak: m.gamification?.streak||0, xp: m.gamification?.xp||0, avgMood, avgStress, checkinCount: (m.dailyCheckin||[]).length, lastCheckin: rc.length?rc[rc.length-1].date:null, registeredAt: m.createdAt, lastLogin: m.lastLogin };
  });
  res.json({ success: true, data: formatted });
}));

// GET /enterprise/dashboard
router.get('/dashboard', asyncHandler(async (req, res) => {
  const eu = await User.findById(req.user.id).select('enterpriseMembers');
  const memberIds = eu?.enterpriseMembers || [];
  const [members, checkinStats] = await Promise.all([
    memberIds.length ? User.find({ _id: { $in: memberIds } }).select('neuroProfile dailyCheckin').lean() : [],
    memberIds.length ? User.aggregate([{ $match: { _id: { $in: memberIds } } },{ $unwind: { path: '$dailyCheckin', preserveNullAndEmptyArrays: false } },{ $group: { _id: null, avgMood: { $avg: '$dailyCheckin.mood' }, avgEnergy: { $avg: '$dailyCheckin.energy' }, avgStress: { $avg: '$dailyCheckin.stress' } } }]) : [],
  ]);
  const brainMap = { analytical: 0, creative: 0, empathetic: 0, strategic: 0 };
  members.forEach((m) => { const bt = m.neuroProfile?.brainType; if (bt && brainMap[bt]!==undefined) brainMap[bt]++; });
  const avgStress = checkinStats[0]?.avgStress || 0;
  const burnoutRisk = avgStress ? Math.min(100, Math.round((avgStress/10)*100)) : 0;
  const teamCompatibility = members.length>1 ? Math.max(60,Math.min(99,100-burnoutRisk*0.3+(brainMap.empathetic)*2)) : 0;
  const productivityScore = checkinStats[0]?.avgEnergy ? Math.min(99,Math.round(checkinStats[0].avgEnergy*10)) : 0;
  res.json({ success: true, data: { totalTeam: memberIds.length, teamCompatibility: Math.round(teamCompatibility), burnoutRisk, productivityScore, brainDistribution: brainMap, checkinStats: checkinStats[0]||{ avgMood:0, avgEnergy:0, avgStress:0 } } });
}));

// POST /enterprise/team-analysis
router.post('/team-analysis', asyncHandler(async (req, res) => {
  const eu = await User.findById(req.user.id).select('enterpriseMembers');
  const memberIds = eu?.enterpriseMembers || [];
  const users = memberIds.length ? await User.find({ _id: { $in: memberIds } }).select('name neuroProfile').lean() : [];
  const brainMap = {};
  users.forEach((u) => { const bt = u.neuroProfile?.brainType; if (bt) brainMap[bt]=(brainMap[bt]||0)+1; });
  res.json({ success: true, data: { teamSize: users.length, overallCompatibility: users.length>1?82:0, brainDistribution: brainMap, recommendations: users.length===0?['Once panele uye ekleyin']:['Analytical ve Empathetic uyeleri isbirligi projelerinde eslestirin','Creative uyelere ozerklik taniyın','Strategic uyeleri liderlik rollerine atayın'] } });
}));

// GET /enterprise/hr-insights
router.get('/hr-insights', asyncHandler(async (req, res) => {
  const eu = await User.findById(req.user.id).select('enterpriseMembers');
  const memberIds = eu?.enterpriseMembers || [];
  if (!memberIds.length) return res.json({ success: true, data: { hiringRecommendations: ['Panele uye ekleyerek HR onerilerini gorun'], retentionRisk: [], teamBalance: {} } });
  const [highStress, brainDist] = await Promise.all([
    User.aggregate([{ $match: { _id: { $in: memberIds } } },{ $unwind: { path: '$dailyCheckin', preserveNullAndEmptyArrays: false } },{ $group: { _id: '$_id', name: { $first: '$name' }, avgStress: { $avg: '$dailyCheckin.stress' } } },{ $match: { avgStress: { $gt: 7 } } }]),
    User.aggregate([{ $match: { _id: { $in: memberIds }, 'neuroProfile.brainType': { $exists: true } } },{ $group: { _id: '$neuroProfile.brainType', count: { $sum: 1 } } }]),
  ]);
  const brainMap = {};
  brainDist.forEach((b) => { brainMap[b._id] = b.count; });
  res.json({ success: true, data: { hiringRecommendations: ['Empatik beyin tipleri musteri hizmetleri icin ideal','Analitik beyin tipleri teknik rollere uygun','Stratejik beyin tipleri liderlik pozisyonlarinda basarili'], retentionRisk: highStress.length>0 ? highStress.map((u)=>`Yuksek stres: ${u.name} (${u.avgStress.toFixed(1)}/10)`) : ['Su an yuksek burnout riski tasiyan uye yok'], teamBalance: brainMap } });
}));

module.exports = router;

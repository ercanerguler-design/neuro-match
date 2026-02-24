const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

// All admin routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));

// ─── GET /admin/stats ────────────────────────────────────────────────────────
router.get('/stats', asyncHandler(async (req, res) => {
  const [
    totalUsers,
    enterpriseUsers,
    activeSubscriptions,
    brainTypeDist,
    recentUsers,
    planDist,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: { $in: ['enterprise', 'admin'] } }),
    User.countDocuments({ 'subscription.status': 'active' }),
    User.aggregate([
      { $match: { 'neuroProfile.brainType': { $exists: true, $ne: null } } },
      { $group: { _id: '$neuroProfile.brainType', count: { $sum: 1 } } },
    ]),
    User.find().sort({ createdAt: -1 }).limit(5).select('name email role subscription.plan createdAt'),
    User.aggregate([
      { $group: { _id: '$subscription.plan', count: { $sum: 1 } } },
    ]),
  ]);

  const brainTypeMap = {};
  brainTypeDist.forEach((b) => { brainTypeMap[b._id] = b.count; });

  const planMap = {};
  planDist.forEach((p) => { planMap[p._id || 'free'] = p.count; });

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      enterpriseUsers,
      activeSubscriptions,
      freeUsers: (planMap['free'] || 0),
      basicUsers: (planMap['basic'] || 0),
      premiumUsers: (planMap['premium'] || 0),
      enterprisePlanUsers: (planMap['enterprise'] || 0),
      brainTypes: {
        analytical: brainTypeMap['analytical'] || 0,
        creative: brainTypeMap['creative'] || 0,
        empathetic: brainTypeMap['empathetic'] || 0,
        strategic: brainTypeMap['strategic'] || 0,
      },
      recentUsers,
    },
  });
}));

// ─── POST /admin/users — Yeni kullanıcı oluştur ─────────────────────────────
router.post('/users', asyncHandler(async (req, res) => {
  const bcrypt = require('bcryptjs');
  const {
    name, email, password = 'Neuro2024!',
    role = 'user', plan = 'free', status = 'inactive',
    endDate, phone, company,
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'İsim ve email zorunludur' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ success: false, error: 'Bu email zaten kayıtlı' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const subscriptionDays = plan === 'enterprise' ? 365 : plan === 'premium' ? 180 : plan === 'basic' ? 30 : 0;
  const calculatedEndDate = endDate
    ? new Date(endDate)
    : subscriptionDays > 0
      ? new Date(Date.now() + subscriptionDays * 24 * 60 * 60 * 1000)
      : null;

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    role,
    phone,
    company,
    isEmailVerified: true,
    isActive: true,
    subscription: {
      plan,
      status: plan !== 'free' ? (status || 'active') : 'inactive',
      startDate: plan !== 'free' ? new Date() : undefined,
      endDate: calculatedEndDate,
    },
  });

  const userObj = user.toObject();
  delete userObj.password;

  res.status(201).json({ success: true, data: userObj, message: `${name} başarıyla oluşturuldu` });
}));

// ─── GET /admin/users ────────────────────────────────────────────────────────
router.get('/users', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '', role = '', plan = '', sort = '-createdAt' } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) query.role = role;
  if (plan) query['subscription.plan'] = plan;

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
}));

// ─── GET /admin/users/:id ────────────────────────────────────────────────────
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
  res.status(200).json({ success: true, data: user });
}));

// ─── PUT /admin/users/:id ────────────────────────────────────────────────────
router.put('/users/:id', asyncHandler(async (req, res) => {
  const { role, plan, status, endDate, isActive, name, phone } = req.body;

  const updateData = {};
  if (role !== undefined) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;

  if (plan !== undefined) updateData['subscription.plan'] = plan;
  if (status !== undefined) updateData['subscription.status'] = status;
  if (endDate !== undefined) updateData['subscription.endDate'] = endDate ? new Date(endDate) : null;
  if (plan && !updateData['subscription.startDate']) {
    updateData['subscription.startDate'] = new Date();
  }

  const user = await User.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true }).select('-password');
  if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });

  res.status(200).json({ success: true, data: user, message: 'Kullanıcı güncellendi' });
}));

// ─── DELETE /admin/users/:id ─────────────────────────────────────────────────
router.delete('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
  if (user.role === 'admin') return res.status(400).json({ success: false, error: 'Admin silinemez' });

  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Kullanıcı silindi' });
}));

// ─── POST /admin/users/:id/extend ────────────────────────────────────────────
router.post('/users/:id/extend', asyncHandler(async (req, res) => {
  const { days = 30 } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });

  const currentEnd = user.subscription?.endDate ? new Date(user.subscription.endDate) : new Date();
  const newEnd = new Date(currentEnd.getTime() + Number(days) * 24 * 60 * 60 * 1000);

  await User.findByIdAndUpdate(req.params.id, {
    $set: {
      'subscription.endDate': newEnd,
      'subscription.status': 'active',
      'subscription.startDate': user.subscription?.startDate || new Date(),
    },
  });

  res.status(200).json({ success: true, message: `Abonelik ${days} gün uzatıldı`, newEndDate: newEnd });
}));

// ─── POST /admin/users/:id/reset-password ────────────────────────────────────
router.post('/users/:id/reset-password', asyncHandler(async (req, res) => {
  const { newPassword = 'Neuro2024!' } = req.body;
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(newPassword, salt);

  await User.findByIdAndUpdate(req.params.id, { password: hashed });
  res.status(200).json({ success: true, message: `Şifre sıfırlandı: ${newPassword}` });
}));

module.exports = router;

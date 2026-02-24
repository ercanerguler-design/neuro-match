const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// POST /api/v1/seed/demo-users — sadece development ortamında
router.post('/demo-users', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ success: false, message: 'Sadece development ortamında çalışır' });
    }

    const existing = await User.countDocuments({ email: { $regex: '@demo.neuromatch' } });
    if (existing >= 8) {
      return res.status(200).json({ success: true, message: 'Demo kullanıcılar zaten mevcut', count: existing });
    }

    // Şifreyi bir kez hash'le (pre-save hook'u atlatmak için direkt collection insert yapıyoruz)
    const hashedPw = await bcrypt.hash('Demo1234!', 10);

    const demos = [
      { name: 'Ayşe Kaya',    email: 'ayse@demo.neuromatch',    brainType: 'creative',   energyRhythm: 'night',    decisionStyle: 'intuitive', stressResponse: 'flight', socialPattern: 'extrovert', score: 82 },
      { name: 'Mehmet Demir', email: 'mehmet@demo.neuromatch',  brainType: 'strategic',  energyRhythm: 'morning',  decisionStyle: 'rational',  stressResponse: 'fight',  socialPattern: 'introvert', score: 78 },
      { name: 'Zeynep Şahin', email: 'zeynep@demo.neuromatch',  brainType: 'empathetic', energyRhythm: 'flexible', decisionStyle: 'emotional', stressResponse: 'freeze', socialPattern: 'ambivert',  score: 88 },
      { name: 'Can Yılmaz',   email: 'can@demo.neuromatch',     brainType: 'analytical', energyRhythm: 'morning',  decisionStyle: 'rational',  stressResponse: 'fight',  socialPattern: 'introvert', score: 91 },
      { name: 'Selin Arslan', email: 'selin@demo.neuromatch',   brainType: 'creative',   energyRhythm: 'afternoon',decisionStyle: 'intuitive', stressResponse: 'flight', socialPattern: 'extrovert', score: 75 },
      { name: 'Emre Çelik',   email: 'emre@demo.neuromatch',    brainType: 'strategic',  energyRhythm: 'morning',  decisionStyle: 'rational',  stressResponse: 'fight',  socialPattern: 'ambivert',  score: 84 },
      { name: 'Nisan Koç',    email: 'nisan@demo.neuromatch',   brainType: 'empathetic', energyRhythm: 'flexible', decisionStyle: 'emotional', stressResponse: 'freeze', socialPattern: 'extrovert', score: 79 },
      { name: 'Burak Öztürk', email: 'burak@demo.neuromatch',   brainType: 'analytical', energyRhythm: 'night',    decisionStyle: 'rational',  stressResponse: 'fight',  socialPattern: 'introvert', score: 86 },
    ];

    const docs = demos.map((d) => ({
      name: d.name,
      email: d.email,
      password: hashedPw,
      isEmailVerified: true,
      isActive: true,
      role: 'user',
      subscription: { plan: 'free', status: 'active' },
      neuroProfile: {
        brainType: d.brainType,
        energyRhythm: d.energyRhythm,
        decisionStyle: d.decisionStyle,
        stressResponse: d.stressResponse,
        socialPattern: d.socialPattern,
        overallScore: d.score,
        lastUpdated: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Pre-save hook'unu atlatmak için mongoose yerine direkt collection kullan
    const result = await User.collection.insertMany(docs, { ordered: false });

    res.status(201).json({
      success: true,
      message: `${result.insertedCount} demo kullanıcı oluşturuldu`,
      users: demos.map((d) => d.name),
    });
  } catch (err) {
    // Duplicate key errors (zaten var) durumunu yakala
    if (err.code === 11000) {
      return res.status(200).json({ success: true, message: 'Demo kullanıcılar zaten mevcut' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB bağlandı');

    const existing = await User.countDocuments({ email: { $regex: '@demo.x-neu' } });
    if (existing >= 8) {
      console.log('Demo kullanıcılar zaten mevcut:', existing);
      return process.exit(0);
    }

    const pw = await bcrypt.hash('Demo1234!', 10);

    const demos = [
      { name: 'Ayşe Kaya',    email: 'ayse@demo.x-neu',    brainType: 'creative',   score: 82 },
      { name: 'Mehmet Demir', email: 'mehmet@demo.x-neu',  brainType: 'strategic',  score: 78 },
      { name: 'Zeynep Şahin', email: 'zeynep@demo.x-neu',  brainType: 'empathetic', score: 88 },
      { name: 'Can Yılmaz',   email: 'can@demo.x-neu',     brainType: 'analytical', score: 91 },
      { name: 'Selin Arslan', email: 'selin@demo.x-neu',   brainType: 'creative',   score: 75 },
      { name: 'Emre Çelik',   email: 'emre@demo.x-neu',    brainType: 'strategic',  score: 84 },
      { name: 'Nisan Koç',    email: 'nisan@demo.x-neu',   brainType: 'empathetic', score: 79 },
      { name: 'Burak Öztürk', email: 'burak@demo.x-neu',   brainType: 'analytical', score: 86 },
    ];

    await User.collection.insertMany(demos.map((d) => ({
      name: d.name,
      email: d.email,
      password: pw,
      isEmailVerified: true,
      isActive: true,
      role: 'user',
      subscription: { plan: 'free', status: 'active' },
      neuroProfile: {
        brainType: d.brainType,
        energyRhythm: 'morning',
        decisionStyle: 'rational',
        stressResponse: 'fight',
        socialPattern: 'ambivert',
        overallScore: d.score,
        lastUpdated: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })));

    console.log('✅ 8 demo kullanıcı başarıyla eklendi!');
    process.exit(0);
  } catch (err) {
    if (err.code === 11000) {
      console.log('✅ Bazı demo kullanıcılar zaten mevcut (duplicate key), tamam.');
      process.exit(0);
    }
    console.error('Hata:', err.message);
    process.exit(1);
  }
})();

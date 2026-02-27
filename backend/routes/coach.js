const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const neuroAI = require('../ai/neuroAI');
const User = require('../models/User');
const logger = require('../utils/logger');

router.use(protect);

// Get daily coach message
router.get('/daily', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const latestCheckin = user.dailyCheckin[user.dailyCheckin.length - 1];

  const context = {
    name: user.name,
    mood: latestCheckin?.mood || 7,
    energy: latestCheckin?.energy || 7,
    stress: latestCheckin?.stress || 4,
  };

  const message = await neuroAI.getDailyCoachMessage(user.neuroProfile || {}, context);
  res.status(200).json({ success: true, data: { message, generatedAt: new Date() } });
}));

// Ask coach a question
router.post('/ask', asyncHandler(async (req, res) => {
  const { question } = req.body;
  const user = await User.findById(req.user.id);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.startsWith('sk-your')) {
    return res.status(200).json({ success: true, data: { answer: 'OpenAI API anahtarı henüz ayarlanmadı. Lütfen backend/.env dosyasına geçerli OPENAI_API_KEY ekleyin.' } });
  }
  const OpenAI = require('openai');
  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Sen X-Neu'nun kişisel AI koçusun. Kullanıcının beyin tipi: ${user.neuroProfile?.brainType || 'bilinmiyor'}. Bu profile göre kişiselleştirilmiş, bilimsel temelli ve motive edici cevaplar ver. Türkçe cevapla.`,
      },
      { role: 'user', content: question },
    ],
    temperature: 0.8,
    max_tokens: 500,
  });

  res.status(200).json({ success: true, data: { answer: response.choices[0].message.content } });
}));

// Get weekly insights
router.get('/weekly-insights', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const weeklyCheckins = user.dailyCheckin.slice(-7);
  const weeklySleep = user.sleepData.slice(-7);

  const avgMood = weeklyCheckins.length ? (weeklyCheckins.reduce((s, c) => s + c.mood, 0) / weeklyCheckins.length).toFixed(1) : 0;
  const avgEnergy = weeklyCheckins.length ? (weeklyCheckins.reduce((s, c) => s + c.energy, 0) / weeklyCheckins.length).toFixed(1) : 0;
  const avgSleep = weeklySleep.length ? (weeklySleep.reduce((s, c) => s + c.duration, 0) / weeklySleep.length).toFixed(1) : 0;

  res.status(200).json({
    success: true,
    data: {
      weekSummary: { avgMood, avgEnergy, avgSleep },
      trends: { moodTrend: avgMood > 6 ? 'improving' : 'needs-attention', energyTrend: avgEnergy > 6 ? 'good' : 'low' },
      checkinsData: weeklyCheckins,
    },
  });
}));

module.exports = router;

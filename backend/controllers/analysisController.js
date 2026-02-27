const Analysis = require('../models/Analysis');
const User = require('../models/User');
const Report = require('../models/Report');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const neuroAI = require('../ai/neuroAI');
const logger = require('../utils/logger');
const { awardXP, awardBadge } = require('../utils/gamification');

// @desc    Start questionnaire analysis
// @route   POST /api/v1/analysis/questionnaire
// @access  Private
exports.submitQuestionnaire = asyncHandler(async (req, res, next) => {
  const { answers } = req.body;

  if (!answers || answers.length < 20) {
    return next(new ErrorResponse('En az 20 soru cevaplanmalıdır', 400));
  }

  const analysis = await Analysis.create({
    user: req.user.id,
    type: 'questionnaire',
    status: 'processing',
    questionnaire: { answers, completedAt: new Date() },
  });

  // Process AI analysis async
  processAnalysis(analysis._id, req.user.id, 'questionnaire', { answers });

  res.status(201).json({
    success: true,
    message: 'Analiz başlatıldı. Sonuçlar hazırlanıyor...',
    analysisId: analysis._id,
  });
});

// @desc    Get analysis status
// @route   GET /api/v1/analysis/:id
// @access  Private
exports.getAnalysis = asyncHandler(async (req, res, next) => {
  const analysis = await Analysis.findById(req.params.id);
  if (!analysis) return next(new ErrorResponse('Analiz bulunamadı', 404));
  if (analysis.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Bu analize erişim yetkiniz yok', 403));
  }
  res.status(200).json({ success: true, data: analysis });
});

// @desc    Get all analyses for user
// @route   GET /api/v1/analysis
// @access  Private
exports.getUserAnalyses = asyncHandler(async (req, res, next) => {
  const analyses = await Analysis.find({ user: req.user.id }).sort('-createdAt').limit(10);
  res.status(200).json({ success: true, count: analyses.length, data: analyses });
});

// @desc    Submit voice analysis
// @route   POST /api/v1/analysis/voice
// @access  Private (Premium)
exports.submitVoiceAnalysis = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ErrorResponse('Ses dosyası gereklidir', 400));
  if (req.user.subscription.plan === 'free') {
    return next(new ErrorResponse('Bu özellik premium üyelere özeldir', 402));
  }

  const analysis = await Analysis.create({
    user: req.user.id,
    type: 'voice',
    status: 'processing',
    voiceAnalysis: { audioFile: req.file.path, duration: req.body.duration },
  });

  processAnalysis(analysis._id, req.user.id, 'voice', { audioFile: req.file.path });

  res.status(201).json({ success: true, message: 'Ses analizi başlatıldı', analysisId: analysis._id });
});

// @desc    Submit facial analysis
// @route   POST /api/v1/analysis/facial
// @access  Private (Premium)
exports.submitFacialAnalysis = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new ErrorResponse('Yüz fotoğrafı gereklidir', 400));
  if (req.user.subscription.plan === 'free') {
    return next(new ErrorResponse('Bu özellik premium üyelere özeldir', 402));
  }

  const analysis = await Analysis.create({
    user: req.user.id,
    type: 'facial',
    status: 'processing',
    facialAnalysis: { imageFile: req.file.path },
  });

  processAnalysis(analysis._id, req.user.id, 'facial', { imageFile: req.file.path });

  res.status(201).json({ success: true, message: 'Yüz analizi başlatıldı', analysisId: analysis._id });
});

// @desc    Get comprehensive neuro report
// @route   POST /api/v1/analysis/comprehensive
// @access  Private (Premium)
exports.getComprehensiveAnalysis = asyncHandler(async (req, res, next) => {
  if (req.user.subscription.plan === 'free') {
    return next(new ErrorResponse('Kapsamlı analiz premium üyelere özeldir', 402));
  }

  const recentAnalyses = await Analysis.find({
    user: req.user.id,
    status: 'completed',
  }).sort('-createdAt').limit(5);

  if (recentAnalyses.length === 0) {
    return next(new ErrorResponse('Önce temel analizi tamamlayın', 400));
  }

  const analysis = await Analysis.create({
    user: req.user.id,
    type: 'comprehensive',
    status: 'processing',
  });

  processAnalysis(analysis._id, req.user.id, 'comprehensive', {
    previousAnalyses: recentAnalyses,
  });

  res.status(201).json({ success: true, message: 'Kapsamlı analiz başlatıldı', analysisId: analysis._id });
});

// Background processing
const processAnalysis = async (analysisId, userId, type, data) => {
  const startTime = Date.now();
  try {
    const aiResult = await neuroAI.analyze(type, data);

    await Analysis.findByIdAndUpdate(analysisId, {
      status: 'completed',
      aiResults: aiResult,
      processingTime: Date.now() - startTime,
    });

    // Update user's neuro profile
    await User.findByIdAndUpdate(userId, {
      neuroProfile: {
        brainType: aiResult.brainType,
        energyRhythm: aiResult.energyRhythm,
        decisionStyle: aiResult.decisionStyle,
        stressResponse: aiResult.stressResponse,
        socialPattern: aiResult.socialPattern,
        overallScore: aiResult.overallScore,
        lastUpdated: new Date(),
      },
    });

    // Auto-generate report
    await Report.create({
      user: userId,
      analysis: analysisId,
      type: 'comprehensive',
      title: `Nöro Profil Raporu - ${new Date().toLocaleDateString('tr-TR')}`,
      sections: [
        { title: 'Beyin Tipi', icon: '🧠', content: aiResult.brainTypeDescription, score: aiResult.overallScore },
        { title: 'Güçlü Yönler', icon: '💪', content: aiResult.strengths?.join(', '), recommendations: aiResult.dailyRecommendations },
        { title: 'Kariyer Uyumu', icon: '🎯', content: aiResult.careerMatches?.join(', ') },
        { title: 'İlişki İçgörüleri', icon: '💑', content: aiResult.relationshipInsights },
      ],
      summary: aiResult.brainTypeDescription,
      overallScore: aiResult.overallScore,
    });

    // Gamification: award XP and badges
    const analyses = await Analysis.countDocuments({ user: userId, status: 'completed' });
    const isFirstAnalysis = analyses === 1;
    await awardXP(userId, isFirstAnalysis ? 200 : 100, 'analysis-completed');
    if (isFirstAnalysis) await awardBadge(userId, 'first_analysis');
    if (aiResult.overallScore >= 90) await awardBadge(userId, 'perfect_score');
    const reportCount = await Report.countDocuments({ user: userId });
    if (reportCount >= 5) await awardBadge(userId, 'five_reports');

    logger.info(`Analysis ${analysisId} completed in ${Date.now() - startTime}ms`);
  } catch (error) {
    await Analysis.findByIdAndUpdate(analysisId, { status: 'failed' });
    logger.error(`Analysis ${analysisId} failed: ${error.message}`);
  }
};

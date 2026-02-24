const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['questionnaire', 'voice', 'facial', 'behavioral', 'sleep', 'comprehensive'],
      required: true,
    },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },

    // Questionnaire data
    questionnaire: {
      answers: [
        {
          questionId: String,
          category: String,
          answer: mongoose.Schema.Types.Mixed,
        },
      ],
      completedAt: Date,
    },

    // Voice analysis data
    voiceAnalysis: {
      audioFile: String,
      duration: Number,
      results: {
        stressLevel: Number,
        emotionalState: String,
        confidence: Number,
        speechRate: Number,
        pitchVariation: Number,
        energyLevel: Number,
      },
    },

    // Facial analysis data
    facialAnalysis: {
      imageFile: String,
      results: {
        dominantEmotion: String,
        emotions: {
          happy: Number,
          sad: Number,
          angry: Number,
          fearful: Number,
          disgusted: Number,
          surprised: Number,
          neutral: Number,
        },
        attentionScore: Number,
        fatigueLevel: Number,
      },
    },

    // AI Results
    aiResults: {
      brainType: String,
      brainTypeDescription: String,
      energyRhythm: String,
      decisionStyle: String,
      stressResponse: String,
      socialPattern: String,
      strengths: [String],
      weaknesses: [String],
      opportunities: [String],
      threats: [String],
      overallScore: Number,
      compatibilityFactors: [String],
      dailyRecommendations: [String],
      careerMatches: [String],
      relationshipInsights: String,
      rawResponse: String,
    },

    processingTime: Number,
    version: { type: String, default: '1.0' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analysis', AnalysisSchema);

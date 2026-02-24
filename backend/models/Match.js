const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    target: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['personal', 'professional', 'romantic', 'friendship'], required: true },

    compatibilityScore: { type: Number, min: 0, max: 100 },

    breakdown: {
      brainTypeCompatibility: Number,
      communicationCompatibility: Number,
      energyCompatibility: Number,
      valuesCompatibility: Number,
      decisionCompatibility: Number,
      socialCompatibility: Number,
    },

    insights: {
      strengths: [String],
      challenges: [String],
      tips: [String],
      longTermOutlook: String,
    },

    status: { type: String, enum: ['pending', 'completed', 'expired'], default: 'pending' },
    isAnonymous: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Match', MatchSchema);

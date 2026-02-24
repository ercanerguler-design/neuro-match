const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    analysis: { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis' },
    type: { type: String, enum: ['personal', 'career', 'relationship', 'comprehensive', 'daily'], required: true },
    title: { type: String, required: true },

    sections: [
      {
        title: String,
        icon: String,
        content: String,
        score: Number,
        recommendations: [String],
      },
    ],

    summary: { type: String },
    overallScore: { type: Number, min: 0, max: 100 },

    // Career specific
    careerReport: {
      bestRoles: [String],
      avoidRoles: [String],
      workEnvironment: String,
      leadershipStyle: String,
      teamRole: String,
      productivityPeak: String,
    },

    // Relationship specific
    relationshipReport: {
      attachmentStyle: String,
      communicationStyle: String,
      loveLanguage: String,
      conflictResolution: String,
      idealPartnerTraits: [String],
    },

    isPremium: { type: Boolean, default: false },
    downloadCount: { type: Number, default: 0 },
    shareToken: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', ReportSchema);

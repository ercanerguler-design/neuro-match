const mongoose = require('mongoose');

const CommunityPostSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      enum: ['analytical', 'creative', 'empathetic', 'strategic'],
      required: true,
      index: true,
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorBrain: { type: String, default: 'analytical' },
    content: { type: String, required: true, maxlength: 1000 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CommunityPostSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);

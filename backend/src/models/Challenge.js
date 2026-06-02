const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  initiatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['quiz', 'study-session', 'points'],
    default: 'quiz'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'declined'],
    default: 'pending'
  },
  reward: {
    type: Number,
    default: 100
  },
  initiatorScore: {
    type: Number,
    default: 0
  },
  targetScore: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  completedAt: Date
});

challengeSchema.index({ initiatorId: 1, status: 1 });
challengeSchema.index({ targetId: 1, status: 1 });
challengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Challenge', challengeSchema);

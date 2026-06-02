const mongoose = require('mongoose');

const dailyBonusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claimedAt: {
    type: Date,
    default: Date.now
  },
  amount: {
    type: Number,
    default: 50
  },
  streak: {
    type: Number,
    default: 1
  }
});

// TTL index: auto-delete records older than 90 days
dailyBonusSchema.index({ claimedAt: 1 }, { expireAfterSeconds: 7776000 });
dailyBonusSchema.index({ userId: 1, claimedAt: -1 });

module.exports = mongoose.model('DailyBonus', dailyBonusSchema);

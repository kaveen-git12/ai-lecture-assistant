const mongoose = require('mongoose');

const gamificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Points system
  totalPoints: {
    type: Number,
    default: 0
  },
  pointsHistory: [{
    date: Date,
    points: Number,
    action: String, // 'quiz-correct', 'lecture-complete', 'streak', etc.
    description: String
  }],
  
  // Badges & Achievements
  achievements: [{
    achievementId: String,
    name: String,
    description: String,
    icon: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common'
    }
  }],
  
  // Badges
  badges: [{
    badgeId: String,
    name: String,
    tier: Number, // 1-5
    icon: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  
  // Streaks
  currentStreak: {
    count: Number,
    startDate: Date,
    lastActivityDate: Date
  },
  longestStreak: {
    count: Number,
    startDate: Date,
    endDate: Date
  },
  streakHistory: [{
    count: Number,
    startDate: Date,
    endDate: Date
  }],
  
  // Leaderboard position
  leaderboardStats: {
    globalRank: Number,
    globalPercentile: Number,
    classRank: Number,
    classPercentile: Number,
    classId: mongoose.Schema.Types.ObjectId
  },
  
  // Challenges
  activeChallenges: [{
    challengeId: String,
    name: String,
    objective: String,
    progress: Number, // 0-100
    target: Number,
    reward: Number,
    startDate: Date,
    endsAt: Date
  }],
  
  completedChallenges: [{
    challengeId: String,
    completedAt: Date,
    reward: Number
  }],
  
  // Levels
  level: {
    type: Number,
    default: 1
  },
  experiencePoints: {
    type: Number,
    default: 0
  },
  experienceToNextLevel: {
    type: Number,
    default: 1000
  },
  
  // Multipliers
  currentMultiplier: {
    type: Number,
    default: 1.0,
    min: 1.0,
    max: 5.0
  },
  
  // Statistics
  totalLecturesCompleted: {
    type: Number,
    default: 0
  },
  totalQuizzesPassed: {
    type: Number,
    default: 0
  },
  perfectScores: {
    type: Number,
    default: 0
  },
  
  // Preferences
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['instant', 'hourly', 'daily', 'weekly'],
      default: 'daily'
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

gamificationSchema.index({ userId: 1 });
gamificationSchema.index({ totalPoints: -1 }); // For leaderboards
gamificationSchema.index({ level: -1 });

module.exports = mongoose.model('Gamification', gamificationSchema);

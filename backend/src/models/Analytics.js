const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture'
  },
  // Learning metrics
  totalStudyMinutes: {
    type: Number,
    default: 0
  },
  sessionsCompleted: {
    type: Number,
    default: 0
  },
  averageSessionDuration: {
    type: Number, // in minutes
    default: 0
  },
  
  // Performance metrics
  quizzesAttempted: {
    type: Number,
    default: 0
  },
  quizzesCorrect: {
    type: Number,
    default: 0
  },
  averageAccuracy: {
    type: Number, // percentage 0-100
    default: 0
  },
  
  // Retention curve (Ebbinghaus)
  retentionCurve: [{
    daysAfterLearning: Number,
    retentionRate: Number // 0-100
  }],
  
  // Weak topics
  weakTopics: [{
    topic: String,
    errorCount: Number,
    lastAttempted: Date
  }],
  
  // Strong topics
  strongTopics: [{
    topic: String,
    masteryLevel: Number, // 0-100
    lastPracticed: Date
  }],
  
  // Time-based analytics
  studyPatterns: {
    mostProductiveHour: Number, // 0-23
    averageWeeklyHours: Number,
    consistencyScore: Number, // 0-100 based on regularity
    sessionsPerWeek: [Number] // Last 4 weeks
  },
  
  // Learning velocity
  learningCurve: [{
    date: Date,
    accuracyChange: Number,
    speedImprovement: Number
  }],
  
  // Comparative metrics
  benchmarkedAgainstClass: {
    userRank: Number,
    classAverage: Number,
    userPercentile: Number
  },
  
  // Export data
  exportedAt: Date,
  lastCalculatedAt: {
    type: Date,
    default: Date.now
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

// Index for quick lookups
analyticsSchema.index({ userId: 1 });
analyticsSchema.index({ lectureId: 1, userId: 1 });
analyticsSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);

const Analytics = require('../models/Analytics');
const Lecture = require('../models/Lecture');
const StudySession = require('../models/StudySession');
const Note = require('../models/Note');

// Ebbinghaus retention curve calculation
function calculateRetentionCurve(userId, lectureId) {
  const curve = [];
  const retentionValues = [100, 88, 66, 45, 34, 28, 25, 24];
  
  for (let day = 0; day <= 30; day++) {
    let retention = 100;
    if (day < retentionValues.length) {
      retention = retentionValues[day];
    } else {
      // After day 7, retention stabilizes around 25%
      retention = 25 + (Math.random() * 5);
    }
    curve.push({
      daysAfterLearning: day,
      retentionRate: Math.round(retention)
    });
  }
  
  return curve;
}

// Calculate learning curve (accuracy improvement over time)
async function calculateLearningCurve(userId, lectureId) {
  const sessions = await StudySession.find({ 
    userId, 
    lectureId,
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  }).sort({ createdAt: 1 });
  
  return sessions.map(session => ({
    date: session.createdAt,
    accuracyChange: session.retentionRate || 0,
    speedImprovement: session.duration ? 100 / session.duration : 0
  }));
}

// Identify weak topics from quiz/flashcard performance
async function extractWeakTopics(userId, lectureId) {
  const notes = await Note.findOne({ userId, lectureId });
  
  if (!notes || !notes.quiz) return [];
  
  const weakTopics = {};
  
  notes.quiz.forEach(q => {
    const topic = q.topic || 'General';
    if (!weakTopics[topic]) {
      weakTopics[topic] = { errorCount: 0, attempts: 0 };
    }
    weakTopics[topic].attempts++;
    if (!q.userAnswer || q.userAnswer !== q.correctAnswer) {
      weakTopics[topic].errorCount++;
    }
  });
  
  return Object.entries(weakTopics)
    .filter(([_, stats]) => stats.errorCount / stats.attempts > 0.3)
    .map(([topic, stats]) => ({
      topic,
      errorCount: stats.errorCount,
      lastAttempted: new Date()
    }))
    .sort((a, b) => b.errorCount - a.errorCount);
}

// Identify strong topics
async function extractStrongTopics(userId, lectureId) {
  const notes = await Note.findOne({ userId, lectureId });
  
  if (!notes || !notes.quiz) return [];
  
  const strongTopics = {};
  
  notes.quiz.forEach(q => {
    const topic = q.topic || 'General';
    if (!strongTopics[topic]) {
      strongTopics[topic] = { correct: 0, total: 0 };
    }
    strongTopics[topic].total++;
    if (q.userAnswer === q.correctAnswer) {
      strongTopics[topic].correct++;
    }
  });
  
  return Object.entries(strongTopics)
    .filter(([_, stats]) => stats.correct / stats.total > 0.8)
    .map(([topic, stats]) => ({
      topic,
      masteryLevel: Math.round((stats.correct / stats.total) * 100),
      lastPracticed: new Date()
    }))
    .sort((a, b) => b.masteryLevel - a.masteryLevel);
}

// Calculate study patterns
async function calculateStudyPatterns(userId) {
  const sessions = await StudySession.find({ userId }).sort({ createdAt: 1 });
  
  if (sessions.length === 0) {
    return {
      mostProductiveHour: 14,
      averageWeeklyHours: 0,
      consistencyScore: 0,
      sessionsPerWeek: [0, 0, 0, 0]
    };
  }
  
  // Calculate most productive hour
  const hourCounts = new Array(24).fill(0);
  sessions.forEach(session => {
    const hour = new Date(session.createdAt).getHours();
    hourCounts[hour]++;
  });
  const mostProductiveHour = hourCounts.indexOf(Math.max(...hourCounts));
  
  // Calculate average weekly hours
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const weeksSinceFirst = Math.max(1, 
    (Date.now() - sessions[0].createdAt) / (7 * 24 * 60 * 60 * 1000)
  );
  const averageWeeklyHours = totalMinutes / 60 / weeksSinceFirst;
  
  // Calculate consistency score (regularity)
  const dayMap = {};
  sessions.forEach(session => {
    const day = new Date(session.createdAt).toDateString();
    dayMap[day] = (dayMap[day] || 0) + 1;
  });
  const uniqueDays = Object.keys(dayMap).length;
  const consistencyScore = Math.min(100, (uniqueDays / 30) * 100);
  
  // Sessions per week (last 4 weeks)
  const sessionsPerWeek = [];
  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
    const count = sessions.filter(s => s.createdAt >= weekStart && s.createdAt <= weekEnd).length;
    sessionsPerWeek.unshift(count);
  }
  
  return {
    mostProductiveHour,
    averageWeeklyHours: Math.round(averageWeeklyHours * 10) / 10,
    consistencyScore: Math.round(consistencyScore),
    sessionsPerWeek
  };
}

// Calculate performance metrics
async function calculatePerformanceMetrics(userId, lectureId) {
  const sessions = await StudySession.find({ userId, lectureId });
  
  if (sessions.length === 0) {
    return {
      quizzesAttempted: 0,
      quizzesCorrect: 0,
      averageAccuracy: 0
    };
  }
  
  const notes = await Note.findOne({ userId, lectureId });
  const quizzesAttempted = notes?.quiz?.length || 0;
  
  let quizzesCorrect = 0;
  if (notes && notes.quiz) {
    quizzesCorrect = notes.quiz.filter(q => q.userAnswer === q.correctAnswer).length;
  }
  
  const averageAccuracy = quizzesAttempted > 0 
    ? Math.round((quizzesCorrect / quizzesAttempted) * 100)
    : 0;
  
  return {
    quizzesAttempted,
    quizzesCorrect,
    averageAccuracy
  };
}

// Update overall analytics
async function updateAnalytics(userId, lectureId) {
  try {
    let analytics = await Analytics.findOne({ userId, lectureId });
    
    if (!analytics) {
      analytics = new Analytics({ userId, lectureId });
    }
    
    // Get study sessions
    const sessions = await StudySession.find({ userId, lectureId });
    analytics.totalStudyMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    analytics.sessionsCompleted = sessions.length;
    analytics.averageSessionDuration = sessions.length > 0 
      ? analytics.totalStudyMinutes / sessions.length 
      : 0;
    
    // Performance metrics
    const perfMetrics = await calculatePerformanceMetrics(userId, lectureId);
    analytics.quizzesAttempted = perfMetrics.quizzesAttempted;
    analytics.quizzesCorrect = perfMetrics.quizzesCorrect;
    analytics.averageAccuracy = perfMetrics.averageAccuracy;
    
    // Retention curve
    analytics.retentionCurve = calculateRetentionCurve(userId, lectureId);
    
    // Weak and strong topics
    analytics.weakTopics = await extractWeakTopics(userId, lectureId);
    analytics.strongTopics = await extractStrongTopics(userId, lectureId);
    
    // Study patterns
    analytics.studyPatterns = await calculateStudyPatterns(userId);
    
    // Learning curve
    analytics.learningCurve = await calculateLearningCurve(userId, lectureId);
    
    analytics.lastCalculatedAt = new Date();
    await analytics.save();
    
    return analytics;
  } catch (error) {
    console.error('Error updating analytics:', error);
    throw error;
  }
}

// Get analytics summary
async function getAnalyticsSummary(userId, lectureId) {
  try {
    const analytics = await updateAnalytics(userId, lectureId);
    return {
      studyMetrics: {
        totalMinutes: analytics.totalStudyMinutes,
        sessions: analytics.sessionsCompleted,
        averageSessionLength: Math.round(analytics.averageSessionDuration)
      },
      performance: {
        quizzesAttempted: analytics.quizzesAttempted,
        accuracy: analytics.averageAccuracy,
        correctAnswers: analytics.quizzesCorrect
      },
      weakAreas: analytics.weakTopics.slice(0, 5),
      strongAreas: analytics.strongTopics.slice(0, 5),
      patterns: analytics.studyPatterns,
      retentionCurve: analytics.retentionCurve
    };
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    throw error;
  }
}

module.exports = {
  calculateRetentionCurve,
  calculateLearningCurve,
  extractWeakTopics,
  extractStrongTopics,
  calculateStudyPatterns,
  calculatePerformanceMetrics,
  updateAnalytics,
  getAnalyticsSummary
};

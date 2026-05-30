const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const authMiddleware = require('../utils/auth').authMiddleware;
const { 
  updateAnalytics, 
  getAnalyticsSummary,
  calculatePerformanceMetrics,
  extractWeakTopics,
  extractStrongTopics
} = require('../utils/analyticsEngine');

// Get analytics for a lecture
router.get('/lecture/:lectureId', authMiddleware, async (req, res) => {
  try {
    const { lectureId } = req.params;
    const userId = req.userId;
    
    const summary = await getAnalyticsSummary(userId, lectureId);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all analytics for user
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    const analytics = await Analytics.find({ userId }).sort({ updatedAt: -1 });
    
    const summary = analytics.map(a => ({
      lectureId: a.lectureId,
      studyMinutes: a.totalStudyMinutes,
      sessions: a.sessionsCompleted,
      accuracy: a.averageAccuracy,
      strongTopics: a.strongTopics.length,
      weakTopics: a.weakTopics.length
    }));
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get retention curve for lecture
router.get('/retention/:lectureId', authMiddleware, async (req, res) => {
  try {
    const { lectureId } = req.params;
    const userId = req.userId;
    
    const analytics = await Analytics.findOne({ userId, lectureId });
    
    if (!analytics) {
      return res.status(404).json({ error: 'Analytics not found' });
    }
    
    res.json({
      lectureId,
      retentionCurve: analytics.retentionCurve,
      lastUpdated: analytics.lastCalculatedAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get learning curve (accuracy improvement over time)
router.get('/learning-curve/:lectureId', authMiddleware, async (req, res) => {
  try {
    const { lectureId } = req.params;
    const userId = req.userId;
    
    const analytics = await Analytics.findOne({ userId, lectureId });
    
    if (!analytics) {
      return res.status(404).json({ error: 'Analytics not found' });
    }
    
    res.json({
      lectureId,
      learningCurve: analytics.learningCurve
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get weak topics
router.get('/weak-topics/:lectureId', authMiddleware, async (req, res) => {
  try {
    const { lectureId } = req.params;
    const userId = req.userId;
    
    const weakTopics = await extractWeakTopics(userId, lectureId);
    
    res.json({
      lectureId,
      weakTopics,
      recommendations: weakTopics.map(t => ({
        topic: t.topic,
        suggestion: `Focus on ${t.topic} - You've made ${t.errorCount} errors. Consider reviewing this topic.`
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get strong topics
router.get('/strong-topics/:lectureId', authMiddleware, async (req, res) => {
  try {
    const { lectureId } = req.params;
    const userId = req.userId;
    
    const strongTopics = await extractStrongTopics(userId, lectureId);
    
    res.json({
      lectureId,
      strongTopics,
      achievements: strongTopics.map(t => ({
        topic: t.topic,
        masteryLevel: t.masteryLevel,
        badge: `${t.topic} Master`
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get study patterns
router.get('/patterns', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    const analytics = await Analytics.find({ userId });
    
    if (analytics.length === 0) {
      return res.json({
        patterns: null,
        message: 'No study data yet'
      });
    }
    
    const mergedPatterns = {
      mostProductiveHour: null,
      averageWeeklyHours: 0,
      totalSessions: 0,
      totalMinutes: 0
    };
    
    analytics.forEach(a => {
      mergedPatterns.averageWeeklyHours += a.studyPatterns.averageWeeklyHours || 0;
      mergedPatterns.totalSessions += a.sessionsCompleted || 0;
      mergedPatterns.totalMinutes += a.totalStudyMinutes || 0;
      
      if (a.studyPatterns.mostProductiveHour && !mergedPatterns.mostProductiveHour) {
        mergedPatterns.mostProductiveHour = a.studyPatterns.mostProductiveHour;
      }
    });
    
    mergedPatterns.averageWeeklyHours = Math.round(mergedPatterns.averageWeeklyHours / analytics.length * 10) / 10;
    
    res.json(mergedPatterns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get performance metrics
router.get('/performance/:lectureId', authMiddleware, async (req, res) => {
  try {
    const { lectureId } = req.params;
    const userId = req.userId;
    
    const metrics = await calculatePerformanceMetrics(userId, lectureId);
    
    res.json({
      lectureId,
      ...metrics,
      passRate: metrics.quizzesAttempted > 0 
        ? Math.round((metrics.quizzesCorrect / metrics.quizzesAttempted) * 100)
        : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard overview
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    const analytics = await Analytics.find({ userId });
    
    const dashboard = {
      totalStudyTime: 0,
      totalLectures: analytics.length,
      averageAccuracy: 0,
      totalSessions: 0,
      topWeakAreas: [],
      topStrengths: []
    };
    
    let totalAccuracy = 0;
    
    analytics.forEach(a => {
      dashboard.totalStudyTime += a.totalStudyMinutes || 0;
      dashboard.totalSessions += a.sessionsCompleted || 0;
      totalAccuracy += a.averageAccuracy || 0;
      
      dashboard.topWeakAreas.push(...a.weakTopics.slice(0, 2));
      dashboard.topStrengths.push(...a.strongTopics.slice(0, 2));
    });
    
    dashboard.averageAccuracy = Math.round(totalAccuracy / Math.max(analytics.length, 1));
    dashboard.topWeakAreas = dashboard.topWeakAreas.slice(0, 5);
    dashboard.topStrengths = dashboard.topStrengths.slice(0, 5);
    
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export analytics as CSV
router.get('/export/:lectureId', authMiddleware, async (req, res) => {
  try {
    const { lectureId } = req.params;
    const userId = req.userId;
    
    const analytics = await Analytics.findOne({ userId, lectureId });
    
    if (!analytics) {
      return res.status(404).json({ error: 'Analytics not found' });
    }
    
    let csv = 'Analytics Export\n\n';
    csv += 'Study Metrics\n';
    csv += `Total Study Time (minutes),${analytics.totalStudyMinutes}\n`;
    csv += `Sessions Completed,${analytics.sessionsCompleted}\n`;
    csv += `Average Session Duration (minutes),${Math.round(analytics.averageSessionDuration)}\n\n`;
    
    csv += 'Performance Metrics\n';
    csv += `Quizzes Attempted,${analytics.quizzesAttempted}\n`;
    csv += `Correct Answers,${analytics.quizzesCorrect}\n`;
    csv += `Average Accuracy (%),${analytics.averageAccuracy}\n\n`;
    
    csv += 'Weak Topics\n';
    analytics.weakTopics.forEach(t => {
      csv += `${t.topic},${t.errorCount} errors\n`;
    });
    
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="analytics-${lectureId}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

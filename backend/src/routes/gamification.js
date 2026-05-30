const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/auth').authMiddleware;
const {
  awardPoints,
  unlockAchievement,
  awardBadge,
  updateStreak,
  getLeaderboard,
  getUserRank,
  completeChallenge,
  getGamificationStatus,
  ACHIEVEMENTS
} = require('../utils/gamificationEngine');
const Gamification = require('../models/Gamification');

// Get user's gamification status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const status = await getGamificationStatus(userId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Award points (triggered by various actions)
router.post('/award-points', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { points, action, description } = req.body;
    
    if (!points || !action) {
      return res.status(400).json({ error: 'Missing points or action' });
    }
    
    const result = await awardPoints(userId, points, action, description);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unlock achievement
router.post('/unlock-achievement', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { achievementId } = req.body;
    
    if (!achievementId) {
      return res.status(400).json({ error: 'Missing achievementId' });
    }
    
    const result = await unlockAchievement(userId, achievementId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all achievements
router.get('/achievements', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const gamification = await Gamification.findOne({ userId });
    
    if (!gamification) {
      return res.json({
        unlocked: [],
        available: Object.entries(ACHIEVEMENTS).map(([id, ach]) => ({
          id,
          ...ach
        }))
      });
    }
    
    const unlockedIds = gamification.achievements.map(a => a.achievementId);
    
    res.json({
      unlocked: gamification.achievements,
      available: Object.entries(ACHIEVEMENTS)
        .filter(([id]) => !unlockedIds.includes(id))
        .map(([id, ach]) => ({
          id,
          ...ach
        }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Award badge
router.post('/award-badge', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { badgeId, badgeName, tier } = req.body;
    
    if (!badgeId || !badgeName) {
      return res.status(400).json({ error: 'Missing badge details' });
    }
    
    const result = await awardBadge(userId, badgeId, badgeName, tier);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get badges
router.get('/badges', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const gamification = await Gamification.findOne({ userId });
    
    const badges = gamification?.badges || [];
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update streak
router.post('/update-streak', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const streakCount = await updateStreak(userId);
    
    res.json({
      success: true,
      streak: streakCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get streak info
router.get('/streak', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const gamification = await Gamification.findOne({ userId });
    
    if (!gamification) {
      return res.json({
        currentStreak: 0,
        longestStreak: 0
      });
    }
    
    res.json({
      currentStreak: gamification.currentStreak?.count || 0,
      longestStreak: gamification.longestStreak?.count || 0,
      startDate: gamification.currentStreak?.startDate,
      streakHistory: gamification.streakHistory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get global leaderboard
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const { limit } = req.query;
    const leaderboard = await getLeaderboard(null, parseInt(limit) || 20);
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user rank
router.get('/rank', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const rank = await getUserRank(userId);
    
    res.json(rank);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete challenge
router.post('/complete-challenge', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { challengeId, reward } = req.body;
    
    if (!challengeId || !reward) {
      return res.status(400).json({ error: 'Missing challenge details' });
    }
    
    const result = await completeChallenge(userId, challengeId, reward);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active challenges
router.get('/challenges', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const gamification = await Gamification.findOne({ userId });
    
    const challenges = gamification?.activeChallenges || [];
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get level info
router.get('/level', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const gamification = await Gamification.findOne({ userId });
    
    if (!gamification) {
      return res.json({
        level: 1,
        experiencePoints: 0,
        experienceToNextLevel: 1000
      });
    }
    
    res.json({
      level: gamification.level,
      experiencePoints: gamification.experiencePoints,
      experienceToNextLevel: gamification.experienceToNextLevel,
      totalPoints: gamification.totalPoints
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all badges and achievements combined
router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const gamification = await Gamification.findOne({ userId });
    
    if (!gamification) {
      return res.json({
        achievements: 0,
        badges: 0,
        points: 0,
        level: 1,
        completedChallenges: 0
      });
    }
    
    res.json({
      achievements: gamification.achievements.length,
      badges: gamification.badges.length,
      points: gamification.totalPoints,
      level: gamification.level,
      completedChallenges: gamification.completedChallenges.length,
      unlockedAchievements: gamification.achievements,
      earnedBadges: gamification.badges
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

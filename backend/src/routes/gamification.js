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
const User = require('../models/User');
const Friend = require('../models/Friend');
const Challenge = require('../models/Challenge');
const DailyBonus = require('../models/DailyBonus');

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
    
    const unlockedIds = gamification?.achievements?.map(a => a.achievementId) || [];
    
    const achievements = Object.entries(ACHIEVEMENTS).map(([id, ach]) => ({
      id,
      name: ach.name,
      description: ach.description,
      points: ach.points,
      icon: ach.icon,
      rarity: ach.rarity,
      unlocked: unlockedIds.includes(id)
    }));
    
    res.json(achievements);
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

// Get user profile (combining user info and gamification)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('-password');
    const gamification = await Gamification.findOne({ userId });
    const rank = await getUserRank(userId);
    
    const profile = {
      id: userId,
      userId,
      ...user?.toObject(),
      points: gamification?.totalPoints || 0,
      level: gamification?.level || 1,
      experiencePoints: gamification?.experiencePoints || 0,
      experienceToNextLevel: gamification?.experienceToNextLevel || 1000,
      currentStreak: gamification?.currentStreak?.count || 0,
      longestStreak: gamification?.longestStreak?.count || 0,
      streakFreezeCount: 0,
      rank: rank.rank,
      percentile: rank.percentile,
      achievements: gamification?.achievements || [],
      badges: gamification?.badges || [],
      goals: gamification?.activeChallenges || [],
      dailyBonusClaimed: false
    };
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Claim daily bonus
router.post('/daily-bonus', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Check if already claimed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const alreadyClaimed = await DailyBonus.findOne({
      userId,
      claimedAt: { $gte: today }
    });
    
    if (alreadyClaimed) {
      return res.status(400).json({ error: 'Daily bonus already claimed today' });
    }
    
    const amount = 50;
    
    // Award points to gamification
    const result = await awardPoints(userId, amount, 'daily-bonus', 'Daily login bonus');
    
    // Record the claim
    const bonus = new DailyBonus({ userId, amount, streak: 1 });
    await bonus.save();
    
    res.json({
      success: true,
      claimed: true,
      amount,
      points: result.totalPoints,
      level: result.level
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get or add friend
router.post('/add-friend', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { friendId } = req.body;
    
    if (!friendId) {
      return res.status(400).json({ error: 'friendId is required' });
    }
    
    // Check if friend exists
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ error: 'Friend not found' });
    }
    
    // Check if already friends
    let friendship = await Friend.findOne({
      $or: [
        { userId, friendId },
        { userId: friendId, friendId: userId }
      ]
    });
    
    if (friendship) {
      return res.status(400).json({ error: 'Already friends' });
    }
    
    // Create friendship
    friendship = new Friend({ userId, friendId, status: 'accepted' });
    await friendship.save();
    
    res.json({ success: true, friend: { id: friendId, ...friend.toObject() } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get friends list
router.get('/friends', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    
    const friendships = await Friend.find({
      $or: [
        { userId, status: 'accepted' },
        { friendId: userId, status: 'accepted' }
      ]
    }).populate('friendId userId', 'username email avatar');
    
    const friends = await Promise.all(friendships.map(async (f) => {
      const friendData = f.userId._id.equals(userId) ? f.friendId : f.userId;
      const gamification = await Gamification.findOne({ userId: friendData._id });
      
      return {
        id: friendData._id,
        username: friendData.username,
        name: friendData.username,
        email: friendData.email,
        avatar: friendData.avatar,
        points: gamification?.totalPoints || 0,
        level: gamification?.level || 1,
        status: 'online'
      };
    }));
    
    res.json({ friends });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Challenge friend
router.post('/challenge', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { friendId } = req.body;
    
    if (!friendId) {
      return res.status(400).json({ error: 'friendId is required' });
    }
    
    // Check if friends
    const friendship = await Friend.findOne({
      $or: [
        { userId, friendId },
        { userId: friendId, friendId: userId }
      ],
      status: 'accepted'
    });
    
    if (!friendship) {
      return res.status(400).json({ error: 'Not friends with this user' });
    }
    
    // Create challenge
    const challenge = new Challenge({
      initiatorId: userId,
      targetId: friendId,
      type: 'quiz',
      status: 'pending',
      reward: 100
    });
    
    await challenge.save();
    
    res.json({
      success: true,
      challenge: {
        id: challenge._id,
        targetId: friendId,
        status: 'pending',
        reward: 100
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept challenge
router.post('/challenge/:challengeId/accept', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { challengeId } = req.params;
    
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    if (challenge.targetId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    challenge.status = 'accepted';
    await challenge.save();
    
    res.json({ success: true, challenge });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Decline challenge
router.post('/challenge/:challengeId/decline', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { challengeId } = req.params;
    
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    if (challenge.targetId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    challenge.status = 'declined';
    await challenge.save();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add or update goal
router.post('/goals', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { title, target, reward } = req.body;
    
    if (!title || !target) {
      return res.status(400).json({ error: 'Title and target are required' });
    }
    
    let gamification = await Gamification.findOne({ userId });
    if (!gamification) {
      gamification = new Gamification({ userId });
    }
    
    const goal = {
      challengeId: `goal-${Date.now()}`,
      name: title,
      objective: title,
      progress: 0,
      target,
      reward: reward || 100,
      startDate: new Date()
    };
    
    gamification.activeChallenges.push(goal);
    await gamification.save();
    
    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

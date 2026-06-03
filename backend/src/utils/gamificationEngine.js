const Gamification = require('../models/Gamification');

// Achievement definitions
const ACHIEVEMENTS = {
  'first-lecture': {
    name: 'First Steps',
    description: 'Complete your first lecture',
    icon: '🎬',
    rarity: 'common',
    points: 50
  },
  'quiz-master-10': {
    name: 'Quiz Master',
    description: 'Score 100% on 10 quizzes',
    icon: '📝',
    rarity: 'rare',
    points: 200
  },
  'study-streak-7': {
    name: 'Week Warrior',
    description: 'Maintain a 7-day study streak',
    icon: '🔥',
    rarity: 'epic',
    points: 300
  },
  'study-streak-30': {
    name: 'Monthly Champion',
    description: 'Maintain a 30-day study streak',
    icon: '👑',
    rarity: 'legendary',
    points: 1000
  },
  'perfect-score': {
    name: 'Perfect Score',
    description: 'Get a perfect score (100%) on a quiz',
    icon: '⭐',
    rarity: 'common',
    points: 75
  },
  'top-performer': {
    name: 'Top Performer',
    description: 'Rank in top 10% of your class',
    icon: '🏆',
    rarity: 'epic',
    points: 500
  },
  'speed-learner': {
    name: 'Speed Learner',
    description: 'Complete 5 lectures in one week',
    icon: '⚡',
    rarity: 'rare',
    points: 250
  },
  'retention-master': {
    name: 'Retention Master',
    description: 'Maintain 80%+ retention rate',
    icon: '🧠',
    rarity: 'epic',
    points: 400
  }
};

// Award points to user
async function awardPoints(userId, points, action, description) {
  try {
    let gamification = await Gamification.findOne({ userId });
    
    if (!gamification) {
      gamification = new Gamification({ userId });
    }
    
    gamification.totalPoints += points;
    gamification.experiencePoints += points;
    
    // Add to history
    gamification.pointsHistory.push({
      date: new Date(),
      points,
      action,
      description
    });
    
    // Check level up
    const level = Math.floor(gamification.experiencePoints / 1000) + 1;
    if (level > gamification.level) {
      gamification.level = level;
      gamification.experienceToNextLevel = (level * 1000) - gamification.experiencePoints;
    }
    
    // Reset experience to next level
    gamification.experienceToNextLevel = Math.max(0, 
      (gamification.level * 1000) - gamification.experiencePoints
    );
    
    await gamification.save();
    
    return {
      totalPoints: gamification.totalPoints,
      level: gamification.level,
      experienceToNextLevel: gamification.experienceToNextLevel
    };
  } catch (error) {
    console.error('Error awarding points:', error);
    throw error;
  }
}

// Unlock achievement
async function unlockAchievement(userId, achievementId) {
  try {
    let gamification = await Gamification.findOne({ userId });
    
    if (!gamification) {
      gamification = new Gamification({ userId });
    }
    
    // Check if already unlocked
    if (gamification.achievements.find(a => a.achievementId === achievementId)) {
      return { newAchievement: false };
    }
    
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) {
      throw new Error(`Achievement ${achievementId} not found`);
    }
    
    // Add achievement
    gamification.achievements.push({
      achievementId,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      rarity: achievement.rarity,
      unlockedAt: new Date()
    });
    
    // Award points
    gamification.totalPoints += achievement.points;
    gamification.experiencePoints += achievement.points;
    
    await gamification.save();
    
    return {
      newAchievement: true,
      achievement: {
        name: achievement.name,
        icon: achievement.icon,
        points: achievement.points
      }
    };
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    throw error;
  }
}

// Award badge
async function awardBadge(userId, badgeId, badgeName, tier = 1) {
  try {
    let gamification = await Gamification.findOne({ userId });
    
    if (!gamification) {
      gamification = new Gamification({ userId });
    }
    
    // Check if badge exists and upgrade tier
    const existingBadge = gamification.badges.find(b => b.badgeId === badgeId);
    
    if (existingBadge) {
      if (existingBadge.tier < 5) {
        existingBadge.tier++;
        existingBadge.earnedAt = new Date();
      }
    } else {
      gamification.badges.push({
        badgeId,
        name: badgeName,
        tier: Math.min(tier, 5),
        icon: '🏅',
        earnedAt: new Date(),
        description: `${badgeName} Badge - Tier ${tier}`
      });
    }
    
    await gamification.save();
    return { success: true, badge: badgeName };
  } catch (error) {
    console.error('Error awarding badge:', error);
    throw error;
  }
}

// Update streak
async function updateStreak(userId) {
  try {
    let gamification = await Gamification.findOne({ userId });
    
    if (!gamification) {
      gamification = new Gamification({ userId });
    }
    
    const today = new Date().toDateString();
    const lastActivityDate = gamification.currentStreak?.lastActivityDate?.toDateString();
    
    if (lastActivityDate === today) {
      // Already active today
      return gamification.currentStreak.count;
    }
    
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    if (lastActivityDate === yesterday) {
      // Continue streak
      gamification.currentStreak.count++;
    } else {
      // Break streak - save to history
      if (gamification.currentStreak?.count > 0) {
        gamification.streakHistory.push({
          count: gamification.currentStreak.count,
          startDate: gamification.currentStreak.startDate,
          endDate: gamification.currentStreak.lastActivityDate
        });
        
        // Update longest streak
        if (gamification.currentStreak.count > (gamification.longestStreak?.count || 0)) {
          gamification.longestStreak = {
            count: gamification.currentStreak.count,
            startDate: gamification.currentStreak.startDate,
            endDate: gamification.currentStreak.lastActivityDate
          };
        }
      }
      
      // Start new streak
      gamification.currentStreak = {
        count: 1,
        startDate: new Date(),
        lastActivityDate: new Date()
      };
    }
    
    gamification.currentStreak.lastActivityDate = new Date();
    
    // Check streak milestones
    if (gamification.currentStreak.count === 7) {
      await unlockAchievement(userId, 'study-streak-7');
    }
    if (gamification.currentStreak.count === 30) {
      await unlockAchievement(userId, 'study-streak-30');
    }
    
    await gamification.save();
    return gamification.currentStreak.count;
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
}

// Get leaderboard
async function getLeaderboard(classId, limit = 20) {
  try {
    const leaderboard = await Gamification.find()
      .populate('userId', 'username email avatar')
      .sort({ totalPoints: -1 })
      .limit(limit)
      .select('userId totalPoints level currentStreak.count');
    
    return leaderboard.map((entry, index) => ({
      id: entry._id,
      rank: index + 1,
      userId: entry.userId._id,
      username: entry.userId.username || 'Anonymous',
      name: entry.userId.username || 'Anonymous',
      points: entry.totalPoints,
      level: entry.level,
      streak: entry.currentStreak?.count || 0,
      type: 'global'
    }));
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
}

// Get user rank
async function getUserRank(userId) {
  try {
    const usersAbove = await Gamification.countDocuments({
      totalPoints: { $gt: (await Gamification.findOne({ userId }))?.totalPoints || 0 }
    });
    
    const userGamification = await Gamification.findOne({ userId });
    const percentile = Math.round((1 - usersAbove / await Gamification.countDocuments()) * 100);
    
    return {
      rank: usersAbove + 1,
      percentile,
      points: userGamification?.totalPoints || 0
    };
  } catch (error) {
    console.error('Error getting user rank:', error);
    throw error;
  }
}

// Complete challenge
async function completeChallenge(userId, challengeId, reward) {
  try {
    let gamification = await Gamification.findOne({ userId });
    
    if (!gamification) {
      gamification = new Gamification({ userId });
    }
    
    // Find and remove from active challenges
    const challengeIndex = gamification.activeChallenges.findIndex(c => c.challengeId === challengeId);
    if (challengeIndex >= 0) {
      const challenge = gamification.activeChallenges[challengeIndex];
      gamification.activeChallenges.splice(challengeIndex, 1);
      
      // Add to completed challenges
      gamification.completedChallenges.push({
        challengeId,
        completedAt: new Date(),
        reward
      });
      
      // Award points
      gamification.totalPoints += reward;
      gamification.experiencePoints += reward;
    }
    
    await gamification.save();
    return { success: true, reward };
  } catch (error) {
    console.error('Error completing challenge:', error);
    throw error;
  }
}

// Get gamification status
async function getGamificationStatus(userId) {
  try {
    let gamification = await Gamification.findOne({ userId });
    
    if (!gamification) {
      gamification = new Gamification({ userId });
      await gamification.save();
    }
    
    const rank = await getUserRank(userId);
    
    return {
      points: gamification.totalPoints,
      level: gamification.level,
      experienceToNextLevel: gamification.experienceToNextLevel,
      achievements: gamification.achievements.length,
      badges: gamification.badges.length,
      currentStreak: gamification.currentStreak?.count || 0,
      longestStreak: gamification.longestStreak?.count || 0,
      rank: rank.rank,
      percentile: rank.percentile,
      multiplier: gamification.currentMultiplier
    };
  } catch (error) {
    console.error('Error getting gamification status:', error);
    throw error;
  }
}

module.exports = {
  ACHIEVEMENTS,
  awardPoints,
  unlockAchievement,
  awardBadge,
  updateStreak,
  getLeaderboard,
  getUserRank,
  completeChallenge,
  getGamificationStatus
};

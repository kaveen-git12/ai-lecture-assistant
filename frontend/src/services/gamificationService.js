import apiClient from './apiClient';

const GAMIFICATION_PATH = '/api/gamification';

const gamificationService = {
  // Profile & Status
  getProfile: () => apiClient.get(`${GAMIFICATION_PATH}/profile`),
  getStatus: () => apiClient.get(`${GAMIFICATION_PATH}/status`),
  
  // Achievements & Progress
  getAchievements: () => apiClient.get(`${GAMIFICATION_PATH}/achievements`),
  unlockAchievement: (achievementId) => apiClient.post(`${GAMIFICATION_PATH}/unlock-achievement`, { achievementId }),
  getProgress: () => apiClient.get(`${GAMIFICATION_PATH}/progress`),
  
  // Points & Levels
  awardPoints: (points, action, description) => 
    apiClient.post(`${GAMIFICATION_PATH}/award-points`, { points, action, description }),
  getLevel: () => apiClient.get(`${GAMIFICATION_PATH}/level`),
  
  // Badges
  awardBadge: (badgeId, badgeName, tier) => 
    apiClient.post(`${GAMIFICATION_PATH}/award-badge`, { badgeId, badgeName, tier }),
  getBadges: () => apiClient.get(`${GAMIFICATION_PATH}/badges`),
  
  // Streaks
  updateStreak: () => apiClient.post(`${GAMIFICATION_PATH}/update-streak`, {}),
  getStreak: () => apiClient.get(`${GAMIFICATION_PATH}/streak`),
  
  // Leaderboard & Ranking
  getLeaderboard: (limit = 20) => apiClient.get(`${GAMIFICATION_PATH}/leaderboard?limit=${limit}`),
  getRank: () => apiClient.get(`${GAMIFICATION_PATH}/rank`),
  
  // Challenges
  getChallenges: () => apiClient.get(`${GAMIFICATION_PATH}/challenges`),
  completeChallenge: (challengeId, reward) => 
    apiClient.post(`${GAMIFICATION_PATH}/complete-challenge`, { challengeId, reward }),
  
  // Daily Bonus
  claimDailyBonus: () => apiClient.post(`${GAMIFICATION_PATH}/daily-bonus`, {}),
  
  // Friends
  addFriend: (friendId) => apiClient.post(`${GAMIFICATION_PATH}/add-friend`, { friendId }),
  getFriends: () => apiClient.get(`${GAMIFICATION_PATH}/friends`),
  challengeFriend: (friendId) => apiClient.post(`${GAMIFICATION_PATH}/challenge`, { friendId }),
  
  // Challenge Management
  acceptChallenge: (challengeId) => apiClient.post(`${GAMIFICATION_PATH}/challenge/${challengeId}/accept`, {}),
  declineChallenge: (challengeId) => apiClient.post(`${GAMIFICATION_PATH}/challenge/${challengeId}/decline`, {}),
  
  // Goals
  addGoal: (title, target, reward) => 
    apiClient.post(`${GAMIFICATION_PATH}/goals`, { title, target, reward })
};

export default gamificationService;

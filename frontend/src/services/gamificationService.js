import apiClient from './apiClient';

const GAMIFICATION_PATH = '/gamification';

const gamificationService = {
  getProfile: () => apiClient.get(`${GAMIFICATION_PATH}/profile`),
  getAchievements: () => apiClient.get(`${GAMIFICATION_PATH}/achievements`),
  getLeaderboard: () => apiClient.get(`${GAMIFICATION_PATH}/leaderboard`),
  getFriends: () => apiClient.get(`${GAMIFICATION_PATH}/friends`),
  challengeFriend: (friendId) => apiClient.post(`${GAMIFICATION_PATH}/challenge`, { friendId }),
  claimDailyBonus: () => apiClient.post(`${GAMIFICATION_PATH}/daily-bonus`, {}),
};

export default gamificationService;

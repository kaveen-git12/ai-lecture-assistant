import React, { useEffect, useMemo, useState } from 'react';
import gamificationService from '../services/gamificationService';
import GamificationHero from './Gamification/GamificationHero';
import AchievementGrid from './Gamification/AchievementGrid';
import AchievementToast from './Gamification/AchievementToast';
import StreakTracker from './Gamification/StreakTracker';
import GoalsSection from './Gamification/GoalsSection';
import Leaderboard from './Gamification/Leaderboard';
import FriendsList from './Gamification/FriendsList';
import './Gamification.css';

function Gamification() {
  const [profile, setProfile] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [friends, setFriends] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState('global');
  const [timeFilter, setTimeFilter] = useState('weekly');
  const [error, setError] = useState('');

  useEffect(() => {
    loadGamification();
  }, []);

  const loadGamification = async () => {
    setLoading(true);
    try {
      const [profileRes, achievementsRes, leaderboardRes, friendsRes] = await Promise.all([
        gamificationService.getProfile(),
        gamificationService.getAchievements(),
        gamificationService.getLeaderboard(),
        gamificationService.getFriends(),
      ]);

      setProfile(profileRes || {});
      setAchievements(achievementsRes.achievements || achievementsRes || []);
      setLeaderboard(leaderboardRes.entries || leaderboardRes || []);
      setFriends(friendsRes.friends || friendsRes || []);
      setGoals(profileRes.goals || []);
    } catch (err) {
      console.error('Unable to load gamification data', err);
      setError('Unable to load gamification content.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimBonus = async () => {
    try {
      const result = await gamificationService.claimDailyBonus();
      setProfile((prev) => ({
        ...prev,
        points: result.points ?? prev.points,
        dailyBonusClaimed: result.claimed ?? true,
        dailyBonusAmount: result.amount ?? prev.dailyBonusAmount,
      }));
      setToast({
        icon: '⚡',
        title: 'Daily Bonus Claimed',
        message: `+${result.amount ?? 50} XP added to your account.`,
      });
    } catch (err) {
      console.error('Claim bonus failed', err);
      setError('Failed to claim daily bonus.');
    }
  };

  const handleChallengeFriend = async (friendId) => {
    try {
      await gamificationService.challengeFriend(friendId);
      setToast({
        icon: '🎯',
        title: 'Challenge Sent',
        message: 'Your friend has been challenged to a learning match.',
      });
    } catch (err) {
      console.error('Challenge failed', err);
      setError('Unable to send challenge.');
    }
  };

  const handleUseFreeze = () => {
    if (profile.streakFreezeCount > 0) {
      setProfile((prev) => ({
        ...prev,
        streakFreezeCount: prev.streakFreezeCount - 1,
      }));
      setToast({
        icon: '❄️',
        title: 'Freeze Used',
        message: 'Your streak is preserved for today.',
      });
    }
  };

  const handleAddGoal = () => {
    const newGoal = {
      id: `goal-${Date.now()}`,
      title: 'Complete a review session',
      progress: 10,
      target: 100,
      reward: '100 XP',
    };
    setGoals((prev) => [...prev, newGoal]);
    setToast({
      icon: '✅',
      title: 'Goal Added',
      message: 'A new goal has been added to your roadmap.',
    });
  };

  const filteredLeaderboard = useMemo(() => {
    if (activeLeaderboardTab === 'friends') {
      return leaderboard.filter((item) => item.type === 'friend');
    }
    if (activeLeaderboardTab === 'class') {
      return leaderboard.filter((item) => item.type === 'class' || item.type === 'global');
    }
    return leaderboard;
  }, [leaderboard, activeLeaderboardTab]);

  const currentUserId = profile.userId || profile.id || null;

  return (
    <div className="gamification-root">
      <header className="gamification-header">
        <div>
          <h1>Gamification</h1>
          <p>Level up your learning with points, streaks, and friendly competition.</p>
        </div>
      </header>

      <GamificationHero
        profile={profile}
        onClaimBonus={handleClaimBonus}
        loading={loading}
      />

      <div className="gamification-main-grid">
        <AchievementGrid achievements={achievements} />
        <div className="gamification-side-column">
          <StreakTracker
            currentStreak={profile.currentStreak}
            longestStreak={profile.longestStreak}
            streakFreezeCount={profile.streakFreezeCount}
            onUseFreeze={handleUseFreeze}
          />
          <GoalsSection goals={goals} onAddGoal={handleAddGoal} />
        </div>
      </div>

      <Leaderboard
        leaderboard={filteredLeaderboard}
        currentUserId={currentUserId}
        activeTab={activeLeaderboardTab}
        timeFilter={timeFilter}
        onTabChange={setActiveLeaderboardTab}
        onFilterChange={setTimeFilter}
      />

      <FriendsList friends={friends} onChallenge={handleChallengeFriend} />

      <AchievementToast toast={toast} onClose={() => setToast(null)} />
      {error && <div className="gamification-error">{error}</div>}
    </div>
  );
}

export default Gamification;

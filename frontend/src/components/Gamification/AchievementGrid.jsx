import React from 'react';

const BADGES = [
  { id: 'first-steps', name: 'First Steps', points: 50, description: 'Complete your first lesson.', unlocked: true },
  { id: 'quiz-master', name: 'Quiz Master', points: 120, description: 'Finish 5 quizzes with 80%+ score.', unlocked: false },
  { id: 'week-warrior', name: 'Week Warrior', points: 90, description: 'Study 5 days in a row.', unlocked: true },
  { id: 'monthly-champion', name: 'Monthly Champion', points: 300, description: 'Keep a 30-day streak.', unlocked: false },
  { id: 'perfect-score', name: 'Perfect Score', points: 75, description: 'Earn 100% on a quiz.', unlocked: true },
  { id: 'top-performer', name: 'Top Performer', points: 160, description: 'Reach the top 10% leaderboard.', unlocked: false },
  { id: 'speed-learner', name: 'Speed Learner', points: 110, description: 'Complete a lesson in under 10 minutes.', unlocked: true },
  { id: 'retention-master', name: 'Retention Master', points: 220, description: 'Retain 80% of review material.', unlocked: false },
];

function AchievementGrid({ achievements }) {
  const badges = achievements.length ? achievements : BADGES;

  return (
    <section className="achievement-grid">
      <div className="panel-title">Achievements</div>
      <div className="badges-grid">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="badge-icon">{badge.unlocked ? '🏅' : '🔒'}</div>
            <div className="badge-copy">
              <div className="badge-name">{badge.name}</div>
              <div className="badge-description">{badge.description}</div>
            </div>
            <div className="badge-points">+{badge.points}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AchievementGrid;

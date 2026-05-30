import React from 'react';

function StreakTracker({ currentStreak, longestStreak, streakFreezeCount, onUseFreeze }) {
  return (
    <section className="streak-panel">
      <div className="panel-title">Streak Tracker</div>
      <div className="streak-details">
        <div className="streak-metric">
          <span className="streak-value">{currentStreak || 0}</span>
          <span className="streak-label">Current Streak</span>
        </div>
        <div className="streak-metric">
          <span className="streak-value">{longestStreak || 0}</span>
          <span className="streak-label">Longest Streak</span>
        </div>
        <div className="streak-metric">
          <span className="streak-value">{streakFreezeCount || 0}</span>
          <span className="streak-label">Freezes Available</span>
        </div>
      </div>
      <button type="button" className="control-button accent" onClick={onUseFreeze} disabled={!streakFreezeCount}>
        Use Freeze
      </button>
    </section>
  );
}

export default StreakTracker;

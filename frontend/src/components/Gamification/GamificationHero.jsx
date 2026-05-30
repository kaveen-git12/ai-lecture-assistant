import React from 'react';

function GamificationHero({ profile, onClaimBonus, loading }) {
  const xp = profile.points || 0;
  const level = profile.level || 1;
  const progress = Math.min(100, Math.round(((xp % 1000) / 1000) * 100));
  const nextLevelXp = 1000 - (xp % 1000);
  const bonusAvailable = !profile.dailyBonusClaimed;

  return (
    <section className="hero-card">
      <div className="hero-copy">
        <div className="hero-label">XP TOTAL</div>
        <div className="hero-value">{xp}</div>
        <div className="hero-subtitle">Current Level</div>
        <div className="hero-level">{level}</div>
      </div>
      <div className="hero-progress">
        <div className="progress-header">
          <span>Progress to next level</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-detail">{nextLevelXp} XP until Level {level + 1}</div>
      </div>
      <button
        type="button"
        className="claim-bonus-btn"
        onClick={onClaimBonus}
        disabled={loading || !bonusAvailable}
      >
        {bonusAvailable ? 'Claim Daily Bonus' : 'Bonus Claimed'}
      </button>
    </section>
  );
}

export default GamificationHero;

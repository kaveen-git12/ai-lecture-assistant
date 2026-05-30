import React, { useState, useEffect } from 'react';

const AchievementNotification = ({ achievementId, achievementName, pointsEarned, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const achievementEmojis = {
    'perfect-score': '🏆',
    'first-lecture': '🎓',
    'quiz-master-10': '🧠',
    'study-streak-7': '🔥',
    'study-streak-30': '⭐',
    'top-performer': '👑',
    'retention-master': '📚'
  };

  const emoji = achievementEmojis[achievementId] || '🎉';

  return (
    <div className="achievement-notification">
      <div className="achievement-content">
        <span className="achievement-emoji">{emoji}</span>
        <div className="achievement-text">
          <h3>Achievement Unlocked!</h3>
          <p className="achievement-title">{achievementName}</p>
          {pointsEarned > 0 && <p className="achievement-points">+{pointsEarned} XP</p>}
        </div>
        <button 
          className="notification-close"
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AchievementNotification;

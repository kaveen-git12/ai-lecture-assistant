import React from 'react';

function AnalyticsOverview({ dashboard, weakTopics, strongTopics, recommendations, onPracticeTopic }) {
  const cards = [
    { label: 'Total Study Hours', value: `${dashboard.totalStudyHours || 0}h`, icon: '⏱️' },
    { label: 'Sessions / Week', value: dashboard.sessionsPerWeek || 0, icon: '📅' },
    { label: 'Consistency Score', value: `${dashboard.consistencyScore || 0}%`, icon: '⭐' },
    { label: 'Current Streak', value: `${dashboard.currentStreak || 0} days`, icon: '🔥' },
  ];

  return (
    <section className="overview-section">
      <div className="overview-grid">
        {cards.map((card) => (
          <div key={card.label} className="metric-card">
            <span className="metric-icon">{card.icon}</span>
            <div className="metric-text">
              <span className="metric-label">{card.label}</span>
              <strong className="metric-value">{card.value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="insights-grid">
        <div className="topic-panel weak-panel">
          <div className="panel-title">Weak Topics</div>
          <div className="topic-list">
            {weakTopics.length === 0 ? (
              <div className="empty-state">No weak topics identified yet.</div>
            ) : (
              weakTopics.map((topic) => (
                <div key={topic.topic} className="topic-row">
                  <div>
                    <div className="topic-name">{topic.topic}</div>
                    <div className="topic-detail">{topic.notes || `${topic.errorCount || 0} wrong answers`}</div>
                  </div>
                  <button type="button" className="practice-btn" onClick={() => onPracticeTopic(topic.topic)}>
                    Practice
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="topic-panel strong-panel">
          <div className="panel-title">Strong Topics</div>
          <div className="topic-list">
            {strongTopics.length === 0 ? (
              <div className="empty-state">No strengths discovered yet.</div>
            ) : (
              strongTopics.map((topic) => (
                <div key={topic.topic} className="topic-row">
                  <div>
                    <div className="topic-name">{topic.topic}</div>
                    <div className="topic-detail">{topic.notes || `${topic.masteryLevel || 0}% mastery`}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="recommendations-panel">
          <div className="panel-title">Smart Recommendations</div>
          <p className="panel-copy">Optimal review windows, break suggestions, and pacing tips tailored to your routine.</p>
          <ul className="recommendations-list">
            {recommendations.slice(0, 5).map((item, index) => (
              <li key={`${item.title || item.id}-${index}`} className="recommendation-item">
                <span className="recommendation-title">{item.title || item.label || 'Recommended session'}</span>
                <span className="recommendation-score">{item.confidence ? `Score ${item.confidence}` : item.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AnalyticsOverview;

import React, { useState, useEffect } from 'react';

function SpacedRepetitionDashboard() {
  const [stats, setStats] = useState(null);
  const [dueCards, setDueCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [quality, setQuality] = useState(3);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const lectureId = localStorage.getItem('currentLectureId');
      
      if (!lectureId) return;

      const res = await fetch(`/api/spaced-repetition/stats/${lectureId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      setStats(data.stats);
      setSchedule(data.schedule30Days);

      // Fetch due cards
      const dueRes = await fetch(`/api/spaced-repetition/due-cards/${lectureId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dueData = await dueRes.json();
      setDueCards(dueData.cards);
      if (dueData.cards.length > 0) {
        setCurrentCard(dueData.cards[0]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setLoading(false);
    }
  };

  const reviewCard = async () => {
    if (!currentCard) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/spaced-repetition/review/${currentCard._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quality: parseInt(quality) })
      });

      // Move to next card
      const nextIndex = dueCards.findIndex(c => c._id === currentCard._id) + 1;
      if (nextIndex < dueCards.length) {
        setCurrentCard(dueCards[nextIndex]);
        setQuality(3);
      } else {
        alert('Great! All due cards reviewed today! 🎉');
        fetchStats();
      }
    } catch (error) {
      console.error('Review failed:', error);
    }
  };

  if (loading) return <div className="glass">Loading...</div>;

  return (
    <div className="spaced-repetition-dashboard glass">
      <h3>📚 Spaced Repetition Learning</h3>

      {/* Statistics */}
      {stats && (
        <div 
          className="sr-stats"
        >
          {[
            { key: 'due', value: stats.dueToday || 0, label: 'Due Today' },
            { key: 'ease', value: stats.avgEaseFactor, label: 'Avg Ease Factor' },
            { key: 'acc', value: `${stats.accuracy}%`, label: 'Accuracy' },
            { key: 'rep', value: stats.avgRepetitions, label: 'Avg Reviews' }
          ].map((stat, idx) => (
            <div
              key={stat.key}
              className="stat-card"
            >
              <h4>{stat.value}</h4>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Review Card */}
      <motion.div
        key={currentCard?._id}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.4 }}
      >
        {currentCard ? (
          <div className="review-card glass">
            <h4>Question {dueCards.indexOf(currentCard) + 1} of {dueCards.length}</h4>
            <div className="card-content">
              <p className="question">{currentCard.flashcard?.question}</p>
              <details className="answer">
                <summary>Show Answer</summary>
                <p>{currentCard.flashcard?.answer}</p>
              </details>
            </div>

            {/* Quality Rating */}
            <div className="quality-selector">
              <label>How well did you know it?</label>
              <div className="quality-buttons">
                {[0, 1, 2, 3, 4, 5].map(q => (
                  <button
                    key={q}
                    className={`quality-btn ${quality === q ? 'active' : ''}`}
                    onClick={() => setQuality(q)}
                  >
                    {['❌', '😞', '😐', '👍', '😊', '🤩'][q]}
                    <span>{['Again', 'Hard', 'OK', 'Good', 'Easy', 'Perfect'][q]}</span>
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-primary" onClick={reviewCard}>
              Submit & Next
            </button>
          </div>
        ) : (
          <motion.div 
            className="no-cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p>No cards due today! ✨ Take a break or review again tomorrow.</p>
            <button className="btn-secondary" onClick={fetchStats}>Refresh</button>
          </div>
        )}
      </div>

      {/* Schedule */}
      {schedule.length > 0 && (
        <div
          className="schedule"
        >
          <h4>📅 30-Day Schedule</h4>
          <div className="schedule-grid">
            {schedule.map((day, idx) => (
              <div
                key={idx}
                className="schedule-day"
              >
                <strong>{day.count}</strong>
                <small>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SpacedRepetitionDashboard;

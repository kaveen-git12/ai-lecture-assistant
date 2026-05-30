import React, { useState, useEffect } from 'react';

const GamificationPanel = () => {
  const [gamification, setGamification] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [view, setView] = useState('status');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      const [statusRes, leaderboardRes] = await Promise.all([
        fetch('/api/gamification/status', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/gamification/leaderboard?limit=10', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const statusData = await statusRes.json();
      const leaderboardData = await leaderboardRes.json();
      
      setGamification(statusData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="panel glass-panel">Loading gamification data...</div>;
  if (!gamification) return <div className="panel glass-panel">No data available</div>;

  return (
    <div className="gamification-panel glass-panel">
      <div className="panel-header">
        <h2>🎮 Gamification Hub</h2>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${view === 'status' ? 'active' : ''}`}
            onClick={() => setView('status')}
          >
            Status
          </button>
          <button 
            className={`toggle-btn ${view === 'achievements' ? 'active' : ''}`}
            onClick={() => setView('achievements')}
          >
            Achievements
          </button>
          <button 
            className={`toggle-btn ${view === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setView('leaderboard')}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {view === 'status' && (
        <div className="status-view">
          <div className="profile-section">
            <div className="level-display">
              <div className="level-number">{gamification.level}</div>
              <div className="level-label">LEVEL</div>
            </div>

            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-icon">⭐</span>
                <span className="stat-label">Points</span>
                <span className="stat-value">{gamification.points}</span>
              </div>
              <div className="stat-box">
                <span className="stat-icon">🔥</span>
                <span className="stat-label">Streak</span>
                <span className="stat-value">{gamification.currentStreak}</span>
              </div>
              <div className="stat-box">
                <span className="stat-icon">🏆</span>
                <span className="stat-label">Rank</span>
                <span className="stat-value">#{gamification.rank}</span>
              </div>
              <div className="stat-box">
                <span className="stat-icon">📊</span>
                <span className="stat-label">Percentile</span>
                <span className="stat-value">{gamification.percentile}%</span>
              </div>
            </div>
          </div>

          <div className="progress-section">
            <h3>Experience Progress</h3>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${100 - (gamification.experienceToNextLevel / 1000) * 100}%` }}
                ></div>
              </div>
              <div className="progress-label">
                {1000 - gamification.experienceToNextLevel} / 1000 XP to Level {gamification.level + 1}
              </div>
            </div>
          </div>

          <div className="badges-preview">
            <h3>🏅 Recent Badges ({gamification.badges})</h3>
            <div className="badges-container">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="badge-item">
                  <div className="badge-icon">🏅</div>
                  <div className="badge-tier">Tier {i + 1}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="achievements-preview">
            <h3>🎯 Achievements ({gamification.achievements})</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
              You have unlocked {gamification.achievements} achievements!
            </p>
          </div>

          <button className="refresh-btn" onClick={fetchGamificationData}>
            🔄 Refresh Stats
          </button>
        </div>
      )}

      {view === 'achievements' && (
        <div className="achievements-view">
          <div className="achievement-card">
            <div className="achievement-icon">🎬</div>
            <div className="achievement-content">
              <h4>First Steps</h4>
              <p>Complete your first lecture</p>
              <span className="achievement-reward">+50 Points</span>
            </div>
          </div>

          <div className="achievement-card unlocked">
            <div className="achievement-icon">⭐</div>
            <div className="achievement-content">
              <h4>Perfect Score</h4>
              <p>Get 100% on a quiz</p>
              <span className="achievement-reward">+75 Points</span>
            </div>
            <div className="unlock-date">Unlocked 3 days ago</div>
          </div>

          <div className="achievement-card">
            <div className="achievement-icon">👑</div>
            <div className="achievement-content">
              <h4>Monthly Champion</h4>
              <p>Maintain 30-day study streak</p>
              <span className="achievement-reward">+1000 Points</span>
            </div>
            <div className="progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '25%' }}></div>
              </div>
              <span className="progress-text">7/30 days</span>
            </div>
          </div>

          <div className="achievement-card">
            <div className="achievement-icon">🧠</div>
            <div className="achievement-content">
              <h4>Retention Master</h4>
              <p>Maintain 80%+ retention rate</p>
              <span className="achievement-reward">+400 Points</span>
            </div>
          </div>
        </div>
      )}

      {view === 'leaderboard' && (
        <div className="leaderboard-view">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Level</th>
                <th>Points</th>
                <th>Streak</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.rank} className={entry.rank === 1 ? 'top' : ''}>
                  <td>
                    {entry.rank === 1 ? '🥇' :  entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </td>
                  <td>
                    <div className="level-badge">{entry.level}</div>
                  </td>
                  <td className="points-cell">{entry.points.toLocaleString()}</td>
                  <td>
                    <span className="streak-badge">🔥 {entry.streak}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .gamification-panel {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .view-toggle {
          display: flex;
          gap: 10px;
        }

        .toggle-btn {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #fff;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .toggle-btn.active {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .status-view {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .profile-section {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }

        .level-display {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        .level-number {
          font-size: 3rem;
          font-weight: bold;
          color: #fff;
        }

        .level-label {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.8);
          letter-spacing: 1px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          flex: 1;
        }

        .stat-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.08);
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-icon {
          font-size: 1.5rem;
        }

        .stat-label {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #fff;
        }

        .progress-section {
          background: rgba(255, 255, 255, 0.08);
          padding: 15px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .progress-bar {
          height: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          overflow: hidden;
          margin: 10px 0;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00d4ff, #0099ff);
          transition: width 0.5s ease;
        }

        .progress-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .badges-container {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .badge-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          background: rgba(255, 255, 255, 0.05);
          padding: 10px;
          border-radius: 10px;
          flex: 1;
        }

        .badge-icon {
          font-size: 2rem;
        }

        .badge-tier {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .achievement-card {
          display: flex;
          gap: 15px;
          background: rgba(255, 255, 255, 0.08);
          padding: 15px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 10px;
          align-items: center;
        }

        .achievement-card.unlocked {
          border-color: #51cf66;
          background: rgba(81, 207, 102, 0.1);
        }

        .achievement-icon {
          font-size: 2.5rem;
          flex-shrink: 0;
        }

        .achievement-content {
          flex: 1;
        }

        .achievement-content h4 {
          margin: 0 0 5px 0;
          color: #fff;
        }

        .achievement-content p {
          margin: 0 0 8px 0;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .achievement-reward {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: bold;
        }

        .unlock-date {
          color: rgba(81, 207, 102, 0.8);
          font-size: 0.85rem;
        }

        .leaderboard-table {
          width: 100%;
          border-collapse: collapse;
        }

        .leaderboard-table th {
          background: rgba(255, 255, 255, 0.1);
          padding: 12px;
          text-align: left;
          font-weight: bold;
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        }

        .leaderboard-table td {
          padding: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .leaderboard-table tr.top {
          background: rgba(255, 215, 0, 0.05);
        }

        .level-badge {
          background: rgba(102, 126, 234, 0.3);
          padding: 4px 8px;
          border-radius: 8px;
          font-weight: bold;
        }

        .streak-badge {
          background: rgba(255, 107, 107, 0.2);
          padding: 4px 8px;
          border-radius: 8px;
        }

        .refresh-btn {
          padding: 12px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s;
        }

        .refresh-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
      `}</style>
    </div>
  );
};

export default GamificationPanel;

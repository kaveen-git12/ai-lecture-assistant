import React, { useState, useEffect } from 'react';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('overview');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/dashboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) return <div className="panel glass-panel">Loading analytics...</div>;
  if (!analytics) return <div className="panel glass-panel">No data available</div>;

  return (
    <div className="analytics-dashboard glass-panel">
      <div className="panel-header">
        <h2>📊 Learning Analytics</h2>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${view === 'overview' ? 'active' : ''}`}
            onClick={() => setView('overview')}
          >
            Overview
          </button>
          <button 
            className={`toggle-btn ${view === 'details' ? 'active' : ''}`}
            onClick={() => setView('details')}
          >
            Details
          </button>
        </div>
      </div>

      {view === 'overview' && (
        <div
          className="analytics-overview"
        >
          {[
            { icon: '⏱️', label: 'Total Study Time', value: formatTime(analytics.totalStudyTime) },
            { icon: '📚', label: 'Lectures Completed', value: analytics.totalLectures },
            { icon: '📈', label: 'Average Accuracy', value: `${analytics.averageAccuracy}%` },
            { icon: '📝', label: 'Sessions Completed', value: analytics.totalSessions }
          ].map((stat, idx) => (
            <div
              key={idx}
              className="stat-card"
            >
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
                {stat.label === 'Average Accuracy' && (
                  <div className="progress-bar">
                      <div
                        className="progress-fill"
                      ></div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div
            className="weak-areas"
          >
          >
            <h3>🎯 Areas to Improve</h3>
            <div className="topic-list">
              {analytics.topWeakAreas.map((topic, idx) => (
                <div
                  key={idx}
                  className="topic-item weak"
                >
                  <span className="topic-name">{topic.topic}</span>
                  <span className="topic-stat">{topic.errorCount} errors</span>
                </div>
              ))}
            </div>
          </div>

          <div className="strong-areas">
            <h3>⭐ Areas of Strength</h3>
            <div className="topic-list">
              {analytics.topStrengths.map((topic, idx) => (
                <div key={idx} className="topic-item strong">
                  <span className="topic-name">{topic.topic}</span>
                  <span className="topic-stat">{topic.masteryLevel}% mastery</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'details' && (
        <div className="analytics-details">
          <div className="detail-section">
            <h3>Retention Curve (Ebbinghaus)</h3>
            <p className="description">How much you're likely to remember over time:</p>
            <div className="curve-visualization">
              <div className="curve-point" style={{ left: '0%' }}>100%</div>
              <div className="curve-point" style={{ left: '50%' }}>66%</div>
              <div className="curve-point" style={{ left: '100%' }}>25%</div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Learning Curve</h3>
            <p className="description">Your accuracy improvement over time:</p>
            <div className="learning-trend">
              <div className="trend-indicator">↗️ Improving</div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Study Patterns</h3>
            <p className="description">Your learning habits and preferences:</p>
            <div className="pattern-grid">
              <div className="pattern-item">
                <span className="pattern-label">Most Productive Hour</span>
                <span className="pattern-value">2:00 PM</span>
              </div>
              <div className="pattern-item">
                <span className="pattern-label">Avg Weekly Study</span>
                <span className="pattern-value">8.5 hours</span>
              </div>
              <div className="pattern-item">
                <span className="pattern-label">Consistency Score</span>
                <span className="pattern-value">85/100</span>
              </div>
            </div>
          </div>

          <button className="export-btn">
            📥 Export as PDF
          </button>
        </div>
      )}

      <style jsx>{`
        .analytics-dashboard {
          padding: 20px;
          gap: 20px;
          display: flex;
          flex-direction: column;
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

        .analytics-overview {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .stat-card {
          display: flex;
          gap: 15px;
          background: rgba(255, 255, 255, 0.08);
          padding: 15px;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 5px;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: bold;
          color: #fff;
        }

        .progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          margin-top: 8px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00d4ff, #0099ff);
          transition: width 0.5s ease;
        }

        .weak-areas, .strong-areas {
          grid-column: 1 / -1;
          background: rgba(255, 255, 255, 0.08);
          padding: 15px;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .topic-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 10px;
        }

        .topic-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
        }

        .topic-item.weak {
          border-left: 3px solid #ff6b6b;
        }

        .topic-item.strong {
          border-left: 3px solid #51cf66;
        }

        .detail-section {
          background: rgba(255, 255, 255, 0.08);
          padding: 15px;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 15px;
        }

        .description {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 10px;
        }

        .export-btn {
          grid-column: 1 / -1;
          padding: 12px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s;
        }

        .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;

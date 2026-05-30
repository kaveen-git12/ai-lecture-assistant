import React from 'react';

function Leaderboard({ leaderboard, currentUserId, activeTab, timeFilter, onTabChange, onFilterChange }) {
  return (
    <section className="leaderboard-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Leaderboard</div>
          <div className="panel-subtitle">See your rank across different groups.</div>
        </div>
        <div className="leaderboard-controls">
          {['global', 'class', 'friends'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
              onClick={() => onTabChange(tab)}
            >
              {tab === 'global' ? 'Global' : tab === 'class' ? 'Class' : 'Friends'}
            </button>
          ))}
          <select value={timeFilter} onChange={(event) => onFilterChange(event.target.value)}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="all">All-time</option>
          </select>
        </div>
      </div>

      <div className="leaderboard-table-wrap">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Points</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr key={entry.id || entry.rank} className={entry.userId === currentUserId ? 'current-user' : ''}>
                <td>{entry.rank ? `#${entry.rank}` : '-'}</td>
                <td>{entry.name || entry.username}</td>
                <td>{entry.points || 0}</td>
                <td>{entry.type ? entry.type.charAt(0).toUpperCase() + entry.type.slice(1) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Leaderboard;

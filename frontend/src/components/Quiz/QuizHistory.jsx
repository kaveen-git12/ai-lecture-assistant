import React from 'react';

function QuizHistory({ history, onBack }) {
  const sorted = [...(history || [])].sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
  const maxScore = Math.max(...sorted.map((item) => item.score), 1);

  return (
    <section className="quiz-panel-section quiz-history-panel">
      <div className="quiz-panel-header">
        <div>
          <h2>Score History</h2>
          <p>Track performance over past quiz attempts.</p>
        </div>
        <button className="control-button secondary" onClick={onBack}>Back</button>
      </div>

      {sorted.length === 0 ? (
        <div className="quiz-empty-state">
          <p>No history available yet.</p>
        </div>
      ) : (
        <div className="history-chart-frame">
          <div className="history-chart">
            {sorted.map((item, index) => {
              const height = Math.round((item.score / maxScore) * 120) + 20;
              return (
                <div key={item.completedAt + index} className="history-bar-group">
                  <div className="history-bar" style={{ height: `${height}px` }} />
                  <span>{new Date(item.completedAt).toLocaleDateString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="history-list">
          {sorted.map((item, index) => (
            <div key={item.completedAt + index} className="history-row">
              <span>{new Date(item.completedAt).toLocaleDateString()}</span>
              <strong>{item.score}/{item.total}</strong>
              <span>{Math.round((item.score / item.total) * 100)}%</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default QuizHistory;

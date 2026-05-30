import React from 'react';

function GoalsSection({ goals, onAddGoal }) {
  return (
    <section className="goals-panel">
      <div className="panel-title">Active Goals</div>
      <div className="goals-list">
        {goals.length === 0 && <div className="empty-state">No goals set yet. Add one to start tracking progress.</div>}
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.progress / goal.target) * 100));
          return (
            <div key={goal.id} className="goal-item">
              <div className="goal-copy">
                <div className="goal-name">{goal.title}</div>
                <div className="goal-detail">Reward: {goal.reward}</div>
              </div>
              <div className="goal-progress-bar">
                <div className="goal-progress-fill" style={{ width: `${percent}%` }} />
              </div>
              <div className="goal-footer">
                <span>{percent}% complete</span>
                <span>{goal.progress}/{goal.target}</span>
              </div>
            </div>
          );
        })}
      </div>
      <button type="button" className="control-button accent" onClick={onAddGoal}>
        Add Goal
      </button>
    </section>
  );
}

export default GoalsSection;

import React from 'react';

const ACTIONS = [
  { label: 'Summarize this lecture', value: 'Summarize the lecture and highlight the key points.' },
  { label: 'Explain this concept', value: 'Explain this topic in simple terms for a student.' },
  { label: 'Create study questions', value: 'Generate 5 practice questions based on the lecture content.' },
  { label: 'Give memory tips', value: 'Provide study techniques and memory tips for this material.' },
];

function QuickActions({ onAction }) {
  return (
    <section className="quick-actions-panel">
      <div className="panel-title">Quick Actions</div>
      <div className="action-grid">
        {ACTIONS.map((action) => (
          <button key={action.label} type="button" className="action-chip" onClick={() => onAction(action.value)}>
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default QuickActions;

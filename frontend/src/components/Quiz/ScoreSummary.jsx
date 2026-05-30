import React from 'react';

function ScoreSummary({ result, quiz, onRetry, onBackToList }) {
  const percentage = Math.round((result.score / result.total) * 100);
  return (
    <section className="quiz-panel-section quiz-summary-panel">
      <div className="quiz-panel-header">
        <div>
          <h2>Quiz Summary</h2>
          <p>Review your score and retry to improve retention.</p>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-score">{result.score}/{result.total}</div>
        <div className="summary-percentage">{percentage}%</div>
        <div className="summary-detail">{quiz.questions.length} questions · {quiz.difficulty || 'Medium'} difficulty</div>
        <div className="summary-actions">
          <button className="control-button" onClick={onRetry}>Retry Quiz</button>
          <button className="control-button secondary" onClick={onBackToList}>Back to Quizzes</button>
        </div>
      </div>
    </section>
  );
}

export default ScoreSummary;

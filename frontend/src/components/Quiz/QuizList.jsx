import React from 'react';

function QuizList({ quizzes, selectedQuiz, onSelectQuiz, onStartQuiz, onDeleteQuiz, onCreateQuiz, onShowHistory }) {
  return (
    <section className="quiz-panel-section quiz-list-panel">
      <div className="quiz-panel-header">
        <div>
          <h2>Quizzes</h2>
          <p>Review saved quizzes, performance, and start the next attempt.</p>
        </div>
        <div className="quiz-panel-actions">
          <button className="control-button" onClick={onCreateQuiz}>New Quiz</button>
          <button className="control-button secondary" onClick={onShowHistory}>History</button>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="quiz-empty-state">
          <p>No quizzes created yet.</p>
          <small>Use the New Quiz button to generate one from lecture or note content.</small>
        </div>
      ) : (
        <div className="quiz-list-cards">
          {quizzes.map((quiz) => {
            const lastAttempt = (quiz.history || []).slice(-1)[0];
            const scoreLabel = lastAttempt ? `${lastAttempt.score}/${quiz.questions.length}` : 'Not attempted';
            return (
              <article
                key={quiz.id}
                className={`quiz-card ${selectedQuiz?.id === quiz.id ? 'selected' : ''}`}
                onClick={() => onSelectQuiz(quiz)}
              >
                <div className="quiz-card-top">
                  <div>
                    <strong>{quiz.title || 'Untitled Quiz'}</strong>
                    <span>{quiz.subject || 'General'}</span>
                  </div>
                  <div className="quiz-meta">{new Date(quiz.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="quiz-card-body">
                  <div>{quiz.questions.length} questions</div>
                  <div>{quiz.difficulty || 'Medium'} difficulty</div>
                </div>
                <div className="quiz-card-footer">
                  <div>Latest: {scoreLabel}</div>
                  <div className="quiz-card-actions">
                    <button className="control-button small" onClick={(e) => { e.stopPropagation(); onStartQuiz(quiz); }}>Play</button>
                    <button className="control-button secondary small" onClick={(e) => { e.stopPropagation(); onDeleteQuiz(quiz.id); }}>Delete</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default QuizList;

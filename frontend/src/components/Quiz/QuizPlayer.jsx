import React, { useEffect, useMemo, useState } from 'react';

const TIMER_SECONDS = 25;

function QuizPlayer({ quiz, onSubmit, onCancel }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [feedback, setFeedback] = useState('');

  const question = quiz.questions[currentQuestion];
  const progress = useMemo(() => Math.round(((currentQuestion + 1) / quiz.questions.length) * 100), [currentQuestion, quiz.questions.length]);

  useEffect(() => {
    if (!timerEnabled) return undefined;
    if (timeLeft <= 0) {
      handleNext();
      return undefined;
    }
    const timerId = window.setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => window.clearTimeout(timerId);
  }, [timerEnabled, timeLeft]);

  useEffect(() => {
    setTimeLeft(TIMER_SECONDS);
  }, [currentQuestion, timerEnabled]);

  const handleAnswer = (value) => {
    const updated = [...answers];
    updated[currentQuestion] = value;
    setAnswers(updated);
    const isCorrect = question.type === 'short'
      ? String(value).trim().toLowerCase() === String(question.correctAnswer || '').trim().toLowerCase()
      : Number(value) === Number(question.correctAnswer);
    const explanation = question.explanation || (isCorrect ? 'That answer matches the correct response.' : 'This answer is not correct. Review the explanation and try again.');
    setFeedback(isCorrect ? `Correct ✅ ${explanation}` : `Incorrect ❌ ${explanation}`);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setFeedback('');
    } else {
      setShowReview(true);
    }
  };

  const handleSubmit = () => {
    const totalCorrect = quiz.questions.reduce((count, question, idx) => {
      const answer = answers[idx];
      if (question.type === 'short') {
        return count + (String(answer || '').trim().toLowerCase() === String(question.correctAnswer || '').trim().toLowerCase() ? 1 : 0);
      }
      return count + (Number(answer) === Number(question.correctAnswer) ? 1 : 0);
    }, 0);
    const result = {
      answers,
      score: totalCorrect,
      total: quiz.questions.length,
      completedAt: new Date().toISOString(),
    };
    onSubmit(result);
  };

  const progressLabel = `${currentQuestion + 1}/${quiz.questions.length}`;

  return (
    <section className="quiz-panel-section quiz-player-panel">
      <div className="quiz-panel-header">
        <div>
          <h2>{quiz.title || 'Quiz Player'}</h2>
          <p>One question at a time with optional timer and review before submit.</p>
        </div>
        <button className="control-button secondary" onClick={onCancel}>Exit</button>
      </div>

      <div className="quiz-progress-bar">
        <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="quiz-progress-label">{progressLabel} completed</div>

      <label className="toggle-row">
        <input type="checkbox" checked={timerEnabled} onChange={(e) => setTimerEnabled(e.target.checked)} />
        Enable timer
      </label>

      {timerEnabled && (
        <div className="timer-box">Time left: {timeLeft}s</div>
      )}

      {!showReview ? (
        <div className="quiz-player-question">
          <h3>{question.question}</h3>
          <div className="quiz-options">
            {(question.options || []).map((option, index) => (
              <label key={index} className="quiz-option">
                <input
                  type={question.type === 'short' ? 'text' : 'radio'}
                  name="quiz-answer"
                  checked={answers[currentQuestion] === (question.type === 'short' ? option : index)}
                  value={question.type === 'short' ? answers[currentQuestion] || '' : index}
                  onChange={(e) => handleAnswer(question.type === 'short' ? e.target.value : Number(e.target.value))}
                />
                {question.type === 'short' ? 'Answer:' : option}
              </label>
            ))}
          </div>
          {feedback && <div className="quiz-feedback">{feedback}</div>}
          <div className="quiz-player-actions">
            <button className="control-button" onClick={handleNext}>{currentQuestion === quiz.questions.length - 1 ? 'Review & Submit' : 'Next Question'}</button>
          </div>
        </div>
      ) : (
        <div className="quiz-review-panel">
          <h3>Review Your Answers</h3>
          <ul>
            {quiz.questions.map((question, idx) => (
              <li key={question.id} className="review-item">
                <strong>{question.question}</strong>
                <div>Answer: {String(answers[idx] ?? 'No answer')}</div>
              </li>
            ))}
          </ul>
          <button className="control-button" onClick={handleSubmit}>Submit Quiz</button>
        </div>
      )}
    </section>
  );
}

export default QuizPlayer;

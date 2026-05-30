import React, { useState } from 'react';

function SummaryPanel({ onRequestSummary, onRequestActiveLearning, summary, quiz, answerStates, onAnswerQuestion, score }) {
  const [shortAnswers, setShortAnswers] = useState({});

  const handleRequestSummary = async () => {
    try {
      await onRequestSummary();
    } catch (error) {
      console.error("Summary request failed");
    }
  };

  const handleRequestActiveLearning = async () => {
    try {
      await onRequestActiveLearning();
    } catch (error) {
      console.error("Active learning request failed");
    }
  };

  const handleShortAnswerChange = (index, value) => {
    setShortAnswers(prev => ({ ...prev, [index]: value }));
  };

  return (
    <div className="glass right-panel">
      <h2>Super Assistant</h2>
      <div className="button-group">
        <button onClick={handleRequestSummary}>Summarize Slides</button>
        <button onClick={handleRequestActiveLearning}>Active Learning Quiz</button>
      </div>

      <div className="assistant-box">
        <h3>Summary</h3>
        <pre>{summary || 'No summary yet'}</pre>
      </div>

      {quiz && quiz.length > 0 && (
        <div className="quiz-box">
          <h3>Quiz (Score: {score}/{quiz.length})</h3>
          {quiz.map((item, index) => (
            <div key={index} className="quiz-question">
              <p>{index + 1}. {item.question} ({item.difficulty})</p>

              {item.type === 'mcq' && item.options && (
                <div className="options">
                  {item.options.map((option, oidx) => (
                    <button
                      key={oidx}
                      className={answerStates[index] && answerStates[index].selected === oidx ? 'selected' : ''}
                      onClick={() => onAnswerQuestion(index, item, oidx)}
                      disabled={answerStates[index]?.answered}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {item.type === 'short' && (
                <div className="short-answer">
                  <input
                    type="text"
                    value={shortAnswers[index] || ''}
                    onChange={e => handleShortAnswerChange(index, e.target.value)}
                    disabled={answerStates[index]?.answered}
                  />
                  <button
                    onClick={() => onAnswerQuestion(index, item, shortAnswers[index] || '')}
                    disabled={answerStates[index]?.answered}
                  >
                    Submit
                  </button>
                </div>
              )}

              {answerStates[index] && (
                <p className={answerStates[index].correct ? 'feedback-correct' : 'feedback-incorrect'}>
                  {answerStates[index].message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SummaryPanel;
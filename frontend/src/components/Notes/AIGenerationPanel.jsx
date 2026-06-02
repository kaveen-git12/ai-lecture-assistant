import React from 'react';

function AIGenerationPanel({
  onGenerateSummary,
  onGenerateConcepts,
  onGenerateTopics,
  onGenerateStudyPlan,
  onGenerateExam,
  aiLoading,
  aiOutput
}) {
  return (
    <div className="tools-card">
      <div className="tools-card-title">AI Generate</div>
      <div className="ai-buttons-grid">
        <button className="ai-grid-button" onClick={onGenerateSummary} disabled={aiLoading}>Summary</button>
        <button className="ai-grid-button accent" onClick={onGenerateConcepts} disabled={aiLoading}>Concepts</button>
        <button className="ai-grid-button" onClick={onGenerateStudyPlan} disabled={aiLoading}>Study Plan</button>
        <button className="ai-grid-button outlined" onClick={onGenerateExam} disabled={aiLoading}>Exam Prep</button>
      </div>

      {aiLoading && (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      )}

      <div className="ai-output-card">
        {aiOutput.summary && (
          <div className="ai-output-block">
            <h4>Summary</h4>
            <p>{aiOutput.summary}</p>
          </div>
        )}
        {aiOutput.concepts?.length > 0 && (
          <div className="ai-output-block">
            <h4>Key Concepts</h4>
            <ul>
              {aiOutput.concepts.map((concept) => (
                <li key={concept}>{concept}</li>
              ))}
            </ul>
          </div>
        )}
        {aiOutput.topics?.length > 0 && (
          <div className="ai-output-block">
            <h4>Topics</h4>
            <ul>
              {aiOutput.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </div>
        )}
        {aiOutput.studyPlan && (
          <div className="ai-output-block">
            <h4>Study Plan</h4>
            <p>{aiOutput.studyPlan}</p>
          </div>
        )}
        {aiOutput.examPrediction && (
          <div className="ai-output-block">
            <h4>Exam Prediction</h4>
            <p>{aiOutput.examPrediction}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIGenerationPanel;

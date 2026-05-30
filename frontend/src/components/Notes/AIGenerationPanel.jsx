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
    <section className="notes-panel ai-generation-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">AI Generation</div>
          <div className="panel-subtitle">Create summaries, concepts, and study plans from your notes.</div>
        </div>
      </div>

      <div className="ai-buttons">
        <button className="control-button" onClick={onGenerateSummary} disabled={aiLoading}>Summary</button>
        <button className="control-button" onClick={onGenerateConcepts} disabled={aiLoading}>Key Concepts</button>
        <button className="control-button" onClick={onGenerateTopics} disabled={aiLoading}>Topic Extraction</button>
        <button className="control-button" onClick={onGenerateStudyPlan} disabled={aiLoading}>Study Plan</button>
        <button className="control-button secondary" onClick={onGenerateExam} disabled={aiLoading}>Exam Prediction</button>
      </div>

      <div className="ai-output-card">
        {aiLoading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <div className="spinner-text">Generating AI insights...</div>
          </div>
        ) : (
          <>
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
            {!aiOutput.summary && !aiOutput.concepts?.length && !aiOutput.topics?.length && !aiOutput.studyPlan && !aiOutput.examPrediction && (
              <div className="preview-placeholder">
                <div className="preview-placeholder-icon">⚡</div>
                <p>Request a note insight to populate this panel.</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default AIGenerationPanel;

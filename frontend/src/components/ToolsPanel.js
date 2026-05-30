import React, { useState } from 'react';

function ToolsPanel({
  onExtractText,
  onGenerateSummary,
  onGenerateTopics,
  onGeneratePDF,
  onGenerateSmartPDF,
  onCompleteNotes,
  onGenerateStudyPlan,
  onGenerateExamPrediction,
  onNextSlide,
  onToggleAuto,
  isRunning
}) {
  const [subject, setSubject] = useState('');
  const [topics, setTopics] = useState('');

  return (
    <div className="right-panel">
      <h2>AI Tools</h2>

      <button onClick={onExtractText}>Extract Notes</button>
      <button onClick={onGenerateSummary}>Summary</button>
      <button onClick={onGenerateTopics}>Topics</button>
      <button onClick={onGeneratePDF}>PDF</button>
      <button onClick={onGenerateSmartPDF}>Smart PDF</button>
      <button onClick={onCompleteNotes}>Complete Notes</button>
      <button onClick={() => onGenerateStudyPlan(subject || 'General', 7)}>Study Plan</button>
      <button onClick={() => onGenerateExamPrediction(subject || 'General')}>Exam Predict</button>
      <button onClick={onNextSlide}>Next Slide</button>
      <button onClick={onToggleAuto}>{isRunning ? 'Pause Auto' : 'Resume Auto'}</button>

      <div className="meta-controls">
        <label>
          Subject: <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject name"
          />
        </label>
        <label>
          Topics: <input
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="comma-separated topics"
          />
        </label>
      </div>
    </div>
  );
}

export default ToolsPanel;
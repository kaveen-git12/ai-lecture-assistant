import React from 'react';

function OutputPanel({ slides, currentSlideIndex, extractedText, topicData, studyPlanText, examPredictionText }) {
  const renderSlidesOutput = () => {
    if (slides.length === 0) return "No slides captured yet.";

    return slides.map((slide, idx) => {
      const marker = idx === currentSlideIndex ? " (current)" : "";
      return `Slide ${idx + 1}${marker}`;
    }).join("\n");
  };

  return (
    <>
      {/* OUTPUT */}
      <div className="glass bottom-panel">
        <h2>Output</h2>
        <div>
          {extractedText || renderSlidesOutput()}
        </div>
      </div>

      {/* TOPICS */}
      <div className="glass bottom-panel">
        <h2>Topics</h2>
        <div>
          {topicData.map((topic, idx) => (
            <div key={idx} className="topic-card">
              <h3>{topic.title}</h3>
              {topic.image && <img src={topic.image} alt={topic.title} />}
              {topic.youtube && (
                <>
                  <br />
                  <a href={topic.youtube} target="_blank" rel="noopener noreferrer">Watch</a>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {studyPlanText && (
        <div className="glass bottom-panel">
          <h2>Study Plan</h2>
          <pre>{studyPlanText}</pre>
        </div>
      )}

      {examPredictionText && (
        <div className="glass bottom-panel">
          <h2>Exam Prediction</h2>
          <pre>{examPredictionText}</pre>
        </div>
      )}
    </>
  );
}

export default OutputPanel;
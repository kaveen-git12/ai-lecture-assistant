import React from 'react';

function CapturePanel({
  videoRef,
  isRecording,
  isPaused,
  onStartCamera,
  onStopCamera,
  onCaptureSlide,
  onTogglePause,
  sensitivity,
  onSensitivityChange,
  sessionMessage
}) {
  return (
    <section className="live-session-panel capture-section">
      <div className="panel-header">
        <div>
          <div className="panel-title">Live Capture</div>
          <div className="panel-subtitle">Camera capture, smart slide detection, and session controls.</div>
        </div>
        <span className="panel-subtitle">{sessionMessage}</span>
      </div>

      <div className="capture-card">
        <video ref={videoRef} muted playsInline />
        <div className="capture-overlay" />
        <div className="control-group capture-controls">
          <button className="control-button" onClick={onStartCamera} disabled={isRecording}>Start Camera</button>
          <button className="control-button danger" onClick={onStopCamera} disabled={!isRecording}>Stop Camera</button>
          <button className="control-button secondary" onClick={onCaptureSlide} disabled={!isRecording}>Capture Slide</button>
          <button className="control-button secondary" onClick={onTogglePause} disabled={!isRecording}>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      <div className="panel-subtitle">Smart slide sensitivity</div>
      <input
        className="slider-input"
        type="range"
        min="5"
        max="40"
        value={sensitivity}
        onChange={(e) => onSensitivityChange(Number(e.target.value))}
      />
    </section>
  );
}

export default CapturePanel;

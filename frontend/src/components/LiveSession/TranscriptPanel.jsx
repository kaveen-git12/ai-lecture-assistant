import React, { useRef } from 'react';

function TranscriptPanel({ liveTranscript, onUploadAudio, transcriptLoading }) {
  const fileInputRef = useRef(null);

  return (
    <section className="live-session-panel transcript-section">
      <div className="panel-header">
        <div>
          <div className="panel-title">Transcript & Audio Notes</div>
          <div className="panel-subtitle">Upload audio or review live transcript updates.</div>
        </div>
        <button className="control-button secondary" onClick={() => fileInputRef.current?.click()}>
          Upload Lecture Audio
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        hidden
        onChange={(e) => onUploadAudio(e.target.files?.[0])}
      />

      <div className="transcript-preview">
        {transcriptLoading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <div className="spinner-text">Processing audio...</div>
          </div>
        ) : liveTranscript.length === 0 ? (
          <div className="preview-placeholder">
            <div className="preview-placeholder-icon">🎙️</div>
            <p>No transcript yet. Upload lecture audio to create one.</p>
          </div>
        ) : (
          <div className="transcript-list">
            {liveTranscript.map((line, index) => (
              <div className="transcript-line" key={`${line.timestamp}-${index}`}>
                <span>{line.timestamp}</span>
                <p>{line.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default TranscriptPanel;

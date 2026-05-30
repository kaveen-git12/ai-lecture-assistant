import React from 'react';

function SubtitlePanel({ subtitleLanguage, languages, subtitleOutput, onLanguageChange, onExport, loading }) {
  return (
    <section className="live-session-panel subtitle-section">
      <div className="panel-header">
        <div>
          <div className="panel-title">Subtitle Panel</div>
          <div className="panel-subtitle">Select a language and export on-demand captions.</div>
        </div>
        <select
          className="language-select"
          value={subtitleLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
        >
          {languages.map((language) => (
            <option value={language.value} key={language.value}>{language.label}</option>
          ))}
        </select>
      </div>

      <div className="subtitle-preview">
        {loading ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <div className="spinner-text">Loading subtitles...</div>
          </div>
        ) : subtitleOutput.length === 0 ? (
          <div className="preview-placeholder">
            <div className="preview-placeholder-icon">💬</div>
            <p>No subtitles available yet. Play the session or upload a transcript.</p>
          </div>
        ) : (
          <ul className="subtitle-list">
            {subtitleOutput.map((line, index) => (
              <li key={`${line.start}-${index}`} className="subtitle-line">
                <strong>{line.start}</strong>
                <span>{line.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="control-button secondary" onClick={() => onExport(subtitleLanguage)} disabled={subtitleOutput.length === 0}>
        Export Subtitles
      </button>
    </section>
  );
}

export default SubtitlePanel;

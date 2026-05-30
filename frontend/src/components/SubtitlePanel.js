import React, { useState, useEffect } from 'react';

function SubtitlePanel() {
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState(null);
  const [translations, setTranslations] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [keyMoments, setKeyMoments] = useState([]);
  const [loading, setLoading] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' }
  ];

  useEffect(() => {
    fetchSubtitles();
    fetchKeyMoments();
  }, []);

  const fetchSubtitles = async () => {
    try {
      const token = localStorage.getItem('token');
      const lectureId = localStorage.getItem('currentLectureId');

      if (!lectureId) return;

      const res = await fetch(`/api/subtitles/${lectureId}?format=json`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      setSubtitles(data.json.subtitles || []);
    } catch (error) {
      console.error('Failed to fetch subtitles:', error);
    }
  };

  const fetchKeyMoments = async () => {
    try {
      const token = localStorage.getItem('token');
      const lectureId = localStorage.getItem('currentLectureId');

      if (!lectureId) return;

      const res = await fetch(`/api/subtitles/${lectureId}/key-moments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      setKeyMoments(data.highlights || []);
    } catch (error) {
      console.error('Failed to fetch key moments:', error);
    }
  };

  const translateSubtitles = async (language) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const lectureId = localStorage.getItem('currentLectureId');

      const res = await fetch(`/api/subtitles/${lectureId}/translate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetLanguage: language })
      });

      const data = await res.json();
      setTranslations(data.subtitles);
      setSelectedLanguage(language);
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportSubtitles = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const lectureId = localStorage.getItem('currentLectureId');

      const res = await fetch(`/api/subtitles/${lectureId}/export/${format}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subtitles.${format === 'webvtt' ? 'vtt' : format}`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const displaySubtitles = selectedLanguage === 'en' ? subtitles : translations;

  return (
    <div className="subtitle-panel glass">
      <h3>🗣️ Real-Time Subtitles</h3>

      {/* Translation Controls */}
      <div className="translation-controls">
        <h4>🌍 Translate to:</h4>
        <div className="language-buttons">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`lang-btn ${selectedLanguage === lang.code ? 'active' : ''}`}
              onClick={() => translateSubtitles(lang.code)}
              disabled={loading}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="export-controls">
        <h4>📥 Export As:</h4>
        <button className="btn-small" onClick={() => exportSubtitles('srt')}>SRT</button>
        <button className="btn-small" onClick={() => exportSubtitles('vtt')}>WebVTT</button>
        <button className="btn-small" onClick={() => exportSubtitles('json')}>JSON</button>
      </div>

      {/* Subtitles Display */}
      <div className="subtitles-container">
        <div className="subtitle-list">
          {displaySubtitles.map((sub, idx) => (
            <div
              key={idx}
              className={`subtitle-item ${keyMoments.some(k => Math.abs(k.timestamp - sub.start) < 1) ? 'highlight' : ''}`}
              onClick={() => setCurrentSubtitle(sub)}
            >
              <span className="timestamp">{formatTime(sub.start)}</span>
              <span className="text">{sub.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Moments */}
      {keyMoments.length > 0 && (
        <div className="key-moments">
          <h4>⭐ Key Moments</h4>
          {keyMoments.map((moment, idx) => (
            <div key={idx} className="key-moment">
              <strong>{moment.keyword}</strong>
              <p>Importance: {'⭐'.repeat(moment.importance)}</p>
              <small>{formatTime(moment.timestamp)}</small>
            </div>
          ))}
        </div>
      )}

      {/* Current Subtitle Detail */}
      {currentSubtitle && (
        <div className="current-subtitle glass">
          <h4>Current</h4>
          <div className="subtitle-detail">
            <time>{formatTime(currentSubtitle.start)} - {formatTime(currentSubtitle.end)}</time>
            <p>{currentSubtitle.text}</p>
            <small>Confidence: {(currentSubtitle.confidence * 100).toFixed(1)}%</small>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default SubtitlePanel;

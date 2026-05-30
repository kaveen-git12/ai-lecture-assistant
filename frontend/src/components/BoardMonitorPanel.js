import React, { useState, useEffect, useRef } from 'react';

/**
 * BoardMonitorPanel
 * =================
 * Controls the Python board_monitor.py process from the frontend and
 * displays captured board images in a gallery. Users can import captures
 * directly into the slide deck.
 */
function BoardMonitorPanel({ onImportSlide }) {
  const [status, setStatus] = useState('stopped');       // running | stopped | error
  const [captures, setCaptures] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const pollRef = useRef(null);

  // Poll for status and captures while running
  useEffect(() => {
    fetchStatus();
    fetchCaptures();

    pollRef.current = setInterval(() => {
      fetchStatus();
      fetchCaptures();
    }, 3000);

    return () => clearInterval(pollRef.current);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/board-monitor/status');
      const data = await res.json();
      setStatus(data.status);
      setLogs(data.logs || []);
    } catch {
      setStatus('error');
    }
  };

  const fetchCaptures = async () => {
    try {
      const res = await fetch('/api/board-monitor/captures');
      const data = await res.json();
      setCaptures(data.captures || []);
    } catch {}
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      await fetch('/api/board-monitor/start', { method: 'POST' });
      await fetchStatus();
    } catch (err) {
      console.error('Start error:', err);
    }
    setLoading(false);
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await fetch('/api/board-monitor/stop', { method: 'POST' });
      await fetchStatus();
    } catch (err) {
      console.error('Stop error:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (filename) => {
    try {
      await fetch(`/api/board-monitor/captures/${filename}`, { method: 'DELETE' });
      await fetchCaptures();
      if (selectedImage === filename) setSelectedImage(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleImport = async (filename) => {
    try {
      const res = await fetch(`/api/board-monitor/captures/import/${filename}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && onImportSlide) {
        onImportSlide({ image: data.image });
      }
    } catch (err) {
      console.error('Import error:', err);
    }
  };

  const getTriggerBadge = (type) => {
    const badges = {
      slide_change: { label: 'Slide Change', className: 'badge-slide' },
      full_erase: { label: 'Full Erase', className: 'badge-erase' },
      new_content: { label: 'New Content', className: 'badge-content' },
      manual: { label: 'Manual', className: 'badge-manual' },
    };
    return badges[type] || { label: type, className: 'badge-default' };
  };

  const isRunning = status === 'running';

  return (
    <div className="board-monitor-panel">
      {/* ── Header & Controls ── */}
      <div className="bm-header">
        <div className="bm-title-row">
          <div className="bm-icon-wrap">
            <svg viewBox="0 0 24 24" className="bm-icon">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div>
            <div className="bm-title">Board Monitor</div>
            <div className="bm-subtitle">Auto-captures board changes via AI</div>
          </div>
        </div>

        <div className="bm-controls">
          <div className={`bm-status-badge ${isRunning ? 'running' : 'stopped'}`}>
            <span className="bm-status-dot" />
            {isRunning ? 'Running' : 'Stopped'}
          </div>
          {!isRunning ? (
            <button
              className="bm-btn bm-btn-start"
              onClick={handleStart}
              disabled={loading}
            >
              {loading ? 'Starting...' : 'Start Monitor'}
            </button>
          ) : (
            <button
              className="bm-btn bm-btn-stop"
              onClick={handleStop}
              disabled={loading}
            >
              {loading ? 'Stopping...' : 'Stop Monitor'}
            </button>
          )}
        </div>
      </div>

      {/* ── Captures Gallery ── */}
      <div className="bm-section">
        <div className="bm-section-header">
          <span className="bm-section-title">
            Captured Images ({captures.length})
          </span>
          <button className="bm-btn-text" onClick={fetchCaptures}>
            Refresh
          </button>
        </div>

        {captures.length === 0 ? (
          <div className="bm-empty">
            <div className="bm-empty-icon">📸</div>
            <div className="bm-empty-text">
              {isRunning
                ? 'Waiting for board changes...'
                : 'Start the monitor to begin capturing board images'}
            </div>
          </div>
        ) : (
          <div className="bm-gallery">
            {captures.map((cap) => {
              const badge = getTriggerBadge(cap.triggerType);
              return (
                <div
                  key={cap.filename}
                  className={`bm-capture-card ${selectedImage === cap.filename ? 'selected' : ''}`}
                  onClick={() =>
                    setSelectedImage(
                      selectedImage === cap.filename ? null : cap.filename
                    )
                  }
                >
                  <div className="bm-capture-img-wrap">
                    <img
                      src={cap.url}
                      alt={cap.filename}
                      className="bm-capture-img"
                      loading="lazy"
                    />
                    <span className={`bm-trigger-badge ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="bm-capture-info">
                    <span className="bm-capture-time">
                      {new Date(cap.createdAt).toLocaleTimeString()}
                    </span>
                    <div className="bm-capture-actions">
                      <button
                        className="bm-action-btn import"
                        title="Import to slides"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImport(cap.filename);
                        }}
                      >
                        + Slide
                      </button>
                      <button
                        className="bm-action-btn delete"
                        title="Delete capture"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(cap.filename);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {selectedImage && (
        <div className="bm-lightbox" onClick={() => setSelectedImage(null)}>
          <div className="bm-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <img
              src={`/api/board-monitor/captures/file/${selectedImage}`}
              alt="Capture preview"
              className="bm-lightbox-img"
            />
            <div className="bm-lightbox-bar">
              <span>{selectedImage}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="bm-btn bm-btn-start"
                  onClick={() => handleImport(selectedImage)}
                >
                  Import to Slides
                </button>
                <button
                  className="bm-btn bm-btn-stop"
                  onClick={() => setSelectedImage(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Logs ── */}
      {isRunning && logs.length > 0 && (
        <div className="bm-section">
          <div className="bm-section-title">Recent Logs</div>
          <div className="bm-logs">
            {logs.slice(-8).map((log, i) => (
              <div key={i} className="bm-log-line">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BoardMonitorPanel;

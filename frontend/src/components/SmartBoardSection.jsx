import React from 'react';

export default function SmartBoardSection({ onLaunch }) {
  const handleLaunch = async () => {
    if (document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (error) {
        console.warn('Unable to enter fullscreen mode', error);
      }
    }
    if (typeof onLaunch === 'function') {
      onLaunch();
    }
  };

  return (
    <section className="settings-card glow-border">
      <div className="settings-card-header">
        <div>
          <div className="settings-card-title">🧠 Smart Board</div>
          <div className="settings-card-subtitle">Launch the board in presentation mode</div>
        </div>
      </div>
      <p className="settings-card-description">
        Open Smart Board mode for a fullscreen lecture presentation with real-time annotations and slide capture.
      </p>
      <button className="settings-button" type="button" onClick={handleLaunch}>
        Launch Smart Board
      </button>
    </section>
  );
}

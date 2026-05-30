import React, { useState } from 'react';

function SessionControls({ muted, cameraOn, onToggleMute, onToggleCamera, onLeaveRoom }) {
  const [sharing, setSharing] = useState(false);

  return (
    <div className="session-controls-bar">
      <button type="button" className={`control-button ${muted ? 'danger' : 'accent'}`} onClick={onToggleMute}>
        {muted ? 'Unmute' : 'Mute'}
      </button>
      <button type="button" className={`control-button ${cameraOn ? 'accent' : 'danger'}`} onClick={onToggleCamera}>
        {cameraOn ? 'Camera Off' : 'Camera On'}
      </button>
      <button
        type="button"
        className={`control-button ${sharing ? 'accent' : ''}`}
        onClick={() => setSharing((prev) => !prev)}
      >
        {sharing ? 'Stop Share' : 'Share Screen'}
      </button>
      <button type="button" className="control-button leave" onClick={onLeaveRoom}>
        Leave Room
      </button>
    </div>
  );
}

export default SessionControls;

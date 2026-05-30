import React from 'react';

function VideoGrid({ participants, localId }) {
  return (
    <section className="video-grid-panel">
      <div className="panel-title">Video Grid</div>
      <div className="video-grid">
        {participants.map((participant) => (
          <div key={participant.id} className={`video-tile ${participant.id === localId ? 'local' : ''}`}>
            <div className="participant-avatar">{participant.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
            <div className="participant-name">{participant.name}</div>
            <div className="participant-status">
              <span className={`status-pill ${participant.muted ? 'muted' : 'active'}`}>{participant.muted ? 'Muted' : 'Mic'}</span>
              <span className={`status-pill ${participant.cameraOn ? 'active' : 'muted'}`}>{participant.cameraOn ? 'Camera' : 'Off'}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default VideoGrid;

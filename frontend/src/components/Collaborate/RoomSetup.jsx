import React, { useState } from 'react';

function RoomSetup({ roomCode, onCreateRoom, onJoinRoom, loading }) {
  const [joinCode, setJoinCode] = useState('');

  return (
    <section className="room-setup-panel">
      <div className="panel-title">Room Setup</div>
      <button type="button" className="control-button accent" onClick={onCreateRoom} disabled={loading}>
        {loading ? 'Creating…' : 'Create Room'}
      </button>
      {roomCode && <div className="generated-room">Room Code: <strong>{roomCode}</strong></div>}
      <div className="join-room-row">
        <input
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Enter room code"
        />
        <button type="button" className="control-button" onClick={() => onJoinRoom(joinCode)}>
          Join
        </button>
      </div>
    </section>
  );
}

export default RoomSetup;

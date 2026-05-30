import React, { useState, useEffect, useRef } from 'react';

const WebRTCPanel = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [sharing, setSharing] = useState(false);
  const [mediaState, setMediaState] = useState({ video: true, audio: true });
  const [loading, setLoading] = useState(false);
  const videoGridRef = useRef();

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const response = await fetch('/api/webrtc/sessions/active', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const createSession = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/webrtc/session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionName: 'Study Session',
          description: 'Collaborative learning'
        })
      });
      const data = await response.json();
      setCurrentSession(data);
      
      // Track session creation in history
      await trackSessionHistory('create');
      
      await copyToClipboard(data.publicLink);
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async (sessionId) => {
    try {
      const response = await fetch('/api/webrtc/join', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          userName: localStorage.getItem('userName') || 'Anonymous',
          peerId: `peer-${Date.now()}`
        })
      });
      const data = await response.json();
      setCurrentSession({ sessionId, ...data });
      setParticipants(data.participants);
      
      // Track session join in history
      await trackSessionHistory('join');
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };

  const toggleMedia = async (type) => {
    try {
      const newState = { ...mediaState, [type]: !mediaState[type] };
      setMediaState(newState);
      
      if (currentSession?.sessionId) {
        await fetch('/api/webrtc/media', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sessionId: currentSession.sessionId,
            videoEnabled: newState.video,
            audioEnabled: newState.audio
          })
        });
      }
    } catch (error) {
      console.error('Error toggling media:', error);
    }
  };

  const startScreenShare = async () => {
    try {
      if (currentSession?.sessionId) {
        await fetch('/api/webrtc/screen-share/start', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId: currentSession.sessionId })
        });
        setSharing(true);
      }
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  const stopScreenShare = async () => {
    try {
      if (currentSession?.sessionId) {
        await fetch('/api/webrtc/screen-share/stop', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId: currentSession.sessionId })
        });
        setSharing(false);
      }
    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    try {
      if (currentSession?.sessionId) {
        await fetch('/api/webrtc/chat', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sessionId: currentSession.sessionId,
            userName: localStorage.getItem('userName') || 'You',
            message: currentMessage
          })
        });
        
        setMessages([...messages, {
          userName: 'You',
          message: currentMessage,
          timestamp: new Date().toLocaleTimeString()
        }]);
        setCurrentMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Session link copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const leaveSession = async () => {
    try {
      if (currentSession?.sessionId) {
        // Track session end with history
        await trackSessionHistory('leave');
        
        await fetch('/api/webrtc/leave', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId: currentSession.sessionId })
        });
      }
      setCurrentSession(null);
      setParticipants([]);
      setMessages([]);
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  };

  const trackSessionHistory = async (action) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/webrtc/history', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: currentSession?.sessionId,
          action: action,
          participantCount: participants.length,
          messageCount: messages.length,
          duration: currentSession?.duration || 0,
          timestamp: new Date()
        })
      });
    } catch (error) {
      console.error('Error tracking session history:', error);
    }
  };

  if (!currentSession) {
    return (
      <div className="webrtc-panel glass-panel">
        <div className="panel-header">
          <h2>🎥 Live Collaboration</h2>
        </div>

        <div className="session-list">
          <button className="create-btn" onClick={createSession} disabled={loading}>
            {loading ? 'Creating...' : '➕ Create New Session'}
          </button>

          {sessions.length > 0 && (
            <div className="active-sessions">
              <h3>Active Sessions</h3>
              {sessions.map(session => (
                <div key={session.sessionId} className="session-item">
                  <div className="session-info">
                    <span className="session-name">{session.sessionName}</span>
                    <span className="participants-count">👥 {session.participants} participants</span>
                  </div>
                  <button 
                    className="join-btn"
                    onClick={() => joinSession(session.sessionId)}
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          .webrtc-panel {
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .session-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }

          .create-btn {
            padding: 12px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            color: white;
            border-radius: 10px;
            cursor: pointer;
            font-weight: bold;
            font-size: 1rem;
            transition: all 0.3s;
          }

          .create-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
          }

          .create-btn:disabled {
            opacity: 0.6;
          }

          .active-sessions {
            margin-top: 10px;
          }

          .session-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255, 255, 255, 0.08);
            padding: 12px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 8px;
          }

          .session-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .session-name {
            color: #fff;
            font-weight: bold;
          }

          .participants-count {
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.9rem;
          }

          .join-btn {
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
          }

          .join-btn:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="webrtc-panel-active glass-panel">
      <div className="panel-header">
        <h2>🎥 Live Session</h2>
        <button className="close-btn" onClick={leaveSession}>✕ Leave</button>
      </div>

      <div className="session-content">
        <div className="video-section">
          <div className="video-grid" ref={videoGridRef}>
            {participants.map((participant, idx) => (
              <div key={idx} className="video-item">
                <div className="video-placeholder">
                  <div className="participant-status">
                    <span className="status-indicator"></span>
                    Participant {idx + 1}
                  </div>
                </div>
                <div className="controls">
                  {participant.videoEnabled && <span>📹</span>}
                  {participant.audioEnabled && <span>🎤</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="local-video">
            <div className="video-placeholder">
              <div className="participant-status">You</div>
            </div>
          </div>

          <div className="session-controls">
            <button 
              className={`control-btn ${mediaState.video ? '' : 'disabled'}`}
              onClick={() => toggleMedia('video')}
              title="Toggle Video"
            >
              {mediaState.video ? '📹' : '🚫'}
            </button>
            <button 
              className={`control-btn ${mediaState.audio ? '' : 'disabled'}`}
              onClick={() => toggleMedia('audio')}
              title="Toggle Audio"
            >
              {mediaState.audio ? '🎤' : '🚫'}
            </button>
            <button 
              className={`control-btn ${sharing ? 'active' : ''}`}
              onClick={sharing ? stopScreenShare : startScreenShare}
              title="Screen Share"
            >
              {sharing ? '🛑 Stop Share' : '📺 Share Screen'}
            </button>
            <button className="copy-link-btn" onClick={() => copyToClipboard(`https://yourdomain.com/join/${currentSession.sessionId}`)}>
              🔗 Copy Link
            </button>
          </div>
        </div>

        <div className="chat-section">
          <div className="chat-header">💬 Chat</div>
          <div className="messages">
            {messages.map((msg, idx) => (
              <div key={idx} className="message">
                <span className="sender">{msg.userName}</span>
                <span className="text">{msg.message}</span>
                <span className="time">{msg.timestamp}</span>
              </div>
            ))}
          </div>
          <div className="message-input">
            <input 
              type="text" 
              placeholder="Type a message..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .webrtc-panel-active {
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          height: 100%;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .close-btn {
          padding: 8px 16px;
          background: rgba(255, 107, 107, 0.3);
          border: 1px solid rgba(255, 107, 107, 0.5);
          color: #ff6b6b;
          border-radius: 8px;
          cursor: pointer;
        }

        .session-content {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 15px;
          flex: 1;
        }

        .video-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          flex: 1;
          min-height: 250px;
        }

        .video-item {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          position: relative;
          overflow: hidden;
        }

        .video-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
        }

        .participant-status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #fff;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #51cf66;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .controls {
          position: absolute;
          bottom: 8px;
          right: 8px;
          display: flex;
          gap: 4px;
        }

        .local-video {
          height: 120px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .session-controls {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .control-btn {
          padding: 10px 15px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 1rem;
        }

        .control-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .control-btn.disabled {
          background: rgba(255, 107, 107, 0.2);
          border-color: rgba(255, 107, 107, 0.5);
        }

        .control-btn.active {
          background: rgba(102, 126, 234, 0.3);
          border-color: rgba(102, 126, 234, 0.5);
        }

        .copy-link-btn {
          padding: 10px 15px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          border-radius: 8px;
          cursor: pointer;
        }

        .chat-section {
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 10px;
          gap: 10px;
        }

        .chat-header {
          font-weight: bold;
          color: #fff;
        }

        .messages {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-height: 200px;
        }

        .message {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 0.85rem;
        }

        .sender {
          font-weight: bold;
          color: #00d4ff;
        }

        .text {
          color: rgba(255, 255, 255, 0.8);
        }

        .time {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .message-input {
          display: flex;
          gap: 8px;
        }

        .message-input input {
          flex: 1;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: white;
          outline: none;
        }

        .message-input input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .message-input button {
          padding: 8px 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default WebRTCPanel;

import React, { useEffect, useMemo, useState } from 'react';
import collaborationService from '../services/collaborationService';
import RoomSetup from './Collaborate/RoomSetup';
import VideoGrid from './Collaborate/VideoGrid';
import SessionControls from './Collaborate/SessionControls';
import CollabNotes from './Collaborate/CollabNotes';
import ChatSidebar from './Collaborate/ChatSidebar';
import SharingPanel from './Collaborate/SharingPanel';
import StudyGroups from './Collaborate/StudyGroups';
import './Collaborate.css';

function Collaborate() {
  const [view, setView] = useState('lobby');
  const [roomCode, setRoomCode] = useState('');
  const [participants, setParticipants] = useState([]);
  const [localUser, setLocalUser] = useState({ id: 'me', name: 'You', muted: false, cameraOn: true });
  const [sharingOptions, setSharingOptions] = useState({ access: 'edit', expiry: '' });
  const [links, setLinks] = useState([]);
  const [notes, setNotes] = useState('Start taking shared notes with your group...');
  const [chatMessages, setChatMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [meeting, setMeeting] = useState({ date: '', time: '' });
  const [status, setStatus] = useState('Ready to collaborate.');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await collaborationService.getGroups();
      setGroups(res.groups || res || []);
    } catch (err) {
      console.error('Unable to load groups', err);
    }
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const res = await collaborationService.createRoom({ topic: 'Study Session' });
      const code = res.roomCode || `R${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      setRoomCode(code);
      setView('active');
      setParticipants([{ ...localUser, isLocal: true }, { id: 'p2', name: 'Alex', muted: false, cameraOn: true }]);
      setStatus(`Room ${code} created. Waiting for others to join.`);
    } catch (err) {
      console.error('Unable to create room', err);
      setStatus('Unable to create room. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (code) => {
    setLoading(true);
    try {
      await collaborationService.joinRoom({ roomCode: code });
      setRoomCode(code);
      setView('active');
      setParticipants([{ ...localUser, isLocal: true }, { id: 'p2', name: 'Maya', muted: true, cameraOn: false }]);
      setStatus(`Joined room ${code}.`);
    } catch (err) {
      console.error('Unable to join room', err);
      setStatus('Join failed. Check the room code.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    setLoading(true);
    try {
      await collaborationService.leaveRoom({ roomCode });
      setRoomCode('');
      setParticipants([]);
      setView('lobby');
      setStatus('Left the room. Back to lobby.');
    } catch (err) {
      console.error('Unable to leave room', err);
      setStatus('Unable to leave room cleanly.');
    } finally {
      setLoading(false);
    }
  };

  const handleShareLink = async () => {
    setLoading(true);
    try {
      const res = await collaborationService.shareLink({ access: sharingOptions.access, expiry: sharingOptions.expiry });
      setLinks((prev) => [res.link || `https://app.example.com/collab/${roomCode}`, ...prev]);
      setStatus('Share link generated.');
    } catch (err) {
      console.error('Unable to generate share link', err);
      setStatus('Link generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageSend = (text) => {
    if (!text.trim()) return;
    setChatMessages((prev) => [...prev, { id: Date.now(), sender: localUser.name, text, time: new Date().toLocaleTimeString() }]);
  };

  const handleInviteMember = async (email) => {
    try {
      await collaborationService.inviteMember({ email });
      setStatus(`Invite sent to ${email}.`);
    } catch (err) {
      console.error('Invite failed', err);
      setStatus('Unable to send invite.');
    }
  };

  const handleCreateGroup = async (name) => {
    try {
      const res = await collaborationService.createGroup({ name });
      setGroups((prev) => [...prev, res.group || { id: Date.now(), name, members: [], resources: [] }]);
      setStatus(`Group ${name} created.`);
    } catch (err) {
      console.error('Group creation failed', err);
      setStatus('Unable to create group.');
    }
  };

  const handleScheduleMeeting = async () => {
    if (!meeting.date || !meeting.time) {
      setStatus('Pick a meeting date and time first.');
      return;
    }

    try {
      await collaborationService.scheduleMeeting({ date: meeting.date, time: meeting.time });
      setStatus(`Meeting scheduled for ${meeting.date} ${meeting.time}.`);
    } catch (err) {
      console.error('Schedule meeting failed', err);
      setStatus('Unable to schedule meeting.');
    }
  };

  const localParticipant = useMemo(() => participants.find((person) => person.isLocal), [participants]);

  return (
    <div className="collaborate-root">
      <header className="collaborate-header">
        <div>
          <h1>Collaborate</h1>
          <p>Launch study rooms, share resources, and collaborate live with your peers.</p>
        </div>
        <div className="room-status">{status}</div>
      </header>

      {view === 'lobby' ? (
        <div className="collaborate-lobby">
          <div className="lobby-grid">
            <RoomSetup
              roomCode={roomCode}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              loading={loading}
            />
            <SharingPanel
              options={sharingOptions}
              links={links}
              onChangeOptions={setSharingOptions}
              onGenerateLink={handleShareLink}
              onExpiryChange={(expiry) => setSharingOptions((prev) => ({ ...prev, expiry }))}
            />
          </div>
          <StudyGroups
            groups={groups}
            onCreateGroup={handleCreateGroup}
            onInvite={handleInviteMember}
            meeting={meeting}
            onMeetingChange={setMeeting}
            onScheduleMeeting={handleScheduleMeeting}
          />
        </div>
      ) : (
        <div className="collaborate-session">
          <div className="session-grid">
            <VideoGrid participants={participants} localId={localParticipant?.id} />
            <CollabNotes notes={notes} onChangeNotes={setNotes} participants={participants} />
          </div>
          <SessionControls
            muted={localUser.muted}
            cameraOn={localUser.cameraOn}
            onToggleMute={() => setLocalUser((prev) => ({ ...prev, muted: !prev.muted }))}
            onToggleCamera={() => setLocalUser((prev) => ({ ...prev, cameraOn: !prev.cameraOn }))}
            onLeaveRoom={handleLeaveRoom}
          />
          <ChatSidebar messages={chatMessages} onSendMessage={handleMessageSend} />
        </div>
      )}
    </div>
  );
}

export default Collaborate;

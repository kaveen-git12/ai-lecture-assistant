const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/auth').authMiddleware;
const {
  createSession,
  addParticipant,
  removeParticipant,
  updateParticipantMedia,
  startScreenShare,
  stopScreenShare,
  addSynchronizedNote,
  addChatMessage,
  addReaction,
  updateCursorPosition,
  endSession,
  getSession,
  getUserActiveSessions
} = require('../utils/webrtcSignaling');

// Create new collaboration session
router.post('/session', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { lectureId, sessionName, description } = req.body;
    
    if (!lectureId) {
      return res.status(400).json({ error: 'Missing lectureId' });
    }
    
    const session = await createSession(lectureId, userId, sessionName || 'Study Session', description || '');
    
    res.json({
      success: true,
      sessionId: session.sessionId,
      publicLink: `share/${session.sessionId}`,
      iceServers: session.iceServers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get session details
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({
      sessionId: session.sessionId,
      sessionName: session.sessionName,
      status: session.status,
      participants: session.participants.map(p => ({
        userId: p.userId,
        role: p.role,
        isActive: p.isActive,
        videoEnabled: p.videoEnabled,
        audioEnabled: p.audioEnabled,
        screenShare: p.screenShare
      })),
      isRecording: session.isRecording,
      settings: session.settings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join session (add participant)
router.post('/join', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId, userName, peerId } = req.body;
    
    if (!sessionId || !peerId) {
      return res.status(400).json({ error: 'Missing session or peer ID' });
    }
    
    const session = await addParticipant(sessionId, userId, userName || 'Anonymous', peerId);
    
    res.json({
      success: true,
      participants: session.participants,
      iceServers: session.iceServers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leave session (remove participant)
router.post('/leave', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }
    
    const session = await removeParticipant(sessionId, userId);
    
    res.json({
      success: true,
      sessionStatus: session.status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update media status
router.post('/media', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId, videoEnabled, audioEnabled } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }
    
    const participant = await updateParticipantMedia(sessionId, userId, videoEnabled, audioEnabled);
    
    res.json({
      success: true,
      videoEnabled: participant.videoEnabled,
      audioEnabled: participant.audioEnabled
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start screen share
router.post('/screen-share/start', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }
    
    const session = await startScreenShare(sessionId, userId);
    
    res.json({
      success: true,
      screenShareing: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop screen share
router.post('/screen-share/stop', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }
    
    const session = await stopScreenShare(sessionId, userId);
    
    res.json({
      success: true,
      screenSharing: false
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add synchronized note
router.post('/note', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId, content, timestamp, cursorPosition } = req.body;
    
    if (!sessionId || !content) {
      return res.status(400).json({ error: 'Missing session or content' });
    }
    
    const session = await addSynchronizedNote(sessionId, userId, content, timestamp || 0, cursorPosition || 0);
    
    res.json({
      success: true,
      notesCount: session.synchronizedNotes.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add chat message
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId, userName, message, attachments } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Missing session or message' });
    }
    
    const session = await addChatMessage(sessionId, userId, userName || 'Anonymous', message, attachments || []);
    
    res.json({
      success: true,
      messagesCount: session.chatMessages.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat messages
router.get('/chat/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session.chatMessages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add emoji reaction
router.post('/reaction', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId, emoji } = req.body;
    
    if (!sessionId || !emoji) {
      return res.status(400).json({ error: 'Missing session or emoji' });
    }
    
    const session = await addReaction(sessionId, userId, emoji);
    
    res.json({
      success: true,
      reactionsCount: session.reactions.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update cursor position (for collaborative drawing/annotations)
router.post('/cursor', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { sessionId, x, y } = req.body;
    
    if (!sessionId || x === undefined || y === undefined) {
      return res.status(400).json({ error: 'Missing position data' });
    }
    
    const position = await updateCursorPosition(sessionId, userId, x, y);
    
    res.json({
      success: true,
      cursorPosition: position
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End session
router.post('/session/:sessionId/end', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await endSession(sessionId);
    
    res.json({
      success: true,
      duration: session.duration,
      participantCount: session.participants.length,
      msgsCount: session.chatMessages.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's active sessions
router.get('/sessions/active', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const sessions = await getUserActiveSessions(userId);
    
    res.json(sessions.map(s => ({
      sessionId: s.sessionId,
      sessionName: s.sessionName,
      participants: s.participants.length,
      startedAt: s.startedAt
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

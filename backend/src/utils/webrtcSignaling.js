const CollaborationSession = require('../models/CollaborationSession');
const { v4: uuidv4 } = require('uuid');

// Create a new WebRTC collaboration session
async function createSession(lectureId, hostId, sessionName, description) {
  try {
    const sessionId = uuidv4();
    
    const session = new CollaborationSession({
      sessionId,
      lectureId,
      host: hostId,
      sessionName,
      description,
      status: 'scheduled',
      iceServers: [
        {
          urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302']
        }
      ],
      settings: {
        maxParticipants: 50,
        requireApproval: false,
        allowScreenShare: true,
        allowRecording: true,
        publicLink: `share/${sessionId}`
      }
    });
    
    await session.save();
    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

// Join session with WebRTC peer
async function addParticipant(sessionId, userId, userName, peerId) {
  try {
    const session = await CollaborationSession.findOne({ sessionId });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    // Check if participant already exists
    const existing = session.participants.find(p => p.userId.toString() === userId.toString());
    if (existing) {
      existing.isActive = true;
      existing.peerId = peerId;
      existing.joinedAt = new Date();
    } else {
      session.participants.push({
        userId,
        joinedAt: new Date(),
        role: userId.toString() === session.host.toString() ? 'presenter' : 'collaborator',
        isActive: true,
        peerId,
        videoEnabled: true,
        audioEnabled: true,
        screenShare: false,
        lastSeen: new Date()
      });
    }
    
    if (session.status === 'scheduled') {
      session.status = 'active';
      session.startedAt = new Date();
    }
    
    await session.save();
    return session;
  } catch (error) {
    console.error('Error adding participant:', error);
    throw error;
  }
}

// Remove participant
async function removeParticipant(sessionId, userId) {
  try {
    const session = await CollaborationSession.findOne({ sessionId });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    const participant = session.participants.find(p => p.userId.toString() === userId.toString());
    if (participant) {
      participant.isActive = false;
      participant.lastSeen = new Date();
    }
    
    // Check if any participants still active
    const activeParticipants = session.participants.filter(p => p.isActive);
    if (activeParticipants.length === 0) {
      session.status = 'ended';
      session.endedAt = new Date();
      session.duration = Math.round((session.endedAt - session.startedAt) / 1000);
    }
    
    await session.save();
    return session;
  } catch (error) {
    console.error('Error removing participant:', error);
    throw error;
  }
}

// Update participant media status
async function updateParticipantMedia(sessionId, userId, videoEnabled, audioEnabled) {
  try {
    const session = await CollaborationSession.findOne({ sessionId });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    const participant = session.participants.find(p => p.userId.toString() === userId.toString());
    if (participant) {
      participant.videoEnabled = videoEnabled;
      participant.audioEnabled = audioEnabled;
      participant.lastSeen = new Date();
    }
    
    await session.save();
    return participant;
  } catch (error) {
    console.error('Error updating participant media:', error);
    throw error;
  }
}

// Start screen share
async function startScreenShare(sessionId, userId) {
  try {
    const session = await CollaborationSession.findOne({ sessionId });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    const participant = session.participants.find(p => p.userId.toString() === userId.toString());
    if (participant) {
      participant.screenShare = true;
      
      // Only one screen share at a time - disable others
      session.participants.forEach(p => {
        if (p.userId.toString() !== userId.toString()) {
          p.screenShare = false;
        }
      });
    }
    
    // Add to screen share history
    session.screenShareHistory.push({
      userId,
      startTime: new Date()
    });
    
    await session.save();
    return session;
  } catch (error) {
    console.error('Error starting screen share:', error);
    throw error;
  }
}

// Stop screen share
async function stopScreenShare(sessionId, userId) {
  try {
    const session = await CollaborationSession.findOne({ sessionId });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    const participant = session.participants.find(p => p.userId.toString() === userId.toString());
    if (participant) {
      participant.screenShare = false;
    }
    
    // Update screen share history
    const lastShare = session.screenShareHistory[session.screenShareHistory.length - 1];
    if (lastShare && lastShare.userId.toString() === userId.toString() && !lastShare.endTime) {
      lastShare.endTime = new Date();
    }
    
    await session.save();
    return session;
  } catch (error) {
    console.error('Error stopping screen share:', error);
    throw error;
  }
}

// Add synchronized note
async function addSynchronizedNote(sessionId, userId, content, timestamp, cursorPosition) {
  try {
    const session = await CollaborationSession.findOne({ sessionId });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    session.synchronizedNotes.push({
      userId,
      content,
      timestamp,
      cursorPosition,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await session.save();
    return session;
  } catch (error) {
    console.error('Error adding synchronized note:', error);
    throw error;
  }
}

// Add chat message
async function addChatMessage(sessionId, userId, userName, message, attachments = []) {
  try {
    const session = await CollaborationSession.findOne({ sessionId });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    session.chatMessages.push({
      userId,
      userName,
      message,
      timestamp: new Date(),
      attachments
    });
    
    await session.save();
    return session;
  } catch (error) {
    console.error('Error adding chat message:', error);
    throw error;
  }
}

// Add emoji reaction
async function addReaction(sessionId, userId, emoji) {
  try {
    const session = await CollaborationSession.findOne({ sessionId });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    session.reactions.push({
      userId,
      emoji,
      timestamp: new Date()
    });
    
    await session.save();
    return session;
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
}

// Update cursor position
async function updateCursorPosition(sessionId, userId, x, y) {
  try {
    const session = await CollaborationSession.findOne({ sessionId });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    const participant = session.participants.find(p => p.userId.toString() === userId.toString());
    if (participant) {
      participant.cursorPosition = { x, y };
      participant.lastSeen = new Date();
      await session.save();
    }
    
    return participant?.cursorPosition;
  } catch (error) {
    console.error('Error updating cursor position:', error);
    throw error;
  }
}

// End session
async function endSession(sessionId) {
  try {
    const session = await CollaborationSession.findOne({ sessionId });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    session.status = 'ended';
    session.endedAt = new Date();
    session.duration = Math.round((session.endedAt - session.startedAt) / 1000);
    
    // Mark all participants as inactive
    session.participants.forEach(p => {
      p.isActive = false;
    });
    
    await session.save();
    return session;
  } catch (error) {
    console.error('Error ending session:', error);
    throw error;
  }
}

// Get session by ID
async function getSession(sessionId) {
  try {
    const session = await CollaborationSession.findOne({ sessionId })
      .populate('host', 'name email')
      .populate('participants.userId', 'name email');
    
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    throw error;
  }
}

// Get active sessions for user
async function getUserActiveSessions(userId) {
  try {
    const sessions = await CollaborationSession.find({
      $or: [
        { host: userId },
        { 'participants.userId': userId }
      ],
      status: 'active'
    }).sort({ startedAt: -1 });
    
    return sessions;
  } catch (error) {
    console.error('Error getting user active sessions:', error);
    throw error;
  }
}

module.exports = {
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
};

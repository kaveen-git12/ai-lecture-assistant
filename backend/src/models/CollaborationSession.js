const mongoose = require('mongoose');

const collaborationSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    unique: true,
    required: true
  },
  
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
    required: true
  },
  
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Participants
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: Date,
    role: {
      type: String,
      enum: ['presenter', 'collaborator', 'viewer'],
      default: 'collaborator'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    peerId: String, // WebRTC peer ID
    videoEnabled: Boolean,
    audioEnabled: Boolean,
    screenShare: Boolean,
    cursorPosition: {
      x: Number,
      y: Number
    },
    lastSeen: Date
  }],
  
  // Session info
  sessionName: String,
  description: String,
  status: {
    type: String,
    enum: ['scheduled', 'active', 'paused', 'ended'],
    default: 'scheduled'
  },
  
  // WebRTC configuration
  iceServers: [{
    urls: [String],
    username: String,
    credential: String
  }],
  
  // Synchronized notes
  synchronizedNotes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    timestamp: Number,
    cursorPosition: Number,
    createdAt: Date,
    updatedAt: Date
  }],
  
  // Screen sharing history
  screenShareHistory: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startTime: Date,
    endTime: Date,
    recordingUrl: String // If recorded
  }],
  
  // Recorded session
  isRecording: {
    type: Boolean,
    default: false
  },
  recordingUrl: String,
  recordedAt: Date,
  recordingDuration: Number, // in seconds
  
  // Chat messages
  chatMessages: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    message: String,
    timestamp: Date,
    attachments: [String]
  }],
  
  // Timing
  scheduledFor: Date,
  startedAt: Date,
  endedAt: Date,
  duration: Number, // in seconds
  
  // Settings
  settings: {
    maxParticipants: {
      type: Number,
      default: 50
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    allowScreenShare: {
      type: Boolean,
      default: true
    },
    allowRecording: {
      type: Boolean,
      default: true
    },
    password: String, // Optional session password
    publicLink: String
  },
  
  // Reactions/emojis
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    timestamp: Date
  }],
  
  // Whiteboard (if using shared annotations)
  whiteboardData: {
    annotations: [String],
    lastUpdated: Date
  },
  
  // Statistics
  statistics: {
    totalInteractions: Number,
    averageAttention: Number, // 0-100
    participationScore: [{
      userId: mongoose.Schema.Types.ObjectId,
      score: Number
    }]
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

collaborationSessionSchema.index({ sessionId: 1 });
collaborationSessionSchema.index({ lectureId: 1 });
collaborationSessionSchema.index({ host: 1 });
collaborationSessionSchema.index({ status: 1 });
collaborationSessionSchema.index({ endedAt: 1 });

module.exports = mongoose.model('CollaborationSession', collaborationSessionSchema);

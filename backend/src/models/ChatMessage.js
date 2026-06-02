const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous chats
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    default: 'ollama'
  },
  model: {
    type: String,
    default: 'llama3:latest'
  },
  sessionId: {
    type: String,
    required: true // Group messages by session
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60 // Auto-delete after 30 days
  }
});

// Index for efficient querying
chatMessageSchema.index({ sessionId: 1, createdAt: -1 });
chatMessageSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);

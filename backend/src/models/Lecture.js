const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  subject: { type: String, default: '' },
  description: { type: String, default: '' },
  videoUrl: { type: String, default: null },
  audioUrl: { type: String, default: null },
  transcription: { type: String, default: '' },
  extractedText: { type: String, default: '' },
  slides: [{ type: String }],
  topics: [{ type: String }],
  duration: { type: Number, default: 0 }, // in seconds
  keyPoints: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lecture', lectureSchema);

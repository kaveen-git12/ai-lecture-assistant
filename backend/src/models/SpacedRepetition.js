const mongoose = require('mongoose');

const spacedRepetitionSchema = new mongoose.Schema({
  flashcardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lectureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture', required: true },
  
  // Spaced Repetition Scheduling (SM-2 Algorithm)
  interval: { type: Number, default: 1 }, // days until next review
  easeFactor: { type: Number, default: 2.5 }, // difficulty multiplier
  repetitions: { type: Number, default: 0 }, // times reviewed
  nextReviewDate: { type: Date, required: true, default: Date.now },
  
  // Performance tracking
  quality: { type: Number, default: 0 }, // 0-5 score from last review
  correctCount: { type: Number, default: 0 },
  incorrectCount: { type: Number, default: 0 },
  
  // Metadata
  lastReviewedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SpacedRepetition', spacedRepetitionSchema);

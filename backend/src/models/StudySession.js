const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lectureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture', required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: null },
  duration: { type: Number, default: 0 }, // in minutes
  reviewedFlashcards: [{ type: mongoose.Schema.Types.ObjectId }],
  quizzesTaken: [{
    quizId: mongoose.Schema.Types.ObjectId,
    score: Number,
    totalQuestions: Number
  }],
  retentionRate: { type: Number, default: 0 }
});

module.exports = mongoose.model('StudySession', studySessionSchema);

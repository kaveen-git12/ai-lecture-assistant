const mongoose = require('mongoose');

const sharedLectureSchema = new mongoose.Schema({
  originalLectureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permission: { type: String, enum: ['view', 'edit', 'comment'], default: 'view' },
    sharedAt: { type: Date, default: Date.now }
  }],
  publicLink: { type: String, unique: true, sparse: true },
  isPublic: { type: Boolean, default: false },
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SharedLecture', sharedLectureSchema);

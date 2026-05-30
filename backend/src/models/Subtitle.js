const mongoose = require('mongoose');

const subtitleSchema = new mongoose.Schema({
  lectureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecture', required: true },
  
  subtitles: [{
    timestamp: Number, // milliseconds
    startTime: String, // HH:MM:SS.mmm
    endTime: String,   // HH:MM:SS.mmm
    text: String,
    speaker: String,   // Optional: who said it
    language: { type: String, default: 'en' },
    confidence: { type: Number, min: 0, max: 1 } // 0-1 confidence score
  }],
  
  language: { type: String, default: 'en' },
  translations: [{
    language: String,
    subtitles: [{
      timestamp: Number,
      text: String
    }]
  }],
  
  isGenerated: { type: Boolean, default: true },
  generatedAt: { type: Date, default: Date.now },
  generatedBy: { type: String, default: 'whisper-api' }
});

module.exports = mongoose.model('Subtitle', subtitleSchema);

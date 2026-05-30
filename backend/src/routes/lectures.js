const express = require('express');
const router = express.Router();
const multer = require('multer');
const Lecture = require('../models/Lecture');
const Note = require('../models/Note');
const { authMiddleware } = require('../utils/auth');
const { transcribeAudio, generateQuiz, generateFlashcards, extractKeyConcepts } = require('../utils/aiServices');

// Multer config for file uploads
const upload = multer({ dest: 'uploads/' });

// Create new lecture
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { title, subject, description } = req.body;
    
    const lecture = new Lecture({
      userId: req.userId,
      title,
      subject,
      description
    });

    await lecture.save();
    res.status(201).json({ message: 'Lecture created', lecture });
  } catch (error) {
    console.error('Lecture creation error:', error);
    res.status(500).json({ error: 'Failed to create lecture' });
  }
});

// Upload audio and transcribe
router.post('/transcribe', authMiddleware, upload.single('audio'), async (req, res) => {
  try {
    const { lectureId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture || lecture.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Transcribe audio
    const transcription = await transcribeAudio(req.file.path);
    
    // Extract key concepts
    const keyPoints = await extractKeyConcepts(transcription);
    
    lecture.transcription = transcription;
    lecture.keyPoints = keyPoints;
    await lecture.save();

    res.json({ transcription, keyPoints });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

// Get lectures for user
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const lectures = await Lecture.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(lectures);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lectures' });
  }
});

// Get lecture details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    
    if (!lecture || lecture.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(lecture);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lecture' });
  }
});

// Delete lecture
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    
    if (!lecture || lecture.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Lecture.deleteOne({ _id: req.params.id });
    res.json({ message: 'Lecture deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lecture' });
  }
});

module.exports = router;

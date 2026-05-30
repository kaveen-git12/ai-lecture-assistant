const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { authMiddleware } = require('../utils/auth');
const { generateQuiz, generateFlashcards } = require('../utils/aiServices');

// Create note
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { lectureId, content, tags } = req.body;

    const note = new Note({
      lectureId,
      userId: req.userId,
      content,
      tags: tags || []
    });

    await note.save();
    res.status(201).json({ message: 'Note created', note });
  } catch (error) {
    console.error('Note creation error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Generate flashcards from note
router.post('/:id/flashcards', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note || note.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const flashcards = await generateFlashcards(note.content);
    note.flashcards = flashcards;
    await note.save();

    res.json({ message: 'Flashcards generated', flashcards });
  } catch (error) {
    console.error('Flashcard generation error:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

// Generate quiz from note
router.post('/:id/quiz', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note || note.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const quiz = await generateQuiz(note.content);
    note.quiz = quiz;
    await note.save();

    res.json({ message: 'Quiz generated', quiz });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// Get notes for lecture
router.get('/lecture/:lectureId', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({
      lectureId: req.params.lectureId,
      userId: req.userId
    });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Update note
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note || note.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    Object.assign(note, req.body);
    await note.save();

    res.json({ message: 'Note updated', note });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note || note.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Note.deleteOne({ _id: req.params.id });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;

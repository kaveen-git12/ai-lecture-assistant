const express = require('express');
const router = express.Router();
const SpacedRepetition = require('../models/SpacedRepetition');
const Note = require('../models/Note');
const spacedRepetitionAlgorithm = require('../utils/spacedRepetitionAlgorithm');
const { authMiddleware } = require('../utils/auth');

// Initialize spaced repetition for a flashcard
router.post('/init/:flashcardId', authMiddleware, async (req, res) => {
  try {
    const { lectureId } = req.body;

    const existing = await SpacedRepetition.findOne({
      flashcardId: req.params.flashcardId,
      userId: req.userId
    });

    if (existing) {
      return res.status(400).json({ error: 'Already initialized' });
    }

    const now = new Date();
    const nextReviewDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day

    const sr = new SpacedRepetition({
      flashcardId: req.params.flashcardId,
      userId: req.userId,
      lectureId,
      nextReviewDate,
      interval: 1,
      easeFactor: 2.5
    });

    await sr.save();
    res.status(201).json({ message: 'Spaced repetition initialized', sr });
  } catch (error) {
    console.error('Init error:', error);
    res.status(500).json({ error: 'Failed to initialize' });
  }
});

// Get cards due for review
router.get('/due-cards/:lectureId', authMiddleware, async (req, res) => {
  try {
    const records = await SpacedRepetition.find({
      userId: req.userId,
      lectureId: req.params.lectureId
    });

    const dueCards = spacedRepetitionAlgorithm.getDueCards(records);
    
    // Get flash card details
    const details = await Promise.all(dueCards.map(async (card) => {
      const note = await Note.findById(card.flashcardId);
      return {
        ...card.toObject(),
        flashcard: note ? {
          question: note.flashcards?.[0]?.question,
          answer: note.flashcards?.[0]?.answer
        } : null
      };
    }));

    res.json({ 
      count: dueCards.length,
      cards: details
    });
  } catch (error) {
    console.error('Due cards error:', error);
    res.status(500).json({ error: 'Failed to fetch due cards' });
  }
});

// Record review result
router.post('/review/:cardId', authMiddleware, async (req, res) => {
  try {
    const rawQuality = req.body.quality;
    const quality = Number(rawQuality);

    if (rawQuality === undefined || Number.isNaN(quality)) {
      return res.status(400).json({ error: 'Quality is required and must be a number 0-5' });
    }

    if (quality < 0 || quality > 5) {
      return res.status(400).json({ error: 'Quality must be 0-5' });
    }

    const record = await SpacedRepetition.findById(req.params.cardId);
    
    if (!record || record.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Calculate next review using SM-2
    const nextReview = spacedRepetitionAlgorithm.calculateNextReview(
      quality,
      record.repetitions,
      record.interval,
      record.easeFactor
    );

    // Update record
    record.quality = quality;
    record.interval = nextReview.nextInterval;
    record.easeFactor = nextReview.nextEaseFactor;
    record.repetitions = nextReview.nextRepetitions;
    record.nextReviewDate = nextReview.nextReviewDate;
    record.lastReviewedAt = new Date();

    if (quality >= 3) {
      record.correctCount = (record.correctCount || 0) + 1;
    } else {
      record.incorrectCount = (record.incorrectCount || 0) + 1;
    }

    await record.save();

    res.json({
      message: 'Review recorded',
      nextReview: nextReview.nextReviewDate,
      interval: nextReview.nextInterval,
      easeFactor: nextReview.nextEaseFactor
    });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ error: 'Failed to record review' });
  }
});

// Get learning statistics
router.get('/stats/:lectureId', authMiddleware, async (req, res) => {
  try {
    const records = await SpacedRepetition.find({
      userId: req.userId,
      lectureId: req.params.lectureId
    });

    const stats = spacedRepetitionAlgorithm.getStatistics(records);
    const goal = spacedRepetitionAlgorithm.getRecommendedDailyGoal(records);
    const schedule = spacedRepetitionAlgorithm.generateSchedule(records, 30);

    res.json({
      stats,
      dailyGoal: goal,
      schedule30Days: schedule
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get review schedule
router.get('/schedule/:lectureId', authMiddleware, async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const records = await SpacedRepetition.find({
      userId: req.userId,
      lectureId: req.params.lectureId
    });

    const schedule = spacedRepetitionAlgorithm.generateSchedule(records, parseInt(days));

    res.json({
      period: `${days} days`,
      schedule,
      totalCards: records.length,
      totalDue: records.filter(r => new Date(r.nextReviewDate) <= new Date()).length
    });
  } catch (error) {
    console.error('Schedule error:', error);
    res.status(500).json({ error: 'Failed to get schedule' });
  }
});

module.exports = router;

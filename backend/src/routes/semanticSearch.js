const express = require('express');
const router = express.Router();
const Lecture = require('../models/Lecture');
const semanticSearch = require('../utils/semanticSearch');
const { authMiddleware } = require('../utils/auth');

// Search lectures semantically
router.post('/search-lectures', authMiddleware, async (req, res) => {
  try {
    const { query, topK = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Get user's lectures and generate embeddings
    const lecturesUserLecturesreasures = await Lecture.find({ userId: req.userId });

    if (lecturesUserLecturesreasures.length === 0) {
      return res.json({ results: [] });
    }

    // For demo, we'll use title + keyPoints + subject for similarity
    const lectureEmbeddings = lecturesUserLecturesreasures.map(l => ({
      _id: l._id,
      title: l.title,
      subject: l.subject,
      content: `${l.title} ${l.subject} ${(l.keyPoints || []).join(' ')}`,
      // In production, you'd generate embeddings: embedding: await generateEmbedding(...)
      embedding: Array(1536).fill(Math.random()) // Placeholder
    }));

    // Search
    const results = await semanticSearch.searchLectures(query, lectureEmbeddings, topK);

    res.json({
      query,
      results: results.map(r => ({
        id: r._id,
        title: r.title,
        subject: r.subject,
        relevance: (r.score * 100).toFixed(1) + '%'
      }))
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get recommended lectures based on history
router.get('/recommendations/:lectureId', authMiddleware, async (req, res) => {
  try {
    // Get user's viewed lectures
    const userLectures = await Lecture.find({ userId: req.userId }).limit(10);

    if (userLectures.length === 0) {
      return res.json({ recommendations: [] });
    }

    // Get all lectures (in production, would be limited)
    const allLectures = await Lecture.find().limit(100);

    // Create embeddings (placeholder)
    const lectureEmbeddings = allLectures.map(l => ({
      _id: l._id,
      title: l.title,
      subject: l.subject,
      embedding: Array(1536).fill(Math.random())
    }));

    // Get recommendations
    const recommendations = await semanticSearch.recommendLectures(
      userLectures,
      lectureEmbeddings,
      5
    );

    res.json({
      recommendations: recommendations.map(r => ({
        id: r._id,
        title: r.title,
        subject: r.subject,
        matchScore: (r.similarity * 100).toFixed(1) + '%'
      }))
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get lecture embeddings for similarity
router.get('/embeddings/:lectureId', authMiddleware, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.lectureId);

    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    // Generate embedding from key points and content
    const text = `${lecture.title} ${lecture.subject} ${(lecture.keyPoints || []).join(' ')}`;
    const embedding = await semanticSearch.embedQuery(text);

    res.json({
      lectureId: lecture._id,
      title: lecture.title,
      embeddingDimension: embedding.length,
      previewEmbedding: embedding.slice(0, 10) // First 10 values
    });
  } catch (error) {
    console.error('Embedding error:', error);
    res.status(500).json({ error: 'Failed to generate embedding' });
  }
});

module.exports = router;

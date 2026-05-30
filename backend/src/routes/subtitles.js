const express = require('express');
const router = express.Router();
const multer = require('multer');
const Subtitle = require('../models/Subtitle');
const Lecture = require('../models/Lecture');
const realtimeSubtitles = require('../utils/realtimeSubtitles');
const { authMiddleware } = require('../utils/auth');

const upload = multer({ dest: 'uploads/audio/' });

// Generate subtitles from audio file
router.post('/generate', authMiddleware, upload.single('audio'), async (req, res) => {
  try {
    const { lectureId, language = 'en' } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture || lecture.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Generate subtitles
    const result = await realtimeSubtitles.generateSubtitles(req.file.path);

    // Save to database
    const subtitle = new Subtitle({
      lectureId,
      subtitles: result.subtitles,
      language: result.language
    });

    await subtitle.save();

    res.json({
      message: 'Subtitles generated',
      count: result.subtitles.length,
      srt: realtimeSubtitles.generateSRTFile(result.subtitles),
      webvtt: realtimeSubtitles.generateWebVTTFile(result.subtitles),
      json: realtimeSubtitles.generateJSONSubtitles(result.subtitles)
    });
  } catch (error) {
    console.error('Subtitle generation error:', error);
    res.status(500).json({ error: 'Subtitle generation failed' });
  }
});

// Get subtitles by lecture
router.get('/:lectureId', authMiddleware, async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    const subtitle = await Subtitle.findOne({ lectureId: req.params.lectureId });

    if (!subtitle) {
      return res.status(404).json({ error: 'No subtitles found' });
    }

    let response = { subtitles: subtitle.subtitles };

    if (format === 'srt') {
      response.srt = realtimeSubtitles.generateSRTFile(subtitle.subtitles);
    } else if (format === 'webvtt') {
      response.webvtt = realtimeSubtitles.generateWebVTTFile(subtitle.subtitles);
    } else {
      response.json = realtimeSubtitles.generateJSONSubtitles(subtitle.subtitles);
    }

    res.json(response);
  } catch (error) {
    console.error('Fetch subtitles error:', error);
    res.status(500).json({ error: 'Failed to fetch subtitles' });
  }
});

// Translate subtitles
router.post('/:lectureId/translate', authMiddleware, async (req, res) => {
  try {
    const { targetLanguage } = req.body;

    const subtitle = await Subtitle.findOne({ lectureId: req.params.lectureId });

    if (!subtitle) {
      return res.status(404).json({ error: 'No subtitles found' });
    }

    // Translate subtitles
    const translated = await realtimeSubtitles.translateSubtitles(
      subtitle.subtitles,
      targetLanguage
    );

    // Save translation
    subtitle.translations.push({
      language: targetLanguage,
      subtitles: translated
    });

    await subtitle.save();

    res.json({
      message: 'Translation complete',
      language: targetLanguage,
      subtitles: translated
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// Generate key moments from subtitles
router.post('/:lectureId/key-moments', authMiddleware, async (req, res) => {
  try {
    const subtitle = await Subtitle.findOne({ lectureId: req.params.lectureId });

    if (!subtitle) {
      return res.status(404).json({ error: 'No subtitles found' });
    }

    // Extract key moments
    const keyMoments = await realtimeSubtitles.extractKeyMoments(subtitle.subtitles);

    res.json({
      count: keyMoments.length,
      keyMoments,
      highlights: keyMoments.filter(m => m.importance >= 4)
    });
  } catch (error) {
    console.error('Key moments error:', error);
    res.status(500).json({ error: 'Failed to extract key moments' });
  }
});

// Export subtitles in various formats
router.get('/:lectureId/export/:format', authMiddleware, async (req, res) => {
  try {
    const { format } = req.params;
    const subtitle = await Subtitle.findOne({ lectureId: req.params.lectureId });

    if (!subtitle) {
      return res.status(404).json({ error: 'No subtitles found' });
    }

    let content, contentType, filename;

    if (format === 'srt') {
      content = realtimeSubtitles.generateSRTFile(subtitle.subtitles);
      contentType = 'text/plain';
      filename = 'subtitles.srt';
    } else if (format === 'vtt') {
      content = realtimeSubtitles.generateWebVTTFile(subtitle.subtitles);
      contentType = 'text/vtt';
      filename = 'subtitles.vtt';
    } else if (format === 'json') {
      content = JSON.stringify(realtimeSubtitles.generateJSONSubtitles(subtitle.subtitles), null, 2);
      contentType = 'application/json';
      filename = 'subtitles.json';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;

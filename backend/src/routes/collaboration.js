const express = require('express');
const router = express.Router();
const Lecture = require('../models/Lecture');
const Note = require('../models/Note');
const SharedLecture = require('../models/SharedLecture');
const { authMiddleware } = require('../utils/auth');
const { v4: uuidv4 } = require('uuid');

// Share lecture with specific users
router.post('/lecture/:id/share', authMiddleware, async (req, res) => {
  try {
    const { userIds, permission = 'view' } = req.body;

    const lecture = await Lecture.findById(req.params.id);
    if (!lecture || lecture.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let shared = await SharedLecture.findOne({
      originalLectureId: req.params.id,
      ownerId: req.userId
    });

    if (!shared) {
      shared = new SharedLecture({
        originalLectureId: req.params.id,
        ownerId: req.userId
      });
    }

    if (userIds && Array.isArray(userIds)) {
      userIds.forEach(userId => {
        const existing = shared.sharedWith.find(s => s.userId.toString() === userId);
        if (!existing) {
          shared.sharedWith.push({ userId, permission });
        }
      });
    }

    await shared.save();
    res.json({ message: 'Lecture shared', shared });
  } catch (error) {
    console.error('Share error:', error);
    res.status(500).json({ error: 'Sharing failed' });
  }
});

// Generate public link for lecture
router.post('/lecture/:id/public-link', authMiddleware, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture || lecture.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let shared = await SharedLecture.findOne({
      originalLectureId: req.params.id,
      ownerId: req.userId
    });

    if (!shared) {
      shared = new SharedLecture({
        originalLectureId: req.params.id,
        ownerId: req.userId
      });
    }

    const publicLink = `${process.env.PUBLIC_LINK_BASE || 'http://localhost:3000'}/shared/${uuidv4()}`;
    shared.publicLink = publicLink;
    shared.isPublic = true;

    await shared.save();
    res.json({ publicLink });
  } catch (error) {
    console.error('Public link error:', error);
    res.status(500).json({ error: 'Failed to generate link' });
  }
});

// Get shared lectures
router.get('/lectures/shared', authMiddleware, async (req, res) => {
  try {
    const shared = await SharedLecture.find({
      'sharedWith.userId': req.userId
    }).populate('originalLectureId').populate('ownerId', 'username');

    res.json(shared);
  } catch (error) {
    console.error('Fetch shared error:', error);
    res.status(500).json({ error: 'Failed to fetch shared lectures' });
  }
});

// Add comment to shared lecture
router.post('/lecture/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    let shared = await SharedLecture.findOne({ originalLectureId: req.params.id });
    
    if (!shared) {
      shared = new SharedLecture({ originalLectureId: req.params.id });
    }

    shared.comments.push({
      userId: req.userId,
      text
    });

    await shared.save();
    res.status(201).json({ message: 'Comment added', comment: shared.comments[shared.comments.length - 1] });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get comments on lecture
router.get('/lecture/:id/comments', async (req, res) => {
  try {
    const shared = await SharedLecture.findOne({ originalLectureId: req.params.id })
      .populate('comments.userId', 'username');

    const comments = shared ? shared.comments : [];
    res.json(comments);
  } catch (error) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Change permission level
router.put('/lecture/:id/permission/:userId', authMiddleware, async (req, res) => {
  try {
    const { permission } = req.body;

    const shared = await SharedLecture.findOne({
      originalLectureId: req.params.id,
      ownerId: req.userId
    });

    if (!shared) {
      return res.status(404).json({ error: 'Sharing not found' });
    }

    const share = shared.sharedWith.find(s => s.userId.toString() === req.params.userId);
    if (share) {
      share.permission = permission;
      await shared.save();
    }

    res.json({ message: 'Permission updated' });
  } catch (error) {
    console.error('Permission error:', error);
    res.status(500).json({ error: 'Failed to update permission' });
  }
});

// Revoke access
router.delete('/lecture/:id/share/:userId', authMiddleware, async (req, res) => {
  try {
    const shared = await SharedLecture.findOne({
      originalLectureId: req.params.id,
      ownerId: req.userId
    });

    if (!shared) {
      return res.status(404).json({ error: 'Not found' });
    }

    shared.sharedWith = shared.sharedWith.filter(
      s => s.userId.toString() !== req.params.userId
    );

    await shared.save();
    res.json({ message: 'Access revoked' });
  } catch (error) {
    console.error('Revoke error:', error);
    res.status(500).json({ error: 'Failed to revoke access' });
  }
});

module.exports = router;

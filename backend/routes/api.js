const express = require('express');
const axios = require('axios');
const OpenAI = require('openai');

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Chat Assistant (Tutor Mode)
router.post('/chat', async (req, res) => {
  const { message, context } = req.body;

  if (!message || !context) {
    return res.status(400).json({ error: 'Message and context are required' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI tutor. Answer questions based ONLY on the provided lecture notes context. Explain concepts simply and clearly. If the question is not related to the context, say "I can only answer based on the lecture notes provided." Context: ${context}`
        },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    res.json({ answer: response.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Smart Summary
router.post('/summary', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Generate a concise summary of the lecture notes, keeping only the most important concepts and key points.'
        },
        { role: 'user', content: text }
      ],
      max_tokens: 300,
      temperature: 0.5
    });

    res.json({ summary: response.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Summary API Error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Topic Analyzer
router.post('/topics', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Extract and list the key topics from the lecture notes. Organize them into clear sections with bullet points.'
        },
        { role: 'user', content: text }
      ],
      max_tokens: 400,
      temperature: 0.5
    });

    res.json({ topics: response.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Topics API Error:', error);
    res.status(500).json({ error: 'Failed to extract topics' });
  }
});

// Learning Resource Finder (YouTube)
router.post('/youtube', async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'YouTube API key not configured' });
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic + ' tutorial explanation')}&key=${apiKey}&type=video&maxResults=5&order=relevance`;
    const response = await axios.get(url);

    const videos = response.data.items.map(item => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.default.url,
      description: item.snippet.description
    }));

    res.json({ videos });
  } catch (error) {
    console.error('YouTube API Error:', error);
    res.status(500).json({ error: 'Failed to fetch YouTube videos' });
  }
});

// Visual Enhancer (Images)
router.post('/images', async (req, res) => {
  const { topics } = req.body; // Array of topics

  if (!topics || !Array.isArray(topics)) {
    return res.status(400).json({ error: 'Topics array is required' });
  }

  const apiKey = process.env.UNSPLASH_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Unsplash API key not configured' });
  }

  try {
    const images = {};

    for (const topic of topics) {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(topic)}&client_id=${apiKey}&per_page=1&orientation=landscape`;
      const response = await axios.get(url);

      if (response.data.results.length > 0) {
        images[topic] = {
          url: response.data.results[0].urls.regular,
          alt: response.data.results[0].alt_description
        };
      }
    }

    res.json({ images });
  } catch (error) {
    console.error('Unsplash API Error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Auto Completion AI
router.post('/complete', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Complete the missing parts of these lecture notes. Solve any incomplete problems, highlight steps, formulas, and final answers. Maintain the original structure.'
        },
        { role: 'user', content: text }
      ],
      max_tokens: 800,
      temperature: 0.3
    });

    res.json({ completedText: response.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Complete API Error:', error);
    res.status(500).json({ error: 'Failed to complete notes' });
  }
});

// Exam Preparation AI
router.post('/exam', async (req, res) => {
  const { subject, level, examDate } = req.body;

  if (!subject || !level || !examDate) {
    return res.status(400).json({ error: 'Subject, level, and exam date are required' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Generate exam preparation materials for ${subject} at ${level} level. Exam date: ${examDate}. Include:
- Analysis of repeated topics from last 5 years
- Predicted important questions
- Study schedule based on days remaining
- Key chapters to focus on`
        },
        { role: 'user', content: 'Please provide comprehensive exam preparation guidance.' }
      ],
      max_tokens: 1000,
      temperature: 0.5
    });

    res.json({ examPrep: response.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Exam API Error:', error);
    res.status(500).json({ error: 'Failed to generate exam preparation' });
  }
});

// AI PDF Title Generator
router.post('/pdf-title', async (req, res) => {
  const { text, subject } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Generate a suitable title for a PDF document based on the lecture notes. Subject: ${subject || 'General'}. Make it concise and descriptive.`
        },
        { role: 'user', content: text.substring(0, 500) } // First 500 chars for context
      ],
      max_tokens: 50,
      temperature: 0.5
    });

    res.json({ title: response.choices[0].message.content.trim() });
  } catch (error) {
    console.error('PDF Title API Error:', error);
    res.status(500).json({ error: 'Failed to generate PDF title' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const multiLLM = require('../utils/multiLLM');
const { authMiddleware } = require('../utils/auth');
const ChatMessage = require('../models/ChatMessage');

// ===== CHAT MESSAGE HISTORY =====
router.post('/chat/save', async (req, res) => {
  try {
    const { role, content, provider = 'ollama', model = 'llama3:latest', sessionId } = req.body;

    if (!role || !content || !sessionId) {
      return res.status(400).json({ error: 'role, content, and sessionId are required' });
    }

    const message = new ChatMessage({
      role,
      content,
      provider,
      model,
      sessionId,
      userId: req.user?.id || null
    });

    await message.save();
    res.json({ success: true, message });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

router.get('/chat/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const messages = await ChatMessage.find({ sessionId })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ history: messages });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.post('/chat/clear/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    await ChatMessage.deleteMany({ sessionId });
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// Legacy endpoint - get all messages (for backwards compatibility)
router.get('/chat/history', async (req, res) => {
  try {
    // If user is authenticated, get their recent session
    const query = req.user?.id ? { userId: req.user.id } : {};
    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ history: messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ history: [] });
  }
});

// ===== OLLAMA DIRECT CHAT =====
router.post('/chat', async (req, res) => {
  try {
    const { messages, model = 'llama3:latest' } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama Server Error: ${response.statusText}. Response: ${errorText}`);
      }

      const data = await response.json();
      const messageContent = data?.message?.content;
      
      if (!messageContent) {
        throw new Error('Ollama response did not include a valid message.content payload.');
      }

      res.json({
        message: messageContent,
        provider: 'ollama',
        model,
        usage: {
          inputTokens: data.prompt_eval_count || 0,
          outputTokens: data.eval_count || 0
        }
      });
    } catch (error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('Could not connect')) {
        return res.status(503).json({ 
          error: 'Ollama is not running. Please start Ollama with: OLLAMA_ORIGINS=* ollama serve'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed: ' + error.message });
  }
});

// Generate text using preferred LLM provider
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { content, provider = 'ollama', systemPrompt = '', temperature = 0.7 } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await multiLLM.generateText(content, {
      provider,
      systemPrompt,
      temperature,
      maxTokens: 1500
    });

    res.json(result);
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Content generation failed' });
  }
});

// Generate quiz with preferred provider
router.post('/quiz', authMiddleware, async (req, res) => {
  try {
    const { content, numQuestions = 5, provider = 'ollama' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const quiz = await multiLLM.generateQuizMultiLLM(content, numQuestions, provider);
    res.json({ quiz, provider });
  } catch (error) {
    console.error('Quiz error:', error);
    res.status(500).json({ error: 'Quiz generation failed' });
  }
});

// Summarize content with preferred provider
router.post('/summarize', authMiddleware, async (req, res) => {
  try {
    const { content, provider = 'claude' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await multiLLM.summarizeContent(content, provider);
    res.json({ summary: result, provider });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ error: 'Summarization failed' });
  }
});

// Compare providers (returns responses from all models)
router.post('/compare', authMiddleware, async (req, res) => {
  try {
    const { content, systemPrompt = '' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const results = await multiLLM.compareProviders(content, systemPrompt);
    res.json({ results });
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ error: 'Provider comparison failed' });
  }
});

// Active Learning: summary + quiz + score flow
router.post('/active-learning', authMiddleware, async (req, res) => {
  try {
    const { content, provider = 'ollama', numQuestions = 6 } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const summary = await multiLLM.summarizeContent(content, provider);
    const quiz = await multiLLM.generateQuizMultiLLM(content, numQuestions, provider);

    res.json({ summary, quiz, provider });
  } catch (error) {
    console.error('Active learning error:', error);
    res.status(500).json({ error: 'Active learning generation failed' });
  }
});

// Get LLM provider info
router.get('/providers', (req, res) => {
  res.json({
    providers: [
      {
        id: 'openai',
        name: 'OpenAI (GPT-4o)',
        model: 'gpt-4o-mini',
        accuracy: 'Very High',
        speed: 'Fast',
        cost: 'Low'
      },
      {
        id: 'claude',
        name: 'Anthropic Claude',
        model: 'claude-3-sonnet',
        accuracy: 'Very High',
        speed: 'Medium',
        cost: 'Medium'
      },
      {
        id: 'gemini',
        name: 'Google Gemini',
        model: 'gemini-2.0-flash',
        accuracy: 'High',
        speed: 'Very Fast',
        cost: 'Low'
      },
      {
        id: 'ollama',
        name: 'Local AI (Ollama)',
        model: 'llama3',
        accuracy: 'High',
        speed: 'Depends on PC',
        cost: 'Free'
      }
    ],
    recommendations: {
      quiz: 'ollama',
      summarize: 'ollama',
      general: 'ollama'
    }
  });
});

// ===== AI Chat =====
router.post('/chat', async (req, res) => {
  try {
    const { message, context = '', history = [], images = [], provider = 'ollama' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let systemPrompt = 'You are a helpful AI study assistant for a lecture assistant app. Answer questions clearly and concisely. If lecture context is provided, use it to give more relevant answers.';
    if (context) {
      systemPrompt = `${context}\n\n${systemPrompt}`;
    }

    // Try starting with the requested provider, then fall back to others
    let result;
    let attemptedProviders = [provider];
    
    // Define fallback sequence if primary is ollama
    if (provider === 'ollama') {
      attemptedProviders.push('gemini');
      attemptedProviders.push('openai');
    }

    let lastError = null;
    for (const prov of attemptedProviders) {
      try {
        console.log(`🤖 Attempting chat with provider: ${prov}`);
        result = await multiLLM.generateText(message, {
          provider: prov,
          systemPrompt,
          maxTokens: 1500,
          images,
          history
        });
        // Successful response received, exit loop
        break;
      } catch (err) {
        console.warn(`⚠️ Chat provider ${prov} failed:`, err.message);
        lastError = err;
      }
    }

    if (!result) {
      throw new Error(`All attempted AI providers failed. Last error: ${lastError ? lastError.message : 'Unknown error'}`);
    }

    res.json({ answer: result.text, provider: result.provider });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed: ' + error.message });
  }
});

// ===== AI Summary =====
router.post('/summary', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await multiLLM.generateText(text, {
      provider: 'ollama',
      systemPrompt: 'You are an expert assistant. Summarize the following lecture notes concisely with bullet points.',
      maxTokens: 1000
    });

    res.json({ summary: result.text, provider: result.provider });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ error: 'Summary failed: ' + error.message });
  }
});

// ===== AI Topics Extraction =====
router.post('/topics', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await multiLLM.generateText(text, {
      provider: 'ollama',
      systemPrompt: 'Extract the main topics and key concepts from the following lecture notes. Return them as a comma-separated list of topics.',
      maxTokens: 500
    });

    res.json({ topics: result.text, provider: result.provider });
  } catch (error) {
    console.error('Topics error:', error);
    res.status(500).json({ error: 'Topic extraction failed: ' + error.message });
  }
});

// ===== AI Notes Completion =====
router.post('/complete', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await multiLLM.generateText(text, {
      provider: 'ollama',
      systemPrompt: 'You are a lecture note assistant. Complete and expand on the following partial lecture notes. Fill in gaps, add missing context, and make the notes comprehensive while keeping them organized.',
      maxTokens: 2000
    });

    res.json({ completedText: result.text, provider: result.provider });
  } catch (error) {
    console.error('Complete notes error:', error);
    res.status(500).json({ error: 'Notes completion failed: ' + error.message });
  }
});

// ===== AI Exam Preparation =====
router.post('/exam', async (req, res) => {
  try {
    const { subject, level = 'General', examDate = 'TBD' } = req.body;

    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const prompt = `Subject: ${subject}\nLevel: ${level}\nExam Date: ${examDate}`;

    const result = await multiLLM.generateText(prompt, {
      provider: 'ollama',
      systemPrompt: 'You are an exam preparation expert. Create a comprehensive study plan and predict likely exam topics for the given subject. Include key concepts to review, practice questions, and study tips.',
      maxTokens: 2000
    });

    res.json({ examPrep: result.text, provider: result.provider });
  } catch (error) {
    console.error('Exam prep error:', error);
    res.status(500).json({ error: 'Exam preparation failed: ' + error.message });
  }
});

// ===== YouTube Video Suggestions =====
router.post('/youtube', async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const result = await multiLLM.generateText(topic, {
      provider: 'ollama',
      systemPrompt: 'Suggest 5 YouTube search queries for learning about the given topic. Return as a JSON array of objects with "title" and "url" fields, where url is a YouTube search link like https://www.youtube.com/results?search_query=TOPIC. Return ONLY the JSON array.',
      maxTokens: 500
    });

    let videos;
    try {
      videos = JSON.parse(result.text);
    } catch {
      videos = [{ title: `Learn about ${topic}`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic)}` }];
    }

    res.json({ videos, provider: result.provider });
  } catch (error) {
    console.error('YouTube suggestions error:', error);
    res.status(500).json({ error: 'Video suggestions failed: ' + error.message });
  }
});

// ===== Image Enhancement =====
router.post('/images', async (req, res) => {
  try {
    const { topics } = req.body;

    if (!topics || !Array.isArray(topics)) {
      return res.status(400).json({ error: 'Topics array is required' });
    }

    const images = {};
    topics.forEach(topic => {
      images[topic] = {
        alt: `Illustration of ${topic}`,
        url: `https://source.unsplash.com/400x200/?${encodeURIComponent(topic)}`
      };
    });

    res.json({ images });
  } catch (error) {
    console.error('Images error:', error);
    res.status(500).json({ error: 'Image enhancement failed: ' + error.message });
  }
});

// ===== PDF Title Generation =====
router.post('/pdf-title', async (req, res) => {
  try {
    const { text, subject = 'Lecture' } = req.body;

    const result = await multiLLM.generateText(text ? text.substring(0, 500) : subject, {
      provider: 'ollama',
      systemPrompt: 'Generate a short, descriptive title for lecture notes about the given subject/content. Return ONLY the title text, nothing else. Keep it under 10 words.',
      maxTokens: 50
    });

    res.json({ title: result.text.trim().replace(/"/g, '') });
  } catch (error) {
    console.error('PDF title error:', error);
    res.json({ title: `${subject || 'Lecture'} Notes` });
  }
});

module.exports = router;


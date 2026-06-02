const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize clients
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const googleClient = process.env.GOOGLE_GEMINI_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY) : null;

/**
 * Multi-LLM Interface - Unified API for different AI models
 */
class MultiLLM {
  constructor() {
    this.providers = ['openai', 'claude', 'gemini', 'ollama'];
    this.defaultProvider = 'ollama';
  }

  /**
   * Generate text using selected LLM provider
   */
  async generateText(content, options = {}) {
    const {
      provider = this.defaultProvider,
      temperature = 0.7,
      maxTokens = 1000,
      systemPrompt = "",
      images = [],
      history = []
    } = options;

    try {
      switch (provider.toLowerCase()) {
        case 'claude':
          return await this.generateClaude(content, { temperature, maxTokens, systemPrompt, images, history });
        case 'gemini':
          return await this.generateGemini(content, { temperature, maxTokens, systemPrompt, images, history });
        case 'ollama':
          return await this.generateOllama(content, { temperature, maxTokens, systemPrompt, images, history });
        case 'openai':
        default:
          return await this.generateOpenAI(content, { temperature, maxTokens, systemPrompt, images, history });
      }
    } catch (error) {
      console.error(`Error with ${provider}:`, error);
      throw error;
    }
  }

  /**
   * OpenAI - GPT-4o
   */
  async generateOpenAI(content, options) {
    const messages = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    
    if (options.history && options.history.length > 0) {
      options.history.forEach(msg => {
        messages.push({
          role: msg.role === 'assistant' || msg.role === 'model' || msg.type === 'ai' ? 'assistant' : 'user',
          content: msg.text || msg.content
        });
      });
    }

    if (options.images && options.images.length > 0) {
      const userContent = [{ type: 'text', text: content }];
      options.images.forEach(img => {
        userContent.push({
          type: 'image_url',
          image_url: {
            url: img
          }
        });
      });
      messages.push({ role: 'user', content: userContent });
    } else {
      messages.push({ role: 'user', content: content });
    }

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens
    });

    return {
      provider: 'openai',
      text: response.choices[0].message.content,
      usage: {
        inputTokens: response.usage.prompt_tokens,
        outputTokens: response.usage.completion_tokens
      }
    };
  }

  /**
   * Claude - Anthropic
   */
  async generateClaude(content, options) {
    const messages = [];
    if (options.history && options.history.length > 0) {
      options.history.forEach(msg => {
        messages.push({
          role: msg.role === 'assistant' || msg.role === 'model' || msg.type === 'ai' ? 'assistant' : 'user',
          content: msg.text || msg.content
        });
      });
    }

    if (options.images && options.images.length > 0) {
      const userContent = [{ type: 'text', text: content }];
      options.images.forEach(img => {
        const match = img.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          userContent.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: match[1],
              data: match[2]
            }
          });
        }
      });
      messages.push({ role: 'user', content: userContent });
    } else {
      messages.push({ role: 'user', content });
    }

    const response = await anthropicClient.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: options.maxTokens,
      system: options.systemPrompt || undefined,
      messages,
      temperature: options.temperature
    });

    return {
      provider: 'claude',
      text: response.content[0].text,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      }
    };
  }

  /**
   * Google Gemini
   */
  async generateGemini(content, options) {
    if (!googleClient) {
      throw new Error('Google Gemini API key is not configured. Please set GOOGLE_GEMINI_KEY in your .env file.');
    }
    
    const model = googleClient.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      systemInstruction: options.systemPrompt || undefined
    });
    
    const contents = [];
    
    if (options.history && options.history.length > 0) {
      options.history.forEach(msg => {
        contents.push({
          role: msg.role === 'assistant' || msg.role === 'model' || msg.type === 'ai' ? 'model' : 'user',
          parts: [{ text: msg.text || msg.content }]
        });
      });
    }
    
    const currentParts = [{ text: content }];
    
    if (options.images && options.images.length > 0) {
      options.images.forEach(img => {
        const match = img.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          currentParts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2]
            }
          });
        }
      });
    }
    
    contents.push({
      role: 'user',
      parts: currentParts
    });

    const response = await model.generateContent({
      contents,
      generationConfig: {
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens
      }
    });

    const text = response.response.text();
    return {
      provider: 'gemini',
      text,
      usage: {
        inputTokens: 0,
        outputTokens: 0
      }
    };
  }

  /**
   * Local AI - Ollama
   */
  async generateOllama(content, options) {
    try {
      const messages = [];
      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      
      if (options.history && options.history.length > 0) {
        options.history.forEach(msg => {
          messages.push({
            role: msg.role === 'assistant' || msg.role === 'model' || msg.type === 'ai' ? 'assistant' : 'user',
            content: msg.text || msg.content
          });
        });
      }

      messages.push({ role: 'user', content });

      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3:latest',
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

      return {
        provider: 'ollama',
        text: messageContent,
        usage: {
          inputTokens: data.prompt_eval_count || 0,
          outputTokens: data.eval_count || 0
        }
      };
    } catch (error) {
      if (error.cause && error.cause.code === 'ECONNREFUSED') {
        throw new Error('Could not connect to Ollama. Please make sure Ollama is installed and running on your computer.');
      }
      throw error;
    }
  }

  /**
   * Generate embeddings for semantic search
   */
  async generateEmbeddings(text) {
    const response = await openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });

    return response.data[0].embedding;
  }

  /**
   * Batch generate active-learning quizzes with mixed question types
   */
  async generateQuizMultiLLM(content, numQuestions = 6, preferredProvider = 'openai') {
    const systemPrompt = `You are an educational quiz author for an intelligent learning engine. Analyze the content and produce exactly ${numQuestions} questions with a mix of 4 multiple-choice (MCQ) and 2 short-answer questions.

    Return a valid JSON array. Each item should include:
    - type: "mcq" or "short"
    - question: string
    - options: array of 4 strings (for mcq only)
    - correctAnswer: index (0-3, for mcq) or short answer string (for short)
    - explanation: concise rationale
    - difficulty: easy/medium/hard

    Example:
    [{"type":"mcq","question":"...","options":[...],"correctAnswer":1,"explanation":"...","difficulty":"easy"}, ...]

    Also include a front matter section at top labeled "Active Learning Quiz" and no extra text outside JSON.`;

    const result = await this.generateText(content, {
      provider: preferredProvider,
      systemPrompt,
      maxTokens: 2200
    });

    try {
      return JSON.parse(result.text);
    } catch (e) {
      console.error('Quiz parsing error:', e);
      // Fallback: return empty list
      return [];
    }
  }

  /**
   * Intelligent Learning Engine summary with rich study structure
   */
  async summarizeContent(content, preferredProvider = 'claude') {
    const systemPrompt = `You are an expert learning assistant. Analyze the input text and output a comprehensive, learner-friendly response with the following 5 sections exactly in this order:

    📌 Summary:
    - Concise bullet-point overview (3-5 bullets)

    🧠 Key Concepts:
    - 5 core terms/ideas with short explanations

    ❓ Auto-generated Questions:
    - 5 high-quality questions (mix of MCQ and short answer)

    📚 Exam Notes:
    - 3 rapid exam-ready notes with memory cues

    ⚡ 1-minute revision:
    - a 4-5 sentence super-fast recap for last-minute review

    Keep the output as human-readable text with headings and bullets. Do not include any extra JSON wrapper.`;

    const result = await this.generateText(content, {
      provider: preferredProvider,
      systemPrompt,
      maxTokens: 800
    });

    return result.text;
  }

  /**
   * Compare responses from multiple providers
   */
  async compareProviders(content, systemPrompt) {
    const results = {};

    for (const provider of this.providers) {
      try {
        results[provider] = await this.generateText(content, {
          provider,
          systemPrompt,
          maxTokens: 1000
        });
      } catch (error) {
        results[provider] = { error: error.message };
      }
    }

    return results;
  }
}

module.exports = new MultiLLM();

const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Transcribe audio using Whisper API
const transcribeAudio = async (filePath) => {
  try {
    const fs = require('fs');
    const fileStream = fs.createReadStream(filePath);
    
    const transcription = await client.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1'
    });

    return transcription.text;
  } catch (error) {
    console.error('Whisper API error:', error);
    throw error;
  }
};

// Generate quiz from content
const generateQuiz = async (content, numQuestions = 5) => {
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an educational assistant. Generate multiple-choice quiz questions from the provided content. Return a JSON array of objects with fields: question, options (array of 4), correctAnswer (index), explanation.'
        },
        {
          role: 'user',
          content: `Generate ${numQuestions} quiz questions from this content:\n\n${content}`
        }
      ]
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw error;
  }
};

// Generate flashcards from content
const generateFlashcards = async (content, numCards = 10) => {
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an educational assistant. Generate flashcard pairs from the provided content. Return a JSON array of objects with fields: question, answer, difficulty (easy/medium/hard).'
        },
        {
          role: 'user',
          content: `Generate ${numCards} flashcards from this content:\n\n${content}`
        }
      ]
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Flashcard generation error:', error);
    throw error;
  }
};

// Extract key concepts
const extractKeyConcepts = async (content) => {
  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an educational expert. Extract the most important concepts and key points from the provided content. Return them as a JSON array of strings.'
        },
        {
          role: 'user',
          content: `Extract key concepts from:\n\n${content}`
        }
      ]
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Concept extraction error:', error);
    throw error;
  }
};

module.exports = {
  transcribeAudio,
  generateQuiz,
  generateFlashcards,
  extractKeyConcepts
};

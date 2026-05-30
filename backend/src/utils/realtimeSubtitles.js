const OpenAI = require('openai');

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Real-time Subtitle Generation
 * Generates subtitles with timestamps for lectures
 */
class RealtimeSubtitles {
  /**
   * Convert time in seconds to SRT timestamp format
   */
  formatTimestamp(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
  }

  /**
   * Generate subtitles from audio file
   */
  async generateSubtitles(audioFilePath) {
    try {
      const fs = require('fs');
      const fileStream = fs.createReadStream(audioFilePath);

      // Use Whisper API with verbose_json to get timestamps
      const transcription = await openaiClient.audio.transcriptions.create({
        file: fileStream,
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['segment']
      });

      // Convert Whisper segments to subtitle format
      const subtitles = this.segmentsToSubtitles(transcription.segments || []);
      return {
        subtitles,
        raw: transcription,
        language: transcription.language
      };
    } catch (error) {
      console.error('Subtitle generation error:', error);
      throw error;
    }
  }

  /**
   * Convert Whisper segments to subtitle objects
   */
  segmentsToSubtitles(segments) {
    return segments.map((segment, idx) => ({
      index: idx + 1,
      startTime: this.formatTimestamp(segment.start),
      endTime: this.formatTimestamp(segment.end),
      text: segment.text,
      timestamp: segment.start,
      duration: segment.end - segment.start,
      confidence: segment.confidence || 0.9
    }));
  }

  /**
   * Generate SRT subtitle file format
   */
  generateSRTFile(subtitles) {
    return subtitles
      .map(sub => 
        `${sub.index}\n${sub.startTime} --> ${sub.endTime}\n${sub.text.trim()}\n`
      )
      .join('\n');
  }

  /**
   * Generate WebVTT subtitle file format
   */
  generateWebVTTFile(subtitles) {
    const content = ['WEBVTT\n\n'];
    
    subtitles.forEach(sub => {
      content.push(`${sub.startTime} --> ${sub.endTime}\n${sub.text.trim()}\n\n`);
    });

    return content.join('');
  }

  /**
   * Generate JSON subtitle format (for web display)
   */
  generateJSONSubtitles(subtitles) {
    return {
      format: 'json',
      count: subtitles.length,
      subtitles: subtitles.map(sub => ({
        start: sub.timestamp,
        end: sub.timestamp + sub.duration,
        text: sub.text,
        confidence: sub.confidence
      }))
    };
  }

  /**
   * Translate subtitles to another language
   */
  async translateSubtitles(subtitles, targetLanguage) {
    // Use LLM for intelligent translation
    const multiLLM = require('./multiLLM');
    
    const text = subtitles.map(s => s.text).join('\n');
    
    const result = await multiLLM.generateText(
      `Translate these lecture subtitles to ${targetLanguage}:\n\n${text}`,
      {
        provider: 'openai',
        systemPrompt: `You are a professional translator. Translate the subtitle text preserving meaning and brevity. Return ONLY the translated text, line by line, in the same order.`,
        maxTokens: 2000
      }
    );

    const translatedLines = result.text.split('\n').filter(line => line.trim());
    
    return subtitles.map((sub, idx) => ({
      ...sub,
      text: translatedLines[idx] || sub.text,
      language: targetLanguage
    }));
  }

  /**
   * Add speaker identification to subtitles
   */
  async identifySpeakers(subtitles, audioAnalysis) {
    // In the future, use speaker diarization models
    // For now, basic implementation
    return subtitles.map(sub => ({
      ...sub,
      speaker: 'Speaker 1' // Placeholder
    }));
  }

  /**
   * Synchronize subtitles with video/audio
   */
  synchronizeSubtitles(subtitles, syncAdjustment = 0) {
    return subtitles.map(sub => {
      const adjustedStart = sub.timestamp + syncAdjustment;
      const adjustedEnd = adjustedStart + sub.duration;

      return {
        ...sub,
        startTime: this.formatTimestamp(adjustedStart),
        endTime: this.formatTimestamp(adjustedEnd),
        timestamp: adjustedStart
      };
    });
  }

  /**
   * Extract key moments from subtitles
   */
  async extractKeyMoments(subtitles) {
    const multiLLM = require('./multiLLM');
    
    const fullText = subtitles.map(s => s.text).join(' ');
    
    const result = await multiLLM.generateText(
      `From these lecture transcripts, identify the most important moments (key concepts, definitions, examples): ${fullText}`,
      {
        systemPrompt: 'Return a JSON array of objects with: keyword (the key concept), timestamp (time in seconds), importance (1-5).',
        maxTokens: 1000
      }
    );

    try {
      const keyMoments = JSON.parse(result.text);
      return keyMoments.map(moment => ({
        ...moment,
        subtitle: subtitles.find(s => s.timestamp <= moment.timestamp)
      }));
    } catch (e) {
      console.error('Key moment extraction failed:', e);
      return [];
    }
  }
}

module.exports = new RealtimeSubtitles();

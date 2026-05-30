/**
 * 🧠 OCR + NOTE PROCESSOR MODULE
 *
 * Extracts text from images using OCR and processes them with AI
 * to clean, structure, and summarize lecture notes
 */

import Tesseract from "tesseract.js";

/**
 * OCR Processor class
 */
class OCRProcessor {
  constructor(options = {}) {
    this.apiServer = options.apiServer || "http://localhost:3000";
    this.ocrLanguage = options.ocrLanguage || "eng";
    this.workerCount = options.workerCount || 4; // Parallel OCR workers
    this.workers = [];
  }

  /**
   * Initialize Tesseract workers for parallel processing
   */
  async initialize() {
    try {
      console.log(
        `🚀 Initializing OCR with ${this.workerCount} workers...`
      );

      for (let i = 0; i < this.workerCount; i++) {
        const worker = await Tesseract.createWorker(
          this.ocrLanguage
        );
        this.workers.push(worker);
      }

      console.log(
        "✅ OCR initialization complete"
      );
      return true;
    } catch (err) {
      console.error("❌ OCR initialization failed:", err);
      return false;
    }
  }

  /**
   * Extract text from image using OCR
   * @param {File|Blob|string} image - Image file or URL
   * @returns {Promise<string>} - Extracted text
   */
  async extractText(image) {
    try {
      console.log("🔍 Extracting text from image...");

      // Use first available worker
      const worker = this.workers[0];

      if (!worker) {
        throw new Error(
          "OCR worker not initialized. Call initialize() first."
        );
      }

      const result = await worker.recognize(image);
      const text = result.data.text;

      console.log(
        `✅ OCR complete. Extracted ${text.length} characters`
      );

      return text;
    } catch (err) {
      console.error("❌ OCR extraction failed:", err);
      throw err;
    }
  }

  /**
   * Extract text from multiple images in parallel
   * @param {Array} images - Array of image files or URLs
   * @returns {Promise<Array>} - Array of extracted texts
   */
  async extractTextBatch(images) {
    try {
      console.log(
        `🔍 Extracting text from ${images.length} images...`
      );

      const results = await Promise.all(
        images.map((image, index) => {
          const workerIndex = index % this.workers.length;
          return this.workers[workerIndex].recognize(image);
        })
      );

      const texts = results.map((r) => r.data.text);

      console.log(
        `✅ Batch OCR complete. Extracted ${texts.reduce((a, t) => a + t.length, 0)} total characters`
      );

      return texts;
    } catch (err) {
      console.error("❌ Batch OCR extraction failed:", err);
      throw err;
    }
  }

  /**
   * Clean and structure raw OCR text using AI
   * @param {string} rawText - Raw text from OCR
   * @returns {Promise<string>} - Cleaned and structured text
   */
  async processNotes(rawText) {
    try {
      console.log(
        "📝 Processing notes with AI..."
      );

      const response = await fetch(
        `${this.apiServer}/api/ai/text`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Clean and structure these lecture notes. Format them clearly with sections, bullet points, and proper hierarchy:\n\n${rawText}`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `API error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        `✅ Notes processed successfully`
      );

      return data.reply;
    } catch (err) {
      console.error("❌ Note processing failed:", err);
      throw err;
    }
  }

  /**
   * Summarize notes using AI
   * @param {string} text - Text to summarize
   * @returns {Promise<string>} - Summary
   */
  async summarizeNotes(text) {
    try {
      console.log(
        "📋 Summarizing notes..."
      );

      const response = await fetch(
        `${this.apiServer}/api/ai/text`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Provide a concise summary of these lecture notes, highlighting key concepts and important points:\n\n${text}`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `API error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        `✅ Summary generated successfully`
      );

      return data.reply;
    } catch (err) {
      console.error("❌ Summarization failed:", err);
      throw err;
    }
  }

  /**
   * Complete pipeline: OCR → Process → Summarize
   * @param {File|Blob|string} image - Image to process
   * @returns {Promise<Object>} - Result with raw, cleaned, and summary text
   */
  async processImage(image) {
    try {
      console.log("🔄 Starting image processing pipeline...");

      // Step 1: Extract text
      const rawText = await this.extractText(image);

      if (!rawText.trim()) {
        throw new Error(
          "No text found in image"
        );
      }

      // Step 2: Clean and structure
      const cleanedText = await this.processNotes(rawText);

      // Step 3: Summarize
      const summary = await this.summarizeNotes(
        cleanedText
      );

      const result = {
        raw: rawText,
        cleaned: cleanedText,
        summary: summary,
        timestamp: new Date().toISOString(),
        characterCount: {
          raw: rawText.length,
          cleaned: cleanedText.length,
          summary: summary.length,
        },
      };

      console.log("✅ Image processing complete");

      return result;
    } catch (err) {
      console.error(
        "❌ Image processing pipeline failed:",
        err
      );
      throw err;
    }
  }

  /**
   * Process multiple images in parallel
   * @param {Array} images - Array of images
   * @returns {Promise<Array>} - Array of processing results
   */
  async processImageBatch(images) {
    try {
      console.log(
        `🔄 Processing ${images.length} images...`
      );

      const results = await Promise.all(
        images.map((image) => this.processImage(image))
      );

      console.log(
        `✅ Batch processing complete`
      );

      return results;
    } catch (err) {
      console.error(
        "❌ Batch image processing failed:",
        err
      );
      throw err;
    }
  }

  /**
   * Cleanup: Terminate OCR workers
   */
  async cleanup() {
    try {
      console.log("🧹 Cleaning up OCR workers...");

      await Promise.all(
        this.workers.map((worker) => worker.terminate())
      );

      this.workers = [];
      console.log("✅ Cleanup complete");
    } catch (err) {
      console.error("❌ Cleanup failed:", err);
    }
  }

  /**
   * Get OCR processing status
   */
  getStatus() {
    return {
      initialized: this.workers.length > 0,
      workerCount: this.workers.length,
      language: this.ocrLanguage,
      apiServer: this.apiServer,
    };
  }
}

/**
 * Fast OCR function (simple usage)
 * @param {File|Blob|string} image - Image to process
 * @returns {Promise<string>} - Extracted text
 */
export async function fastOCR(image) {
  const processor = new OCRProcessor();
  await processor.initialize();

  try {
    const text = await processor.extractText(image);
    return text;
  } finally {
    await processor.cleanup();
  }
}

/**
 * Process single image end-to-end
 * @param {File|Blob|string} image - Image to process
 * @returns {Promise<Object>} - Processed result
 */
export async function processImageEndToEnd(image) {
  const processor = new OCRProcessor();
  await processor.initialize();

  try {
    const result = await processor.processImage(image);
    return result;
  } finally {
    await processor.cleanup();
  }
}

export default OCRProcessor;

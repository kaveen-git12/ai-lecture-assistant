// ===== AI SYSTEM CONFIGURATION =====
// Central config for all AI modules

export const AI_CONFIG = {
  // API Setup
  GEMINI_API_KEY: process.env.GOOGLE_API_KEY || "YOUR_API_KEY",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "YOUR_OPENAI_KEY",
  
  // Backend server
  API_BASE_URL: process.env.API_BASE_URL || "http://localhost:3000",
  
  // Models
  GEMINI_MODEL: "gemini-1.5-flash",
  
  // Upload settings
  UPLOAD_DIR: "uploads/",
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  
  // OCR settings
  OCR_LANGUAGE: "eng",
  
  // Feature flags
  FEATURES: {
    AUTO_CAPTURE: true,
    OCR_PROCESSING: true,
    PDF_GENERATION: true,
    CHAT_TUTOR: true,
    EXAM_PREDICT: true
  }
};

export default AI_CONFIG;

/**
 * 🔧 SHARED CONFIGURATION CONSTANTS
 * Used by both frontend and backend
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.example.com' 
    : 'http://localhost:3000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

// Camera Configuration
export const CAMERA_CONFIG = {
  VIDEO_WIDTH: 1280,
  VIDEO_HEIGHT: 720,
  FRAME_RATE: 30,
  CAPTURE_INTERVAL: 500,  // ms between frame checks
  MIN_SLIDE_DURATION: 2000, // Minimum ms between slide captures
};

// Slide Detection Configuration
export const DETECTION_CONFIG = {
  PIXEL_DIFF_THRESHOLD: 15,        // Sensitivity for change detection
  SENSITIVITY_ADJUSTMENT: 5000000,  // Pixel difference threshold
  CROP_RATIO: 0.6,                  // Crop center 60% of frame
  CROP_OFFSET: 0.2,                 // Start from 20% offset
};

// Tesseract OCR Configuration
export const OCR_CONFIG = {
  LANGUAGE: 'eng',
  WORKER_COUNT: 4,
  USE_GPU: false,
};

// AI Processing Configuration
export const AI_CONFIG = {
  MODEL: 'gemini-1.5-flash',
  TEMPERATURE: 0.7,
  MAX_TOKENS: 2000,
  BATCH_SIZE: 5,
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024,  // 50MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  UPLOAD_DIR: './uploads',
};

// PDF Export Configuration
export const PDF_CONFIG = {
  PAGE_WIDTH: 210,   // A4 width in mm
  PAGE_HEIGHT: 297,  // A4 height in mm
  MARGIN: 10,
  FONT_SIZE: 12,
};

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 3000,
  MODAL_ANIMATION: 300,
  THEME: 'dark',
};

// Database Configuration
export const DB_CONFIG = {
  COLLECTION_NAMES: {
    LECTURES: 'lectures',
    SLIDES: 'slides',
    USERS: 'users',
    NOTES: 'notes',
    SESSIONS: 'sessions',
  },
};

// Validation Rules
export const VALIDATION = {
  LECTURE_TITLE_MIN: 3,
  LECTURE_TITLE_MAX: 100,
  SUBJECT_NAME_MIN: 2,
  SUBJECT_NAME_MAX: 50,
  NOTES_MAX_LENGTH: 50000,
};

// Error Messages
export const ERROR_MESSAGES = {
  CAMERA_NOT_AVAILABLE: 'Camera is not available',
  CAMERA_PERMISSION_DENIED: 'Camera permission was denied',
  NO_SLIDES_CAPTURED: 'No slides have been captured yet',
  OCR_FAILED: 'OCR processing failed',
  AI_SERVER_ERROR: 'AI server is not responding',
  INVALID_FILE_TYPE: 'Invalid file type uploaded',
  FILE_TOO_LARGE: 'File size exceeds maximum limit',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SLIDE_CAPTURED: 'Slide captured successfully',
  PDF_EXPORTED: 'PDF exported successfully',
  NOTES_SAVED: 'Notes saved successfully',
  LECTURE_CREATED: 'Lecture created successfully',
};

export default {
  API_CONFIG,
  CAMERA_CONFIG,
  DETECTION_CONFIG,
  OCR_CONFIG,
  AI_CONFIG,
  UPLOAD_CONFIG,
  PDF_CONFIG,
  UI_CONFIG,
  DB_CONFIG,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};

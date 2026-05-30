/**
 * 📝 SHARED TYPES & INTERFACES
 * Type definitions used across frontend and backend
 */

/**
 * @typedef {Object} Slide
 * @property {string} id - Unique identifier
 * @property {string} lectureId - Parent lecture ID
 * @property {number} index - Slide order
 * @property {string} image - Base64 encoded image
 * @property {string} extractedText - OCR text
 * @property {string[]} topics - Extracted topics
 * @property {Date} capturedAt - Capture timestamp
 */
export const SlideSchema = {
  id: 'string',
  lectureId: 'string',
  index: 'number',
  image: 'string',
  extractedText: 'string',
  topics: ['string'],
  capturedAt: 'Date',
};

/**
 * @typedef {Object} Lecture
 * @property {string} id - Unique identifier
 * @property {string} title - Lecture title
 * @property {string} subject - Subject name
 * @property {string[]} topics - Main topics covered
 * @property {Slide[]} slides - Associated slides
 * @property {string} summary - AI-generated summary
 * @property {string} studyPlan - Generated study plan
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
export const LectureSchema = {
  id: 'string',
  title: 'string',
  subject: 'string',
  topics: ['string'],
  slides: ['Slide'],
  summary: 'string',
  studyPlan: 'string',
  createdAt: 'Date',
  updatedAt: 'Date',
};

/**
 * @typedef {Object} AIResponse
 * @property {boolean} success - Operation success status
 * @property {string} reply - AI response text
 * @property {Object} metadata - Additional metadata
 * @property {Date} timestamp - Response timestamp
 */
export const AIResponseSchema = {
  success: 'boolean',
  reply: 'string',
  metadata: 'Object',
  timestamp: 'Date',
};

/**
 * @typedef {Object} DetectionResult
 * @property {boolean} hasChanged - Whether content changed
 * @property {number} confidence - Confidence score (0-1)
 * @property {boolean} hasSlideBoard - Board detected
 * @property {boolean} hasPerson - Person detected
 * @property {number} pixelDifference - Pixel change amount
 */
export const DetectionResultSchema = {
  hasChanged: 'boolean',
  confidence: 'number',
  hasSlideBoard: 'boolean',
  hasPerson: 'boolean',
  pixelDifference: 'number',
};

/**
 * @typedef {Object} OCRResult
 * @property {string} rawText - Extracted text
 * @property {string} cleanedText - Formatted text
 * @property {string[]} topics - Identified topics
 * @property {number} confidence - OCR confidence (0-1)
 */
export const OCRResultSchema = {
  rawText: 'string',
  cleanedText: 'string',
  topics: ['string'],
  confidence: 'number',
};

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - Email address
 * @property {string} name - Full name
 * @property {Date} createdAt - Account creation date
 * @property {string[]} lectures - Lecture IDs
 */
export const UserSchema = {
  id: 'string',
  email: 'string',
  name: 'string',
  createdAt: 'Date',
  lectures: ['string'],
};

/**
 * @typedef {Object} APIError
 * @property {number} code - Error code
 * @property {string} message - Error message
 * @property {Object} details - Additional details
 */
export const APIErrorSchema = {
  code: 'number',
  message: 'string',
  details: 'Object',
};

/**
 * Enums for status values
 */
export const StatusEnum = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

/**
 * Enums for slide types
 */
export const SlideTypeEnum = {
  TEXT: 'text',
  DIAGRAM: 'diagram',
  CODE: 'code',
  EQUATION: 'equation',
  MIXED: 'mixed',
};

export default {
  SlideSchema,
  LectureSchema,
  AIResponseSchema,
  DetectionResultSchema,
  OCRResultSchema,
  UserSchema,
  APIErrorSchema,
  StatusEnum,
  SlideTypeEnum,
};

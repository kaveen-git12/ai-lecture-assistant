# 🎓 AI LECTURE ASSISTANT - Modular Architecture

A comprehensive AI-powered lecture capture and processing system with smart slide detection, OCR, and AI-driven note generation.

## 📁 Project Structure

```
ai-lecture-assistant/
├── frontend/                 # React UI + Camera + Slides Management
├── backend/                  # Express API + AI Logic
├── ai-engine/               # Advanced AI Models (Optional)
├── shared/                  # Shared Constants & Types
└── uploads/                 # Processed Images & Slides
```

## 🚀 Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit: `http://localhost:3001`

### Backend
```bash
cd backend
npm install
npm run dev
```
API: `http://localhost:3000`

## 📚 Folder Guide

### `/frontend` - React Application
- **components/** - Reusable UI components (Camera, Slides, UI)
- **pages/** - Main views (Home, Lecture, History)
- **services/** - API calls and external services
- **hooks/** - Custom React hooks
- **context/** - Global state management
- **utils/** - Helper functions

### `/backend` - Express Server
- **controllers/** - Request handlers
- **routes/** - API endpoints
- **models/** - Database schemas
- **services/** - Core business logic
  - **ai/** - AI detection & processing
- **middleware/** - Express middlewares
- **config/** - Configuration files

### `/ai-engine` - Python AI (Optional)
- **models/** - Trained ML models
- **pipelines/** - Processing workflows
- **utils/** - Preprocessing utilities

### `/shared` - Shared Code
- **constants/** - Shared constants
- **types/** - TypeScript/JSDoc types

### `/uploads` - Storage
- **raw/** - Original captured images
- **processed/** - Processed slides

## 🛠️ Technologies

- **Frontend**: React, Webpack, Tesseract.js
- **Backend**: Express, MongoDB, Google Gemini API
- **AI**: TensorFlow, OpenCV (optional)
- **Database**: MongoDB
- **Auth**: JWT

## 📖 Features

✅ Real-time lecture capture  
✅ Automatic slide detection  
✅ OCR text extraction  
✅ AI-powered summaries  
✅ Topic extraction  
✅ Study plan generation  
✅ Exam prediction  
✅ PDF export  

## 🔗 API Documentation

See `/backend/README.md` for API endpoints and usage.

## 📝 License

MIT

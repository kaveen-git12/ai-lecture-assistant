# 📐 AI LECTURE ASSISTANT - COMPLETE STRUCTURE

## 📁 Full Directory Tree

```
ai-lecture-assistant/
│
├── 🎨 FRONTEND (React UI)
│   ├── frontend/
│   │   ├── public/
│   │   │   ├── index.html
│   │   │   ├── manifest.json
│   │   │   └── service-worker.js
│   │   │
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   │   ├── images/          # Icons, logos, backgrounds
│   │   │   │   └── styles/          # Global CSS, themes
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── Camera/
│   │   │   │   │   ├── CameraPreview.jsx
│   │   │   │   │   ├── CaptureButton.jsx
│   │   │   │   │   └── CameraOverlay.jsx
│   │   │   │   │
│   │   │   │   ├── Slides/
│   │   │   │   │   ├── SlideCard.jsx
│   │   │   │   │   ├── SlideList.jsx
│   │   │   │   │   └── SlideViewer.jsx
│   │   │   │   │
│   │   │   │   └── UI/
│   │   │   │       ├── Button.jsx
│   │   │   │       ├── Modal.jsx
│   │   │   │       ├── Loader.jsx
│   │   │   │       └── Toast.jsx
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── Lecture.jsx      # Main working screen
│   │   │   │   └── History.jsx
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── api.js           # Base HTTP client
│   │   │   │   ├── lectureService.js
│   │   │   │   └── aiService.js
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useCamera.js
│   │   │   │   ├── useSlides.js
│   │   │   │   └── useDetection.js
│   │   │   │
│   │   │   ├── context/
│   │   │   │   └── LectureContext.jsx
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── imageProcessing.js
│   │   │   │   └── constants.js
│   │   │   │
│   │   │   ├── App.jsx
│   │   │   ├── main.jsx
│   │   │   └── i18n.js
│   │   │
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── README.md
│   │
│   └── (existing ui files can stay here during transition)
│
│
├── ⚙️  BACKEND (Express API)
│   ├── backend/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── lectureController.js
│   │   │   │   ├── aiController.js
│   │   │   │   └── slideController.js
│   │   │   │
│   │   │   ├── routes/
│   │   │   │   ├── lectureRoutes.js
│   │   │   │   ├── aiRoutes.js
│   │   │   │   └── healthRoutes.js
│   │   │   │
│   │   │   ├── models/
│   │   │   │   ├── Lecture.js
│   │   │   │   ├── Slide.js
│   │   │   │   └── User.js
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── slideService.js
│   │   │   │   ├── storageService.js
│   │   │   │   │
│   │   │   │   └── ai/              # 🧠 AI SERVICES
│   │   │   │       ├── boardDetection.js
│   │   │   │       ├── personDetection.js
│   │   │   │       ├── changeDetection.js
│   │   │   │       ├── ocrProcessor.js
│   │   │   │       ├── textCleaner.js
│   │   │   │       └── aiAssistant.js
│   │   │   │
│   │   │   ├── middleware/
│   │   │   │   ├── upload.js        # Multer config
│   │   │   │   ├── errorHandler.js
│   │   │   │   └── auth.js
│   │   │   │
│   │   │   ├── config/
│   │   │   │   ├── db.js
│   │   │   │   ├── env.js
│   │   │   │   └── server.js
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── logger.js
│   │   │   │   └── validators.js
│   │   │   │
│   │   │   └── app.js
│   │   │
│   │   ├── server.js               # Entry point
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── (existing api files can stay here during transition)
│
│
├── 🧠 AI ENGINE (Python - Optional)
│   ├── ai-engine/
│   │   ├── models/
│   │   │   ├── detection_model.h5
│   │   │   └── ocr_model.pkl
│   │   │
│   │   ├── pipelines/
│   │   │   ├── slidePipeline.py
│   │   │   ├── detectionPipeline.py
│   │   │   └── ocrPipeline.py
│   │   │
│   │   ├── utils/
│   │   │   ├── preprocess.py
│   │   │   ├── postprocess.py
│   │   │   └── helpers.py
│   │   │
│   │   ├── requirements.txt
│   │   ├── setup.py
│   │   └── README.md
│   │
│
│
├── 🔁 SHARED (Frontend + Backend)
│   ├── shared/
│   │   ├── constants/
│   │   │   ├── config.js           # Shared config
│   │   │   ├── errors.js
│   │   │   └── messages.js
│   │   │
│   │   ├── types/
│   │   │   ├── index.js            # TypeScript types/JSDoc
│   │   │   ├── Slide.ts
│   │   │   └── Lecture.ts
│   │   │
│   │   └── utils/
│   │       └── helpers.js
│   │
│
│
├── 📂 UPLOADS (File Storage)
│   ├── uploads/
│   │   ├── raw/                    # Original captures
│   │   │   ├── slide_001.webp
│   │   │   ├── slide_002.webp
│   │   │   └── ...
│   │   │
│   │   └── processed/              # Processed images
│   │       ├── slide_001_ocr.txt
│   │       ├── slide_001.pdf
│   │       └── ...
│   │
│
│
├── 📋 CONFIGURATION & DOCS
│   ├── .env                        # Environment variables (create from .env.example)
│   ├── .env.example                # Template for .env
│   ├── .gitignore
│   ├── README.md                   # Main documentation
│   ├── STRUCTURE.md                # This file
│   ├── package.json                # Root package (optional, for mono repo)
│   └── docker-compose.yml          # (Optional) Docker setup
│
│
└── 🚀 ROOT COMMANDS
    .
    
    # Frontend
    cd frontend && npm run dev
    
    # Backend
    cd backend && npm run dev
    
    # Both (from root with concurrently)
    npm run dev:all
```

## 🔄 Data Flow

```
📹 USER CAMERA
    ↓
🎨 Frontend: CameraPanel
    ↓
🔍 Change Detection (frontend utils)
    ↓
📸 Capture Slide (SlideList)
    ↓
📤 Upload to Backend (/api/slides/upload)
    ↓
⚙️ Backend: slideController.js
    ↓
🧠 AI Services:
    → personDetection → Block if person visible
    → boardDetection → Confirm whiteboard
    → ocrProcessor → Extract text
    → textCleaner → Format text
    → aiAssistant → Summarize, extract topics
    ↓
💾 Store in MongoDB (Lecture model)
    ↓
📥 Return to Frontend
    ↓
🎯 Display: SlideViewer, TopicsPanel, SummaryPanel
```

## 📦 Package Structure

### Frontend (`frontend/package.json`)
```json
{
  "dependencies": {
    "react": "^19.2.4",
    "i18next": "^23.0.0",
    "chart.js": "^4.4.0",
    "jspdf": "^2.5.1",
    "tesseract.js": "^5.1.1"
  }
}
```

### Backend (`backend/package.json`)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "@google/generative-ai": "^0.3.0",
    "multer": "^1.4.5-lts.1"
  }
}
```

## 🔗 Environment Variables

See `.env.example` for complete list. Key variables:

```
GOOGLE_API_KEY=xxx
MONGODB_URI=mongodb://localhost:27017/ai-lecturer
PORT=3000
REACT_APP_API_SERVER=http://localhost:3000
```

## 📱 Key Features by Module

### Frontend Components
- ✅ Real-time camera stream
- ✅ Slide thumbnail gallery
- ✅ OCR text display
- ✅ AI chat assistant
- ✅ PDF export
- ✅ Study plan panel

### Backend Services
- ✅ Slide detection algorithm
- ✅ Person detection (privacy)
- ✅ OCR processing
- ✅ AI text generation
- ✅ Database persistence
- ✅ File storage

### Shared
- ✅ Type definitions
- ✅ Configuration constants
- ✅ Error handling
- ✅ Validation rules

## 🚀 Deployment Checklist

- [ ] Frontend built to `dist/`
- [ ] Backend API running on port 3000
- [ ] MongoDB connected
- [ ] Google API key configured
- [ ] CORS enabled for frontend origin
- [ ] Uploads directory writable
- [ ] SSL/TLS certificates (production)
- [ ] Rate limiting configured
- [ ] Logging enabled

## 📝 Notes

- **Gradual Migration**: Keep existing files during transition
- **Modularity**: Each folder is independently testable
- **Scalability**: Easy to add new modules
- **Maintainability**: Clear separation of concerns

# 🎨 Frontend - AI Lecture Assistant UI

React-based user interface for lecture capture and slide management.

## 📁 Structure

```
src/
├── components/          # Reusable UI components
│   ├── Camera/         # Camera capture components
│   ├── Slides/         # Slide display components
│   └── UI/             # Buttons, modals, loaders
├── pages/              # Main application views
├── services/           # API integration
├── hooks/              # Custom React hooks
├── context/            # State management
└── utils/              # Helper functions
```

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Visit: `http://localhost:3001`

## 📦 Dependencies

- React 19
- Vite (Dev Server)
- Webpack
- i18next (Internationalization)
- Chart.js (Analytics)
- Tesseract.js (OCR)

## 🎯 Key Components

### Camera
- `CameraPreview.jsx` - Video stream display
- `CaptureButton.jsx` - Capture controls
- `CameraOverlay.jsx` - Live detection overlay

### Slides
- `SlideCard.jsx` - Individual slide display
- `SlideList.jsx` - Slide gallery
- `SlideViewer.jsx` - Full-screen viewer

### Services
- `api.js` - Base API client
- `lectureService.js` - Lecture API calls
- `aiService.js` - AI processing API

## 🔗 API Base URL
- Development: `http://localhost:3000`
- Production: Configure in `.env`

## 🎨 Styling
- CSS-in-JS (via Webpack)
- Responsive design
- Dark theme support

## 📱 Features
- Live camera feed
- Automatic slide capture
- Slide thumbnail gallery
- OCR text display
- AI-powered analysis
- PDF export
- Study plan generation

## 🧪 Testing
```bash
npm run test
```

## 📊 Build
```bash
npm run build
```

Output in `dist/` directory

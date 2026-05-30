# 🔗 INTEGRATION GUIDE - AI MODULES

Complete guide for integrating the three AI modules (Backend Server, Smart Lecture Capture, OCR Processor) into your application.

## 📚 Module Overview

```
┌─────────────────────────────────────────────────────┐
│         AI LECTURE ASSISTANT SYSTEM                  │
├─────────────────────────────────────────────────────┤
│                                                       │
│  1. BACKEND SERVER (AI/backend/)                    │
│     ├─ Express API server                           │
│     ├─ Google Gemini integration                    │
│     └─ Text & image processing                      │
│                                                       │
│  2. SMART LECTURE CAPTURE (AI/camera/)              │
│     ├─ Real-time video frame capture                │
│     ├─ Automatic slide detection                    │
│     └─ LocalStorage persistence                     │
│                                                       │
│  3. OCR + NOTE PROCESSOR (AI/ocr/)                  │
│     ├─ Tesseract OCR                                │
│     ├─ Smart text cleaning                          │
│     └─ AI summarization                             │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## 🛠️ Step 1: Backend Server Setup

### 1.1 Install Dependencies

```bash
cd AI/backend
npm install
```

### 1.2 Configure Environment

Create `.env` file in `AI/backend/`:

```bash
# Get API key from https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=your_google_gemini_api_key_here
PORT=3000
```

### 1.3 Start Server

```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

Expected output:
```
🔥 AI Server running on http://localhost:3000
📝 Text API: POST 3000/api/ai/text
🖼️  Image API: POST 3000/api/ai/image
📋 Batch API: POST 3000/api/ai/batch
🔍 Health Check: GET 3000/api/health
```

### 1.4 Test Backend

```bash
# Test health check
curl http://localhost:3000/api/health

# Test text API
curl -X POST http://localhost:3000/api/ai/text \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is AI?"}'
```

## 🛠️ Step 2: Frontend Integration

### 2.1 Initialize modules in your React/Vue app

```javascript
// main.js or App.js
import SmartLectureCapture from "./AI/camera/smartLectureCapture.js";
import OCRProcessor from "./AI/ocr/ocrProcessor.js";

// Create global instances
window.lectureCapture = new SmartLectureCapture();
window.ocrProcessor = new OCRProcessor({
  apiServer: "http://localhost:3000"
});

// Initialize OCR
await window.ocrProcessor.initialize();
```

### 2.2 HTML Setup

```html
<!DOCTYPE html>
<html>
<head>
  <title>AI Lecture Assistant</title>
  <style>
    .control-panel {
      display: flex;
      gap: 10px;
      margin: 20px;
    }
    button { padding: 10px 20px; font-size: 16px; cursor: pointer; }
    video { width: 100%; max-width: 640px; border: 2px solid #333; }
    .preview { max-width: 400px; margin: 20px; }
  </style>
</head>
<body>
  <!-- Camera Capture Section -->
  <section>
    <h2>📹 Lecture Capture</h2>
    <video id="lectureCamera" autoplay></video>
    <div class="control-panel">
      <button id="startCaptureBtn">▶️ Start Capture</button>
      <button id="stopCaptureBtn">⏹️ Stop Capture</button>
      <button id="exportSlidesBtn">📥 Export Slides</button>
    </div>
    <p id="captureStatus">Slides: 0</p>
  </section>

  <!-- OCR Section -->
  <section>
    <h2>🖼️ OCR Processing</h2>
    <input type="file" id="imageUpload" accept="image/*" />
    <button id="processImageBtn">🔍 Process Image</button>
    <div id="ocrResult"></div>
  </section>

  <script type="module">
    // Import and setup
    import SmartLectureCapture from "./AI/camera/smartLectureCapture.js";
    import OCRProcessor from "./AI/ocr/ocrProcessor.js";

    // Initialize components
    const capture = new SmartLectureCapture();
    const ocr = new OCRProcessor({ apiServer: "http://localhost:3000" });

    // Setup camera capture
    document.getElementById("startCaptureBtn").addEventListener("click", async () => {
      await capture.initializeCamera("lectureCamera");
      capture.startCapture();
    });

    document.getElementById("stopCaptureBtn").addEventListener("click", () => {
      capture.stopCapture();
    });

    document.getElementById("exportSlidesBtn").addEventListener("click", () => {
      capture.exportSlides("lecture-slides.json");
    });

    // Update slide count
    capture.on("slideCapture", () => {
      document.getElementById("captureStatus").textContent = 
        `Slides: ${capture.slideCount}`;
    });

    // OCR processing
    await ocr.initialize();

    document.getElementById("processImageBtn").addEventListener("click", async () => {
      const file = document.getElementById("imageUpload").files[0];
      if (!file) return;

      try {
        const result = await ocr.processImage(file);
        document.getElementById("ocrResult").innerHTML = `
          <h3>Extracted Text</h3>
          <p>${result.raw}</p>
          <h3>Cleaned Notes</h3>
          <p>${result.cleaned}</p>
          <h3>Summary</h3>
          <p>${result.summary}</p>
        `;
      } catch (err) {
        console.error("Processing failed:", err);
      }
    });
  </script>
</body>
</html>
```

## 🛠️ Step 3: Complete Workflow Integration

### Scenario: Automated Lecture Processing

```javascript
// Complete pipeline
async function processLecture() {
  console.log("🚀 Starting lecture processing pipeline...");

  // Step 1: Capture slides
  console.log("📹 Phase 1: Capturing lecture slides...");
  const capture = new SmartLectureCapture();
  await capture.initializeCamera("video");
  capture.startCapture();

  // Let it capture for 1 hour (or however long)
  // User manually stops when done

  // Step 2: Get captured slides
  console.log("⏹️ Stopping capture...");
  capture.stopCapture();
  const slides = capture.getSlides();

  // Step 3: Process each slide with OCR
  console.log("🔍 Phase 2: Processing slides with OCR...");
  const ocr = new OCRProcessor({ apiServer: "http://localhost:3000" });
  await ocr.initialize();

  const processedSlides = [];
  for (const slide of slides) {
    // Convert base64 to blob for OCR
    const blob = dataURLtoBlob(slide.image);
    const result = await ocr.processImage(blob);
    
    processedSlides.push({
      ...slide,
      extractedText: result.raw,
      cleanedNotes: result.cleaned,
      summary: result.summary
    });

    console.log(`✅ Processed slide #${slide.index}`);
  }

  // Step 4: Export everything
  console.log("📥 Phase 3: Exporting results...");
  exportProcessedLecture(processedSlides);

  console.log("✅ Lecture processing complete!");

  await ocr.cleanup();
}

function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

function exportProcessedLecture(slides) {
  const data = {
    lecture: {
      title: "Lecture " + new Date().toLocaleDateString(),
      date: new Date().toISOString(),
      slideCount: slides.length
    },
    slides: slides.map(s => ({
      index: s.index,
      timestamp: s.timestamp,
      extractedText: s.extractedText,
      cleanedNotes: s.cleanedNotes,
      summary: s.summary
    }))
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], 
    { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "lecture-transcript.json";
  link.click();
  URL.revokeObjectURL(url);
}
```

## 🔌 API Communication Flow

```
┌────────────────────────────────────────────────────────┐
│                    FRONTEND                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  1. Capture Camera Frames                        │  │
│  │     SmartLectureCapture.captureFrame()           │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  2. Extract Text with OCR                        │  │
│  │     OCRProcessor.extractText()                   │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                              │
│                    POST /api/ai/image                   │
│                    POST /api/ai/text                    │
│                          ↓                              │
├────────────────────────────────────────────────────────┤
│                    BACKEND SERVER                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  3. Process with Google Gemini AI                │  │
│  │     - Clean & structure text                     │  │
│  │     - Generate summaries                         │  │
│  │     - Enhance notes                              │  │
│  └──────────────────────────────────────────────────┘  │
│                          ↓                              │
│                  Response JSON                          │
│                          ↓                              │
├────────────────────────────────────────────────────────┤
│                    FRONTEND                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  4. Display & Store Results                      │  │
│  │     - Show cleaned notes                         │  │
│  │     - Display summary                            │  │
│  │     - Save to localStorage                       │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

## 🔐 Security Checklist

- [ ] Keep `GOOGLE_API_KEY` in `.env`, never commit to git
- [ ] Add `.env` to `.gitignore`
- [ ] Use HTTPS in production
- [ ] Implement rate limiting on backend
- [ ] Validate file uploads on backend
- [ ] Add CORS restrictions
- [ ] Sanitize user inputs

## 📊 Monitoring & Debugging

### Check Backend Health

```javascript
async function checkBackend() {
  const response = await fetch("http://localhost:3000/api/health");
  const data = await response.json();
  console.log(data);
}

checkBackend();
```

### Monitor Capture Events

```javascript
const capture = new SmartLectureCapture();

capture.on("cameraReady", () => console.log("📹 Camera ready"));
capture.on("captureStarted", () => console.log("▶️ Started"));
capture.on("slideCapture", (s) => console.log(`📸 Slide #${s.index}`));
capture.on("captureStopped", (d) => console.log(`Total: ${d.slideCount}`));
capture.on("error", (e) => console.error("❌", e));
```

### Monitor OCR Processing

```javascript
const ocr = new OCRProcessor();
console.log(ocr.getStatus());
// { initialized: true, workerCount: 4, language: "eng", apiServer: "..." }
```

## 🚀 Deployment Checklist

### For Backend
- [ ] Set `GOOGLE_API_KEY` environment variable
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS for your domain
- [ ] Set up file upload directory with proper permissions
- [ ] Add rate limiting
- [ ] Enable error logging
- [ ] Use PM2 or similar for process management

### For Frontend
- [ ] Update `apiServer` to production URL
- [ ] Test all modules in production environment
- [ ] Add error boundaries in React
- [ ] Optimize image sizes before upload
- [ ] Test on target browsers
- [ ] Add offline fallback handling

## 📈 Performance Optimization

### Backend
```javascript
// Add caching for similar prompts
const cache = new Map();

app.post("/api/ai/text", async (req, res) => {
  const key = hashPrompt(req.body.prompt);
  if (cache.has(key)) return res.json(cache.get(key));
  
  const result = await model.generateContent(req.body.prompt);
  cache.set(key, result);
  res.json(result);
});
```

### Frontend
```javascript
// Batch OCR processing
const processor = new OCRProcessor({ workerCount: 8 });
await processor.initialize();

// Process in chunks
const chunkSize = 5;
for (let i = 0; i < images.length; i += chunkSize) {
  const chunk = images.slice(i, i + chunkSize);
  const results = await processor.processImageBatch(chunk);
}
```

## 📝 License

All modules: MIT

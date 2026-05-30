# 🔧 API QUICK REFERENCE

Fast lookup for all API endpoints and module methods.

## 🔌 Backend API Endpoints

### Text Processing
```bash
POST /api/ai/text
Content-Type: application/json

{
  "prompt": "Clean and structure these notes: ..."
}

# Response
{
  "reply": "Formatted text...",
  "timestamp": "2026-04-16T10:00:00.000Z"
}
```

### Image Processing
```bash
POST /api/ai/image
Content-Type: multipart/form-data

Field: image (file)

# Response
{
  "text": "Extracted text...",
  "fileName": "slide.png",
  "timestamp": "2026-04-16T10:00:00.000Z"
}
```

### Batch Processing
```bash
POST /api/ai/batch
Content-Type: application/json

{
  "texts": ["note 1", "note 2"],
  "operation": "summarize"
}

# Response
{
  "operation": "summarize",
  "results": [{input: "...", output: "..."}],
  "count": 2,
  "timestamp": "..."
}
```

### Health Check
```bash
GET /api/health

# Response
{
  "status": "🟢 Server is running",
  "timestamp": "...",
  "uptime": 3600
}
```

## 📹 Smart Lecture Capture

### Initialization
```javascript
const capture = new SmartLectureCapture({
  sensitivity: 5000000,
  captureInterval: 500,
  minSlideDuration: 2000
});
```

### Methods
| Method | Returns | Description |
|--------|---------|-------------|
| `initializeCamera(id)` | Promise | Initialize camera |
| `startCapture()` | void | Begin capturing |
| `stopCapture()` | void | Stop capturing |
| `getSlides()` | Array | Get all slides |
| `exportSlides(name)` | void | Export as JSON |
| `loadFromLocalStorage()` | Array | Load saved slides |
| `clearSlides()` | void | Delete all slides |
| `setSensitivity(val)` | void | Adjust sensitivity |
| `stopCamera()` | void | Release camera |

### Events
```javascript
capture.on("cameraReady", () => {})
capture.on("captureStarted", () => {})
capture.on("slideCapture", (data) => {})
capture.on("captureStopped", (data) => {})
capture.on("slidesLoaded", (data) => {})
capture.on("slidesCleared", () => {})
capture.on("error", (err) => {})
```

## 🧠 OCR Processor

### Initialization
```javascript
const processor = new OCRProcessor({
  apiServer: "http://localhost:3000",
  ocrLanguage: "eng",
  workerCount: 4
});

await processor.initialize();
```

### Methods
| Method | Returns | Description |
|--------|---------|-------------|
| `extractText(image)` | Promise<string> | OCR single image |
| `extractTextBatch(images)` | Promise<Array> | OCR multiple images |
| `processNotes(text)` | Promise<string> | Clean text |
| `summarizeNotes(text)` | Promise<string> | Summarize text |
| `processImage(image)` | Promise<Object> | Full pipeline |
| `processImageBatch(images)` | Promise<Array> | Batch pipeline |
| `cleanup()` | Promise | Terminate workers |
| `getStatus()` | Object | Get status |

### Quick Functions
```javascript
// Simple OCR
import { fastOCR } from "./ocrProcessor.js";
const text = await fastOCR(image);

// Full processing
import { processImageEndToEnd } from "./ocrProcessor.js";
const result = await processImageEndToEnd(image);
```

## 📋 Common Code Examples

### Hello World - Text Processing
```javascript
const res = await fetch("http://localhost:3000/api/ai/text", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({probe: "Summarize: ..."})
});
const data = await res.json();
console.log(data.reply);
```

### Hello World - Image Upload
```javascript
const formData = new FormData();
formData.append("image", file);

const res = await fetch("http://localhost:3000/api/ai/image", {
  method: "POST",
  body: formData
});
const data = await res.json();
console.log(data.text);
```

### Hello World - Capture
```javascript
const capture = new SmartLectureCapture();
await capture.initializeCamera("video");
capture.startCapture();
capture.on("slideCapture", (s) => console.log("Slide", s.index));
```

### Hello World - OCR
```javascript
const ocr = new OCRProcessor();
await ocr.initialize();
const result = await ocr.processImage(file);
console.log(result.cleaned);
await ocr.cleanup();
```

## ⚙️ Environment Variables

### Backend
```bash
GOOGLE_API_KEY=your_key_here
PORT=3000
```

### Frontend
```json
{
  "REACT_APP_API_SERVER": "http://localhost:3000",
  "REACT_APP_OCR_LANGUAGE": "eng"
}
```

## 🐛 Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Verify API key |
| 404 | Not Found | Check endpoint URL |
| 500 | Server Error | Check backend logs |
| CORS| Cross-origin | Enable CORS on backend |

## 🚀 Quick Start Commands

```bash
# 1. Start backend
cd AI/backend
npm install
export GOOGLE_API_KEY=your_key
npm run dev

# 2. Test backend
curl http://localhost:3000/api/health

# 3. Use in frontend
import SmartLectureCapture from "./AI/camera/smartLectureCapture.js";
import OCRProcessor from "./AI/ocr/ocrProcessor.js";
```

## 📚 Full Documentation

- Backend: [AI/backend/README.md](./AI/backend/README.md)
- Camera: [AI/camera/README.md](./AI/camera/README.md)
- OCR: [AI/ocr/README.md](./AI/ocr/README.md)
- Integration: [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

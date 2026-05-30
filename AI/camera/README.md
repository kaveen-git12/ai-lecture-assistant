# 🎥 SMART LECTURE CAPTURE MODULE

Advanced video frame capture system that automatically detects lecture slide changes and saves them as images.

## ✨ Features

- **🎬 Real-time Frame Capture** - Continuous video stream analysis
- **🔍 Smart Change Detection** - Pixel-based diff algorithm to detect slide changes
- **📸 Automatic Slide Capture** - Save slides when changes detected
- **💾 Local Storage Persistence** - Store slides in browser localStorage
- **📥 Export/Import** - Download captured slides as JSON
- **📊 Event System** - React to capture events with callbacks
- **⚙️ Configurable** - Adjust sensitivity and capture intervals

## 📦 Installation

```bash
# npm (from AI/camera directory)
npm install

# Or import as module in your project
import SmartLectureCapture from "./AI/camera/smartLectureCapture.js";
```

## 🚀 Quick Start

```javascript
// Initialize
const capture = new SmartLectureCapture({
  sensitivity: 5000000,        // Pixel difference threshold
  captureInterval: 500,        // ms between frame checks
  minSlideDuration: 2000       // Minimum ms between captures
});

// Setup camera
await capture.initializeCamera("videoElement");

// Start capturing
capture.startCapture();

// Listen to events
capture.on("slideCapture", (slideData) => {
  console.log("Slide captured:", slideData);
});

// Stop when done
capture.stopCapture();
```

## 🎯 Usage Examples

### Basic Setup in HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>Lecture Capture</title>
</head>
<body>
  <video id="camera" width="640" height="480" autoplay></video>
  <button id="startBtn">Start Capture</button>
  <button id="stopBtn">Stop Capture</button>
  <button id="exportBtn">Export Slides</button>

  <script type="module">
    import SmartLectureCapture from "./smartLectureCapture.js";

    const capture = new SmartLectureCapture();
    
    document.getElementById("startBtn").addEventListener("click", async () => {
      await capture.initializeCamera("camera");
      capture.startCapture();
    });

    document.getElementById("stopBtn").addEventListener("click", () => {
      capture.stopCapture();
    });

    document.getElementById("exportBtn").addEventListener("click", () => {
      capture.exportSlides("my-lecture.json");
    });

    // Handle events
    capture.on("slideCapture", (slide) => {
      console.log(`Captured slide #${slide.index}`);
    });

    capture.on("error", (err) => {
      console.error("Capture error:", err);
    });
  </script>
</body>
</html>
```

### Advanced Configuration

```javascript
const capture = new SmartLectureCapture({
  sensitivity: 3000000,        // Lower = more sensitive
  captureInterval: 300,        // Check frames more frequently
  minSlideDuration: 1000       // Capture faster
});

// Adjust sensitivity on the fly
capture.setSensitivity(4000000);

// Get current slides
const slides = capture.getSlides();
console.log(`Total slides: ${slides.length}`);

// Load previous session
const loaded = capture.loadFromLocalStorage();
console.log(`Loaded ${loaded.length} slides`);

// Clear all slides
capture.clearSlides();

// Stop camera when done
capture.stopCamera();
```

## 📊 API Reference

### Constructor Options

```javascript
new SmartLectureCapture({
  sensitivity: 5000000,         // Pixel diff threshold (default: 5000000)
  captureInterval: 500,         // ms between frame checks (default: 500)
  minSlideDuration: 2000        // Minimum ms between captures (default: 2000)
})
```

### Methods

#### `initializeCamera(videoElementId: string): Promise<boolean>`
Initialize camera access and attach to video element.

```javascript
const success = await capture.initializeCamera("video");
```

#### `startCapture(): void`
Begin capturing frames.

```javascript
capture.startCapture();
```

#### `stopCapture(): void`
Stop capturing frames.

```javascript
capture.stopCapture();
```

#### `getSlides(): Array`
Get all captured slides.

```javascript
const slides = capture.getSlides();
slides.forEach(slide => {
  console.log(`Slide ${slide.index}: ${slide.timestamp}`);
});
```

#### `exportSlides(fileName: string): void`
Export slides as JSON file.

```javascript
capture.exportSlides("lecture-slides.json");
```

#### `loadFromLocalStorage(): Array`
Load previously saved slides from localStorage.

```javascript
const slides = capture.loadFromLocalStorage();
```

#### `clearSlides(): void`
Delete all saved slides.

```javascript
capture.clearSlides();
```

#### `setSensitivity(value: number): void`
Adjust detection sensitivity.

```javascript
capture.setSensitivity(3000000);  // More sensitive
```

#### `stopCamera(): void`
Stop camera stream and release resources.

```javascript
capture.stopCamera();
```

### Events

#### `cameraReady`
Fired when camera is initialized.

```javascript
capture.on("cameraReady", () => {
  console.log("Camera ready to capture");
});
```

#### `captureStarted`
Fired when frame capture begins.

```javascript
capture.on("captureStarted", () => {
  console.log("Capture started");
});
```

#### `slideCapture`
Fired when a slide is captured.

```javascript
capture.on("slideCapture", (slideData) => {
  console.log("Slide captured:", slideData.index);
  // slideData: { index, timestamp, image }
});
```

#### `captureStopped`
Fired when frame capture stops.

```javascript
capture.on("captureStopped", (data) => {
  console.log(`Stopped. Total slides: ${data.slideCount}`);
});
```

#### `slidesLoaded`
Fired when slides loaded from localStorage.

```javascript
capture.on("slidesLoaded", (data) => {
  console.log(`Loaded ${data.count} slides`);
});
```

#### `slidesCleared`
Fired when slides are cleared.

```javascript
capture.on("slidesCleared", () => {
  console.log("Slides cleared");
});
```

#### `error`
Fired on error.

```javascript
capture.on("error", (err) => {
  console.error(`Error: ${err.type} - ${err.message}`);
});
```

## 🖼️ Slide Data Structure

Each captured slide contains:

```javascript
{
  index: 1,
  timestamp: "2026-04-16T10:00:00.000Z",
  image: "data:image/png;base64,iVBORw0KGgo..."  // Base64 encoded PNG
}
```

## 🎚️ Tuning Sensitivity

**Sensitivity** controls how much pixel change is needed to detect a slide:

- **Lower values** (e.g., 2000000) - More sensitive, captures minor changes
- **Higher values** (e.g., 8000000) - Less sensitive, only captures major changes
- **Default** (5000000) - Balanced for typical lecture slides

```javascript
// High sensitivity
capture.setSensitivity(2000000);

// Low sensitivity
capture.setSensitivity(8000000);
```

## 💾 Storage Considerations

Each slide is stored as base64-encoded PNG:
- Typical slide: 200-500 KB
- localStorage limit: ~5-10 MB per origin
- Max slides per session: ~10-20 depending on resolution

**Export slides regularly** to avoid storage limits.

## 🔧 Troubleshooting

### Camera Permission Denied
```javascript
capture.on("error", (err) => {
  if (err.type === "cameraError") {
    console.log("User denied camera access");
  }
});
```

### Too Many/Few Slides Captured
Adjust sensitivity:

```javascript
// Fewer captures (less sensitive)
capture.setSensitivity(7000000);

// More captures (more sensitive)
capture.setSensitivity(3000000);
```

### Storage Quota Exceeded
```javascript
capture.on("error", (err) => {
  if (err.type === "storageError") {
    console.log("localStorage full - export and clear");
    capture.exportSlides("backup.json");
    capture.clearSlides();
  }
});
```

## 📱 Browser Compatibility

Requires:
- ✅ Modern browser with `getUserMedia` API
- ✅ Canvas API
- ✅ localStorage support
- ✅ Base64 encoding support

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## ⚡ Performance

- Frame comparison: ~5-10ms per frame
- Storage persistence: ~20-50ms per save
- Export process: ~100-500ms depending on slide count

## 📄 License

MIT

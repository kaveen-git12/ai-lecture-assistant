/**
 * 🎥 SMART LECTURE CAPTURE MODULE
 *
 * Captures video frames from camera/screen and detects content changes
 * to automatically capture and save lecture slides
 */

class SmartLectureCapture {
  constructor(options = {}) {
    this.videoElement = null;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.lastFrame = null;
    this.slideCount = 0;
    this.isCapturing = false;
    this.sensitivity = options.sensitivity || 5000000; // Pixel diff threshold
    this.captureInterval = options.captureInterval || 500; // ms between frame checks
    this.minSlideDuration = options.minSlideDuration || 2000; // Minimum ms between slide captures
    this.lastCaptureTime = 0;

    this.slides = [];
    this.listeners = {};
  }

  /**
   * Initialize camera access
   */
  async initializeCamera(videoElementId) {
    try {
      this.videoElement = document.getElementById(videoElementId);

      if (!this.videoElement) {
        throw new Error(`Video element with ID ${videoElementId} not found`);
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      this.videoElement.srcObject = stream;

      console.log(
        "🎥 Camera initialized successfully"
      );
      this.emit("cameraReady");

      return true;
    } catch (err) {
      console.error("❌ Camera initialization failed:", err);
      this.emit("error", {
        type: "cameraError",
        message: err.message,
      });
      return false;
    }
  }

  /**
   * Start capturing frames
   */
  startCapture() {
    if (this.isCapturing) {
      console.warn("⚠️ Capture already in progress");
      return;
    }

    this.isCapturing = true;
    this.slideCount = 0;
    this.slides = [];
    console.log("▶️ Started capturing...");
    this.emit("captureStarted");

    this._captureLoop();
  }

  /**
   * Stop capturing frames
   */
  stopCapture() {
    this.isCapturing = false;
    console.log(
      `⏹️  Stopped capturing. Total slides: ${this.slideCount}`
    );
    this.emit("captureStopped", { slideCount: this.slideCount });
  }

  /**
   * Internal capture loop
   */
  _captureLoop() {
    if (!this.isCapturing) return;

    this._captureFrame();

    setTimeout(() => this._captureLoop(), this.captureInterval);
  }

  /**
   * Capture and analyze current frame
   */
  _captureFrame() {
    if (!this.videoElement || !this.videoElement.videoWidth) return;

    // Set canvas dimensions to match video
    this.canvas.width = this.videoElement.videoWidth;
    this.canvas.height = this.videoElement.videoHeight;

    // Draw current video frame to canvas
    this.ctx.drawImage(
      this.videoElement,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    // Get pixel data
    const currentFrame = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    // Detect if slide changed
    if (this._detectChange(currentFrame, this.lastFrame)) {
      const now = Date.now();

      // Only capture if enough time has passed since last capture
      if (now - this.lastCaptureTime > this.minSlideDuration) {
        this._saveSlide();
        this.lastCaptureTime = now;
      }
    }

    this.lastFrame = currentFrame;
  }

  /**
   * Compare two frames and detect significant changes
   * @param {ImageData} current - Current frame
   * @param {ImageData} previous - Previous frame
   * @returns {boolean} - True if change detected
   */
  _detectChange(current, previous) {
    if (!previous) return true;

    let diff = 0;
    const data1 = current.data;
    const data2 = previous.data;

    // Sample every 4th pixel to speed up comparison
    for (let i = 0; i < data1.length; i += 16) {
      const r1 = data1[i];
      const g1 = data1[i + 1];
      const b1 = data1[i + 2];

      const r2 = data2[i];
      const g2 = data2[i + 1];
      const b2 = data2[i + 2];

      diff += Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
    }

    return diff > this.sensitivity;
  }

  /**
   * Save current slide
   */
  _saveSlide() {
    this.slideCount++;

    const slideData = {
      index: this.slideCount,
      timestamp: new Date().toISOString(),
      image: this.canvas.toDataURL("image/png"),
    };

    this.slides.push(slideData);

    console.log(`📸 Slide #${this.slideCount} captured`);

    // Persist to localStorage
    this._persistToLocalStorage();

    this.emit("slideCapture", slideData);
  }

  /**
   * Persist slides to localStorage
   */
  _persistToLocalStorage() {
    try {
      const slidesJSON = JSON.stringify(this.slides);

      // Check localStorage quota
      if (slidesJSON.length > 5 * 1024 * 1024) {
        console.warn(
          "⚠️ Slides data exceeds localStorage limit. Consider exporting."
        );
        return;
      }

      localStorage.setItem("lectureSlides", slidesJSON);
      console.log(
        `💾 Persisted ${this.slides.length} slides to localStorage`
      );
    } catch (err) {
      console.error("❌ Failed to persist slides:", err);
      this.emit("error", {
        type: "storageError",
        message: err.message,
      });
    }
  }

  /**
   * Load slides from localStorage
   */
  loadFromLocalStorage() {
    try {
      const slidesJSON = localStorage.getItem("lectureSlides");

      if (!slidesJSON) {
        console.log("ℹ️ No saved slides found");
        this.slides = [];
        return [];
      }

      this.slides = JSON.parse(slidesJSON);
      this.slideCount = this.slides.length;

      console.log(`📂 Loaded ${this.slides.length} slides from storage`);
      this.emit("slidesLoaded", { count: this.slides.length });

      return this.slides;
    } catch (err) {
      console.error("❌ Failed to load slides:", err);
      this.emit("error", {
        type: "loadError",
        message: err.message,
      });
      return [];
    }
  }

  /**
   * Clear all saved slides
   */
  clearSlides() {
    this.slides = [];
    this.slideCount = 0;
    localStorage.removeItem("lectureSlides");
    console.log("🗑️ Cleared all slides");
    this.emit("slidesCleared");
  }

  /**
   * Get all captured slides
   */
  getSlides() {
    return [...this.slides];
  }

  /**
   * Export slides as JSON file
   */
  exportSlides(fileName = "lecture-slides.json") {
    try {
      const dataStr = JSON.stringify(
        {
          slides: this.slides,
          count: this.slideCount,
          exportedAt: new Date().toISOString(),
        },
        null,
        2
      );

      const dataBlob = new Blob([dataStr], {
        type: "application/json",
      });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      console.log(`📥 Exported ${this.slides.length} slides`);
    } catch (err) {
      console.error("❌ Export failed:", err);
      this.emit("error", {
        type: "exportError",
        message: err.message,
      });
    }
  }

  /**
   * Set capture sensitivity
   */
  setSensitivity(value) {
    this.sensitivity = value;
    console.log(`⚙️ Sensitivity set to ${value}`);
  }

  /**
   * Event listener registration
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Emit events
   */
  emit(event, data = null) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((callback) => callback(data));
  }

  /**
   * Stop camera stream
   */
  stopCamera() {
    if (this.videoElement && this.videoElement.srcObject) {
      this.videoElement.srcObject
        .getTracks()
        .forEach((track) => track.stop());
      console.log("🛑 Camera stream stopped");
    }
  }
}

export default SmartLectureCapture;

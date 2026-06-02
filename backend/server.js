// ===== IMPORTS =====
require('dotenv').config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");

// API route modules
const authRoutes = require("./src/routes/auth");
const lectureRoutes = require("./src/routes/lectures");
const noteRoutes = require("./src/routes/notes");
const exportRoutes = require("./src/routes/export");
const llmRoutes = require("./src/routes/llm");
const spacedRepetitionRoutes = require("./src/routes/spacedRepetition");
const subtitleRoutes = require("./src/routes/subtitles");
const semanticSearchRoutes = require("./src/routes/semanticSearch");
const analyticsRoutes = require("./src/routes/analytics");
const gamificationRoutes = require("./src/routes/gamification");
const boardMonitorRoutes = require("./src/routes/boardMonitor");

// Node 18+ has fetch built-in
// If error comes, we’ll fix later

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
// increase JSON body size for image upload payloads
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));
// ===== DATABASE CONNECTION =====
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-lecturer';
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// 🔐 API KEY - LOADED FROM .env FILE (Google Gemini API)
const API_KEY = process.env.GOOGLE_API_KEY || "YOUR_NEW_API_KEY";

// ===== TEST ROUTE =====
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ status: 'ok', db: dbStatus, uptime: process.uptime() });
});

// ===== API ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/export", exportRoutes);

// ===== IMAGE SAVE ROUTE =====
app.post("/api/save-image", (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image data provided" });
    }

    // Generate unique filename
    const filename = `capture_${Date.now()}.png`;
    const filepath = path.join(__dirname, 'uploads', 'images', filename);

    // Ensure uploads/images directory exists
    const dir = path.join(__dirname, 'uploads', 'images');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Remove data URL prefix and save as binary
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(filepath, base64Data, 'base64');

    console.log(`✅ Image saved: ${filename}`);
    res.json({
      success: true,
      filename: filename,
      path: `/uploads/images/${filename}`
    });

  } catch (error) {
    console.error("❌ Image save error:", error);
    res.status(500).json({ error: "Failed to save image" });
  }
});
// Phase 2 API routes
app.use("/api/llm", llmRoutes);
app.use("/api/spaced-repetition", spacedRepetitionRoutes);
app.use("/api/subtitles", subtitleRoutes);
app.use("/api/search", semanticSearchRoutes);
// Phase 3 API routes
app.use("/api/analytics", analyticsRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/board-monitor", boardMonitorRoutes);

// ===== CHAT API (Google Gemini) =====
app.post("/api/chat", async (req, res) => {

  const { question, notes } = req.body;

  if (!API_KEY || API_KEY === "YOUR_NEW_API_KEY") {
    return res.status(500).json({ reply: "Server configuration error: GOOGLE_API_KEY not set. Please add a valid Google API key to your .env file." });
  }

  if (!question) {
    return res.status(400).json({ reply: "Question is required." });
  }

  try {
    const prompt = `You are a helpful study assistant. Explain clearly.\n\n${notes ? notes + "\n\n" : ""}${question}`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();

    // Log API response for debugging
    if (!response.ok) {
      console.error('Gemini API error response:', data);
      
      // Handle API key suspension or permission errors
      if (data.error?.message?.includes('Permission denied') || data.error?.message?.includes('suspended')) {
        return res.status(403).json({ 
          reply: "⚠️ API Key Error: The Google API key is invalid or suspended. Please update your GOOGLE_API_KEY in the .env file." 
        });
      }
      
      return res.status(response.status).json({ 
        reply: `API Error: ${data.error?.message || 'Unknown error from Gemini API'}` 
      });
    }

    // Safety check for expected response structure
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected API response structure:', data);
      return res.json({ 
        reply: "API returned unexpected response. Check server logs for details." 
      });
    }

    res.json({
      reply: data.candidates[0].content.parts[0].text
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ reply: `Server error: ${error.message}` });
  }
});

// ===== SUMMARIZE ENDPOINT (Google Gemini) =====
app.post("/api/summarize", async (req, res) => {
  const { notes } = req.body;

  if (!notes || notes.trim().length === 0) {
    return res.status(400).json({ summary: "No notes provided." });
  }

  if (!API_KEY || API_KEY === "YOUR_NEW_API_KEY") {
    return res.status(500).json({ summary: "Server configuration error: GOOGLE_API_KEY not set. Please add a valid Google API key to your .env file." });
  }

  try {
    const prompt = `You are an expert assistant. Summarize the following notes concisely:\n\n${notes}`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error response:', data);
      
      // Handle API key suspension or permission errors
      if (data.error?.message?.includes('Permission denied') || data.error?.message?.includes('suspended')) {
        return res.status(403).json({ 
          summary: "⚠️ API Key Error: The Google API key is invalid or suspended. Please update your GOOGLE_API_KEY in the .env file." 
        });
      }
      
      return res.status(response.status).json({ 
        summary: `API Error: ${data.error?.message || 'Unknown error from Gemini API'}` 
      });
    }
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected API response structure:', data);
      return res.json({ summary: "API returned unexpected response. Check server logs for details." });
    }

    res.json({ summary: data.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error('Summarize endpoint error:', error);
    res.status(500).json({ summary: `Server error: ${error.message}` });
  }
});

// ===== CATCH-ALL FALLBACK ROUTE FOR REACT ROUTER =====
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log("🚀 Server running at http://localhost:" + PORT);
  console.log("📚 Features enabled:");
  console.log("  ✅ User Authentication");
  console.log("  ✅ Lecture Management");
  console.log("  ✅ Audio Transcription (Whisper API)");
  console.log("  ✅ Quiz & Flashcard Generation");
  console.log("  ✅ Study Session Tracking");
  console.log("  ✅ Multi-LLM Support (Phase 2)");
  console.log("  ✅ Spaced Repetition System (Phase 2)");
  console.log("  ✅ Learning Analytics (Phase 3)");
  console.log("  ✅ Gamification System (Phase 3)");
  console.log("  ✅ WebRTC Collaboration (Phase 3)");
  console.log("  ✅ Board Monitor Integration (Phase 3)");
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});
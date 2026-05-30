import express from "express";
import cors from "cors";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// Configure multer for file uploads
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// 🔐 AI Setup
const apiKey = process.env.GOOGLE_API_KEY || "YOUR_API_KEY";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

console.log("🚀 AI Server Initializing...");
console.log(`📡 API Key: ${apiKey.substring(0, 10)}...`);

/* ===============================
   🧠 TEXT AI (summary, notes, etc.)
================================ */
app.post("/api/ai/text", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res
        .status(400)
        .json({ error: "Prompt is required" });
    }

    console.log("📝 Processing text prompt...");

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ reply: text, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("❌ Text AI Error:", err.message);
    res.status(500).json({
      error: "Text AI failed",
      details: err.message,
    });
  }
});

/* ===============================
   🖼️ IMAGE → TEXT (OCR + AI)
================================ */
app.post("/api/ai/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "No image file uploaded" });
    }

    const filePath = req.file.path;
    console.log("🖼️ Processing image from:", filePath);

    // Read file and convert to base64
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString("base64");

    // Determine MIME type
    const ext = path.extname(req.file.originalname).toLowerCase();
    let mimeType = "image/jpeg";
    if (ext === ".png") mimeType = "image/png";
    else if (ext === ".gif") mimeType = "image/gif";
    else if (ext === ".webp") mimeType = "image/webp";

    const result = await model.generateContent([
      "Extract and clean lecture notes from this image. Format the output as structured, well-organized notes with clear sections and bullet points.",
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
    ]);

    const extractedText = result.response.text();

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      text: extractedText,
      fileName: req.file.originalname,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("❌ Image AI Error:", err.message);
    res.status(500).json({
      error: "Image AI processing failed",
      details: err.message,
    });
  }
});

/* ===============================
   📋 BATCH TEXT PROCESSING
================================ */
app.post("/api/ai/batch", async (req, res) => {
  try {
    const { texts, operation } = req.body;

    if (
      !texts ||
      !Array.isArray(texts) ||
      texts.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "texts array is required" });
    }

    console.log(
      `📋 Batch processing ${texts.length} texts with operation: ${operation}`
    );

    const results = [];

    for (const text of texts) {
      const prompt =
        operation === "summarize"
          ? `Summarize this text concisely:\n${text}`
          : operation === "clean"
            ? `Clean and structure these notes:\n${text}`
            : `Process this text:\n${text}`;

      const result = await model.generateContent(prompt);
      results.push({
        input: text.substring(0, 100) + "...",
        output: result.response.text(),
      });
    }

    res.json({
      operation,
      results,
      count: results.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Batch Processing Error:", err.message);
    res.status(500).json({
      error: "Batch processing failed",
      details: err.message,
    });
  }
});

/* ===============================
   🔍 HEALTH CHECK
================================ */
app.get("/api/health", (req, res) => {
  res.json({
    status: "🟢 Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 AI Server running on http://localhost:${PORT}`);
  console.log(`📝 Text API: POST ${PORT}/api/ai/text`);
  console.log(`🖼️  Image API: POST ${PORT}/api/ai/image`);
  console.log(`📋 Batch API: POST ${PORT}/api/ai/batch`);
  console.log(`🔍 Health Check: GET ${PORT}/api/health`);
});

export default app;

/**
 * Board Monitor API Routes
 * ========================
 * Controls the Python board_monitor.py process and serves captured images.
 *
 * Endpoints:
 *   POST   /api/board-monitor/start   — Start the board monitor process
 *   POST   /api/board-monitor/stop    — Stop the board monitor process
 *   GET    /api/board-monitor/status  — Get current monitor status
 *   GET    /api/board-monitor/captures — List all captured images
 *   DELETE /api/board-monitor/captures/:filename — Delete a capture
 */

const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Where the Python script saves captures
const CAPTURES_DIR = path.join(__dirname, "..", "..", "uploads", "board-captures");
const PYTHON_SCRIPT = path.join(__dirname, "..", "..", "..", "ai-engine", "board_monitor.py");

// Track the running process
let monitorProcess = null;
let monitorStatus = "stopped"; // "running" | "stopped" | "error"
let monitorLogs = [];
const MAX_LOGS = 100;

function addLog(msg) {
  const entry = `[${new Date().toISOString()}] ${msg}`;
  monitorLogs.push(entry);
  if (monitorLogs.length > MAX_LOGS) monitorLogs.shift();
  console.log(`[BoardMonitor] ${msg}`);
}

// ── START ──────────────────────────────────────
router.post("/start", (req, res) => {
  if (monitorProcess && monitorStatus === "running") {
    return res.status(400).json({ error: "Board monitor is already running" });
  }

  // Ensure captures directory exists
  fs.mkdirSync(CAPTURES_DIR, { recursive: true });

  try {
    monitorProcess = spawn("python", [PYTHON_SCRIPT, "--save-dir", CAPTURES_DIR], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    monitorStatus = "running";
    monitorLogs = [];
    addLog("Board monitor started");

    monitorProcess.stdout.on("data", (data) => {
      const lines = data.toString().split("\n").filter(Boolean);
      lines.forEach((line) => addLog(line.trim()));
    });

    monitorProcess.stderr.on("data", (data) => {
      const lines = data.toString().split("\n").filter(Boolean);
      lines.forEach((line) => addLog(`[stderr] ${line.trim()}`));
    });

    monitorProcess.on("close", (code) => {
      addLog(`Process exited with code ${code}`);
      monitorStatus = "stopped";
      monitorProcess = null;
    });

    monitorProcess.on("error", (err) => {
      addLog(`Process error: ${err.message}`);
      monitorStatus = "error";
      monitorProcess = null;
    });

    res.json({ status: "started", message: "Board monitor is now running" });
  } catch (err) {
    addLog(`Failed to start: ${err.message}`);
    monitorStatus = "error";
    res.status(500).json({ error: `Failed to start board monitor: ${err.message}` });
  }
});

// ── STOP ───────────────────────────────────────
router.post("/stop", (req, res) => {
  if (!monitorProcess || monitorStatus !== "running") {
    return res.status(400).json({ error: "Board monitor is not running" });
  }

  try {
    // Send 'q' keypress to gracefully quit, then force-kill after timeout
    monitorProcess.stdin.write("q\n");

    const killTimeout = setTimeout(() => {
      if (monitorProcess) {
        monitorProcess.kill("SIGTERM");
        addLog("Force-killed after timeout");
      }
    }, 3000);

    monitorProcess.on("close", () => {
      clearTimeout(killTimeout);
    });

    // Also try killing directly since stdin may not work with cv2.waitKey
    setTimeout(() => {
      if (monitorProcess) {
        monitorProcess.kill();
      }
    }, 500);

    monitorStatus = "stopped";
    addLog("Board monitor stop requested");
    res.json({ status: "stopped", message: "Board monitor is stopping" });
  } catch (err) {
    addLog(`Stop error: ${err.message}`);
    res.status(500).json({ error: `Failed to stop: ${err.message}` });
  }
});

// ── STATUS ─────────────────────────────────────
router.get("/status", (req, res) => {
  // Count captures
  let captureCount = 0;
  try {
    if (fs.existsSync(CAPTURES_DIR)) {
      captureCount = fs.readdirSync(CAPTURES_DIR).filter((f) => f.endsWith(".jpg")).length;
    }
  } catch {}

  res.json({
    status: monitorStatus,
    captureCount,
    logs: monitorLogs.slice(-20),
  });
});

// ── LIST CAPTURES ──────────────────────────────
router.get("/captures", (req, res) => {
  try {
    if (!fs.existsSync(CAPTURES_DIR)) {
      return res.json({ captures: [] });
    }

    const files = fs
      .readdirSync(CAPTURES_DIR)
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .map((f) => {
        const stat = fs.statSync(path.join(CAPTURES_DIR, f));
        // Parse trigger type from filename: 2024-01-15_10-32-00_new_content.jpg
        const parts = f.replace(/\.\w+$/, "").split("_");
        const triggerType = parts.slice(2).join("_") || "unknown";

        return {
          filename: f,
          url: `/api/board-monitor/captures/file/${f}`,
          triggerType,
          size: stat.size,
          createdAt: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ captures: files });
  } catch (err) {
    res.status(500).json({ error: `Failed to list captures: ${err.message}` });
  }
});

// ── SERVE CAPTURE FILE ─────────────────────────
router.get("/captures/file/:filename", (req, res) => {
  const filepath = path.join(CAPTURES_DIR, req.params.filename);
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: "File not found" });
  }
  res.sendFile(filepath);
});

// ── DELETE CAPTURE ─────────────────────────────
router.delete("/captures/:filename", (req, res) => {
  const filepath = path.join(CAPTURES_DIR, req.params.filename);
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: "File not found" });
  }

  try {
    fs.unlinkSync(filepath);
    res.json({ success: true, message: `Deleted ${req.params.filename}` });
  } catch (err) {
    res.status(500).json({ error: `Failed to delete: ${err.message}` });
  }
});

// ── IMPORT CAPTURE TO SLIDES ───────────────────
router.post("/captures/import/:filename", (req, res) => {
  const srcPath = path.join(CAPTURES_DIR, req.params.filename);
  if (!fs.existsSync(srcPath)) {
    return res.status(404).json({ error: "File not found" });
  }

  try {
    // Read image and convert to base64 data URL
    const imageBuffer = fs.readFileSync(srcPath);
    const base64 = imageBuffer.toString("base64");
    const mimeType = req.params.filename.endsWith(".png") ? "image/png" : "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    res.json({
      success: true,
      image: dataUrl,
      filename: req.params.filename,
    });
  } catch (err) {
    res.status(500).json({ error: `Failed to import: ${err.message}` });
  }
});

module.exports = router;

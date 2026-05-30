// ===== VARIABLES =====
let video, canvas, ctx;
let slideCount = 0;
let images = [];
let model;
let lastFrame = null;
let lastImage = null;
let isRunning = true;
let stream;

let extractedText = "";
let topicData = [];

let slides = [];
let currentSlideIndex = -1;
let awaitingNextSlide = false;


// ===== INIT =====
window.onload = () => {
  video = document.getElementById("video");
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  updateStatus("Ready to start");
};

function updateStatus(message) {
  const statusBox = document.getElementById("status-box");
  if (statusBox) statusBox.innerText = message;
}

// ===== LOAD MODEL =====
async function loadModel() {
  updateStatus("Loading AI model...");
  model = await cocoSsd.load();
  console.log("AI Model Loaded");
  updateStatus("AI model loaded");
}

// ===== CAMERA =====
async function startCamera() {
  try {
    updateStatus("Requesting camera access...");
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();

    await loadModel();
    setInterval(autoCapture, 2000);
    updateStatus("Camera ready — AI model loaded.");
  } catch (err) {
    console.error(err);
    updateStatus("Camera access failed: " + (err.message || err));
    alert("Camera access failed: " + (err.message || err));
  }
}

function stopCamera() {
  if (stream) stream.getTracks().forEach(t => t.stop());
  isRunning = false;
}

// ===== PERSON DETECTION =====
async function detectPerson() {
  const predictions = await model.detect(video);
  return predictions.some(p => p.class === "person");
}

// ===== SMART AUTO CAPTURE =====
async function autoCapture() {

  if (!model || !isRunning) return;
  if (!video || !canvas || !ctx) return;

  if (!video.videoWidth || !video.videoHeight) {
    console.warn('autoCapture skipped: video dimensions not ready', video.videoWidth, video.videoHeight);
    return;
  }

  let personPresent = await detectPerson();
  if (personPresent) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  // 🎯 CENTER REGION ONLY
  let cropX = Math.round(canvas.width * 0.2);
  let cropY = Math.round(canvas.height * 0.2);
  let cropW = Math.max(1, Math.round(canvas.width * 0.6));
  let cropH = Math.max(1, Math.round(canvas.height * 0.6));

  if (cropW <= 0 || cropH <= 0) {
    console.warn('autoCapture skipped: computed crop area invalid', {cropW, cropH});
    return;
  }

  ctx.strokeStyle = "red";
  ctx.strokeRect(cropX, cropY, cropW, cropH);

  let currentFrame = ctx.getImageData(cropX, cropY, cropW, cropH);

  if (!lastFrame) {
    lastFrame = currentFrame;
    return;
  }

  let diff = getFrameDifference(currentFrame, lastFrame);
  console.log("Diff:", diff);

  if (diff > 15) {
    let img = canvas.toDataURL("image/png");

    if (awaitingNextSlide || slides.length === 0) {
      addNewSlide(img);
      awaitingNextSlide = false;
      console.log("New slide captured ✅");
    } else {
      replaceCurrentSlide(img);
      console.log("Slide replaced ✅");
    }

    lastImage = img;
    lastFrame = currentFrame;
    updateSlideCountUI();
  }
}

// ===== DIFFERENCE =====
function getFrameDifference(f1, f2) {
  let diff = 0;

  for (let i = 0; i < f1.data.length; i += 4) {
    diff += Math.abs(f1.data[i] - f2.data[i]);
    diff += Math.abs(f1.data[i+1] - f2.data[i+1]);
    diff += Math.abs(f1.data[i+2] - f2.data[i+2]);
  }

  return diff / (f1.data.length / 4);
}

// ===== MANUAL CAPTURE =====
async function captureImage() {
  if (!model) return alert("AI not loaded");
  if (!video || !canvas || !ctx) return alert("Camera not initialized");

  if (!video.videoWidth || !video.videoHeight) {
    console.warn('captureImage skipped: video dimensions not ready', video.videoWidth, video.videoHeight);
    return alert('Video frame not ready yet');
  }

  let personPresent = await detectPerson();
  if (personPresent) return alert("Blocked!");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0);

  let img = canvas.toDataURL("image/png");

  if (awaitingNextSlide || slides.length === 0) {
    addNewSlide(img);
    awaitingNextSlide = false;
  } else {
    replaceCurrentSlide(img);
  }

  updateSlideCountUI();
}

function addNewSlide(img) {
  slides.push({ image: img, extractedText: "" });
  currentSlideIndex = slides.length - 1;
  images.push(img);
  slideCount = slides.length;
  updateSlidesUI();
}

function replaceCurrentSlide(img) {
  if (currentSlideIndex < 0) {
    addNewSlide(img);
    return;
  }
  slides[currentSlideIndex].image = img;
  images[currentSlideIndex] = img;
  updateSlidesUI();
}

function nextSlide() {
  awaitingNextSlide = true;
  currentSlideIndex = slides.length;
  document.getElementById("count").innerText = slides.length + 1;
}

function updateSlideCountUI() {
  document.getElementById("count").innerText = slides.length;
}

function updateSlidesUI() {
  let notes = slides.map((slide, idx) => {
    let marker = idx === currentSlideIndex ? " (current)" : "";
    return `Slide ${idx + 1}${marker}`;
  });

  if (notes.length === 0) notes = ["No slides captured yet."];

  document.getElementById("output").innerText = notes.join("\n");
}


// ===== OCR =====
async function extractText() {

  if (images.length === 0) return alert("No slides");

  let full = "";

  for (let img of images) {
    let res = await Tesseract.recognize(img, 'eng');
    full += res.data.text + " ";
  }

  extractedText = full;
  document.getElementById("output").innerText = full;
}

// ===== AI BACKEND INTEGRATION =====

const API_BASE = 'http://localhost:5000/api';

// ===== AI SUMMARY =====

async function generateSummary() {

  if (!extractedText) return alert("No text");

  updateStatus("Generating summary...");

  try {

    const response = await fetch(`${API_BASE}/summary`, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ text: extractedText })

    });

    const data = await response.json();

    document.getElementById("output").innerText = data.summary;

    updateStatus("Summary generated");

  } catch (error) {

    updateStatus("Error generating summary");

    alert('Error: ' + error.message);

  }

}

// ===== AI TOPICS =====

async function generateTopics() {

  if (!extractedText) return alert("No text");

  updateStatus("Extracting topics...");

  try {

    const response = await fetch(`${API_BASE}/topics`, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ text: extractedText })

    });

    const data = await response.json();

    document.getElementById("topics").innerText = data.topics;

    updateStatus("Topics extracted");

  } catch (error) {

    updateStatus("Error extracting topics");

    alert('Error: ' + error.message);

  }

}

// ===== SMART PDF =====

async function generateSmartPDF() {

  if (images.length === 0) return alert("No slides");

  updateStatus("Generating smart PDF...");

  try {

    const subject = document.getElementById("subject").value || "Lecture";

    const response = await fetch(`${API_BASE}/pdf-title`, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ text: extractedText, subject })

    });

    const data = await response.json();

    const title = data.title;

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();

    pdf.setFontSize(20);

    pdf.text(title, 20, 30);

    pdf.setFontSize(12);

    pdf.text(`Subject: ${subject}`, 20, 50);

    pdf.text(`Topics: ${document.getElementById("topics").value}`, 20, 60);

    let y = 80;

    for (let i = 0; i < images.length; i++) {

      if (y > 250) {

        pdf.addPage();

        y = 30;

      }

      pdf.text(`Slide ${i + 1}`, 20, y);

      y += 10;

      if (slides[i].extractedText) {

        const lines = pdf.splitTextToSize(slides[i].extractedText, 170);

        pdf.text(lines, 20, y);

        y += lines.length * 5 + 10;

      }

    }

    pdf.save(`${title}.pdf`);

    updateStatus("Smart PDF generated");

  } catch (error) {

    updateStatus("Error generating PDF");

    alert('Error: ' + error.message);

  }

}

// ===== AI CHAT =====

async function sendMessage() {

  const userInput = document.getElementById("userInput");

  const message = userInput.value.trim();

  if (!message) return;

  const chatBox = document.getElementById("chat-box");

  chatBox.innerHTML += `<div><strong>You:</strong> ${message}</div>`;

  userInput.value = '';

  updateStatus("Thinking...");

  try {

    const response = await fetch(`${API_BASE}/chat`, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ message, context: extractedText })

    });

    const data = await response.json();

    chatBox.innerHTML += `<div><strong>AI Tutor:</strong> ${data.answer}</div>`;

    chatBox.scrollTop = chatBox.scrollHeight;

    updateStatus("Ready");

  } catch (error) {

    updateStatus("Error in chat");

    alert('Error: ' + error.message);

  }

}

// ===== LEARNING RESOURCES =====

async function findVideos() {

  const topics = document.getElementById("topics").value.split(',').map(t => t.trim());

  if (!topics.length) return alert("Enter topics");

  updateStatus("Finding videos...");

  try {

    const response = await fetch(`${API_BASE}/youtube`, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ topic: topics[0] })

    });

    const data = await response.json();

    let output = "Learning Resources:\n\n";

    data.videos.forEach(v => {

      output += `📹 ${v.title}\n🔗 ${v.url}\n\n`;

    });

    document.getElementById("output").innerText = output;

    updateStatus("Videos found");

  } catch (error) {

    updateStatus("Error finding videos");

    alert('Error: ' + error.message);

  }

}

// ===== VISUAL ENHANCER =====

async function enhanceWithImages() {

  if (!extractedText) return alert("No text");

  updateStatus("Enhancing with images...");

  try {

    const topics = document.getElementById("topics").value.split(',').map(t => t.trim());

    const response = await fetch(`${API_BASE}/images`, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ topics })

    });

    const data = await response.json();

    let enhancedNotes = extractedText;

    for (const [topic, img] of Object.entries(data.images)) {

      enhancedNotes = enhancedNotes.replace(new RegExp(`\\b${topic}\\b`, 'gi'), `${topic}\n[Image: ${img.alt}]\n${img.url}\n`);

    }

    document.getElementById("output").innerText = enhancedNotes;

    updateStatus("Notes enhanced with images");

  } catch (error) {

    updateStatus("Error enhancing");

    alert('Error: ' + error.message);

  }

}

// ===== AUTO COMPLETION =====

async function completeNotes() {

  if (!extractedText) return alert("No text");

  updateStatus("Completing notes...");

  try {

    const response = await fetch(`${API_BASE}/complete`, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ text: extractedText })

    });

    const data = await response.json();

    document.getElementById("output").innerText = data.completedText;

    updateStatus("Notes completed");

  } catch (error) {

    updateStatus("Error completing");

    alert('Error: ' + error.message);

  }

}

// ===== EXAM PREPARATION =====

async function generateExamPrep() {

  const subject = document.getElementById("examSubject").value;

  const level = document.getElementById("examLevel").value;

  const examDate = document.getElementById("examDate").value;

  if (!subject || !level || !examDate) return alert("Fill all fields");

  updateStatus("Generating exam prep...");

  try {

    const response = await fetch(`${API_BASE}/exam`, {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ subject, level, examDate })

    });

    const data = await response.json();

    document.getElementById("exam-output").innerText = data.examPrep;

    updateStatus("Exam prep generated");

  } catch (error) {

    updateStatus("Error generating exam prep");

    alert('Error: ' + error.message);

  }

}

// ===== TOPICS =====
function generateTopics() {

  let words = extractedText.split(" ");
  let unique = [...new Set(words)];
  let topics = unique.slice(0, 5);

  let box = document.getElementById("topics");
  box.innerHTML = "";

  topicData = [];

  topics.forEach(t => {
    let clean = t.replace(/[^a-z]/gi, "");
    if (clean.length < 4) return;

    let img = `https://source.unsplash.com/400x200/?${clean}`;
    let yt = `https://www.youtube.com/results?search_query=${clean}`;

    topicData.push({ title: clean, image: img, youtube: yt });

    box.innerHTML += `
      <div class="topic-card">
        <h3>${clean}</h3>
        <img src="${img}">
        <br>
        <a href="${yt}" target="_blank">Watch</a>
      </div>
    `;
  });
}

// ===== PDF =====
function generatePDF() {
  const { jsPDF } = window.jspdf;
  let pdf = new jsPDF();

  let subject = document.getElementById("subject").value || "lecture";
  let topics = document.getElementById("topics").value || "notes";

  pdf.text(`Subject: ${subject}` , 10, 10);
  pdf.text(`Topics: ${topics}` , 10, 18);

  images.forEach((img, i) => {
    if (i !== 0) pdf.addPage();
    pdf.addImage(img, 'PNG', 10, 10, 180, 160);
  });

  let safeName = subject.replace(/[\\/:*?"<>|]/g, "_");
  let fileName = `${safeName}_${topics.replace(/\s+/g, "_") || "slides"}.pdf`;
  pdf.save(fileName);
}

// ===== SMART PDF =====
async function generateSmartPDF() {

  const { jsPDF } = window.jspdf;
  let pdf = new jsPDF();
  let y = 10;

  pdf.text("AI Notes", 10, y);
  y += 10;

  let summary = document.getElementById("output").innerText;
  let split = pdf.splitTextToSize(summary, 180);
  pdf.text(split, 10, y);
  y += split.length * 7;

  for (let t of topicData) {

    if (y > 250) {
      pdf.addPage();
      y = 10;
    }

    pdf.text(t.title, 10, y);
    y += 8;

    try {
      let img = await loadImage(t.image);
      pdf.addImage(img, 'JPEG', 10, y, 180, 80);
      y += 85;
    } catch {}

    pdf.text(t.youtube, 10, y);
    y += 10;
  }

  pdf.save("smart.pdf");
}

// ===== LOAD IMAGE =====
function loadImage(url) {
  return new Promise((res, rej) => {
    let img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => res(img);
    img.onerror = rej;
  });
}

// ===== CHAT =====
async function sendMessage() {

  let input = document.getElementById("userInput");
  let msg = input.value.trim();
  if (!msg) return;

  addMessage(msg, "user");
  addMessage("...thinking...", "ai");

  let reply = await generateAIResponse(msg);

  let chatBox = document.getElementById("chat-box");
  let lastAI = [...chatBox.querySelectorAll('.message.ai')].pop();
  if (lastAI) lastAI.innerText = reply;

  input.value = "";
}

function addMessage(text, type) {
  let box = document.getElementById("chat-box");

  let div = document.createElement("div");
  div.className = "message " + type;
  div.innerText = text;

  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

async function requestSummary() {
  if (!extractedText) {
    return alert("Extract notes first before summarizing.");
  }

  document.getElementById("summary-box").innerText = "Generating summary...";

  try {
    let res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: extractedText })
    });

    let data = await res.json();
    if (!res.ok) {
      document.getElementById("summary-box").innerText = `Summary error: ${data.summary || res.status}`;
      return;
    }

    document.getElementById("summary-box").innerText = data.summary;
  } catch (err) {
    console.error(err);
    document.getElementById("summary-box").innerText = "Summary failed. Check server logs.";
  }
}

// ===== REAL AI =====
async function generateAIResponse(question) {
  if (!extractedText) {
    return "Please first capture slides and extract notes before asking questions.";
  }

  try {
    let res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question,
        notes: extractedText
      })
    });

    let data = await res.json();
    if (res.ok) {
      return data.reply || "No response from AI.";
    }
    return data.reply || `Server error: ${res.status}`;
  } catch (err) {
    console.error(err);
    return "Network error: could not reach AI API server.";
  }
}

// ===== PAUSE =====
function toggleAuto() {
  isRunning = !isRunning;
}
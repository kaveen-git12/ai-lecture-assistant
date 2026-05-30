# 🚀 Quick Start Guide

## 1️⃣ Install Dependencies

```bash
npm install multer  # File upload handler (if not installed with npm install)
npm install
```

## 2️⃣ Setup Environment Variables

Create `.env` file:

```env
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.mongodb.net/ai-lecturer
OPENAI_API_KEY=sk-...your-key...
JWT_SECRET=my-super-secret-key-123
PORT=3000
NODE_ENV=development
```

## 3️⃣ Start Backend

**Terminal 1 - Backend:**
```bash
npm start
# Server running at http://localhost:3000
```

**Terminal 2 - Frontend (if developing):**
```bash
npm run dev
# Webpack dev server at http://localhost:8080
```

## 4️⃣ Test the Features

### 🔐 Test Authentication
```javascript
// In DevTools console:
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    confirmPassword: 'password123'
  })
}).then(r => r.json()).then(d => {
  console.log(d);
  localStorage.setItem('token', d.token);
});
```

### 📝 Create a Lecture
```javascript
const token = localStorage.getItem('token');
fetch('/api/lectures/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'My First Lecture',
    subject: 'Computer Science'
  })
}).then(r => r.json()).then(console.log);
```

### 🎙️ Transcribe Audio
```javascript
const formData = new FormData();
const audioFile = document.querySelector('input[type=file]').files[0];
formData.append('audio', audioFile);
formData.append('lectureId', 'LECTURE_ID_HERE');

fetch('/api/lectures/transcribe', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
}).then(r => r.json()).then(console.log);
```

### 🧠 Generate Quiz
```javascript
fetch('/api/notes/NOTE_ID/quiz', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(d => {
  console.log('Quiz generated:', d.quiz);
});
```

## 📁 Project Structure

```
AI LECTURE ASSISTANT/
├── server.js                          # Main backend server
├── models/                            # Database schemas
│   ├── User.js
│   ├── Lecture.js
│   ├── Note.js
│   └── StudySession.js
├── routes/                            # API endpoints
│   ├── auth.js                        # Authentication
│   ├── lectures.js                    # Lecture management
│   ├── notes.js                       # Notes & quizzes
│   └── export.js                      # Export formats
├── utils/                             # Helper functions
│   ├── auth.js                        # JWT utilities
│   └── aiServices.js                  # OpenAI API calls
├── src/
│   ├── App.js                         # Main React app
│   ├── components/
│   │   ├── AuthPanel.js              # Login/Register
│   │   ├── Dashboard.js              # Learning dashboard
│   │   ├── VideoRecorder.js          # Screen recording
│   │   ├── QuizPanel.js              # Quiz interface
│   │   ├── ChatPanel.js              # Chat with AI
│   │   └── ...
│   └── styles.css
├── package.json                       # Dependencies
└── webpack.config.js                  # Webpack config
```

## 🔧 Available Commands

```bash
npm start              # Build & run backend
npm run build          # Build frontend only
npm run dev            # Frontend dev server (watch mode)
npm run server         # Backend only (no builds)
```

## ✅ Features Ready to Use

✅ User registration & login  
✅ Lecture management  
✅ Audio transcription (Whisper)  
✅ Auto quiz generation  
✅ Flashcard creation  
✅ PDF/Word/Markdown export  
✅ Learning dashboard  
✅ Screen recording  

## 🔗 Important Links

- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **OpenAI API:** https://platform.openai.com/api-keys
- **API Docs:** See `IMPLEMENTATION_GUIDE.md`

## 🐛 Common Issues

**Q: "MongoDB Authentication Failed"**  
A: Check MONGODB_URI format and ensure IP whitelist includes your IP

**Q: "OPENAI_API_KEY is undefined"**  
A: Restart server after adding to .env file

**Q: "Port 3000 already in use"**  
A: Change PORT in .env or kill process: `lsof -i :3000` (Mac/Linux)

---

**Ready to go!** 🎉

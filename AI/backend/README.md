# 🚀 AI BACKEND SERVER - MAIN AI ENGINE

Backend Express server providing AI-powered APIs for lecture processing using Google Generative AI (Gemini).

## 📋 Features

- **🧠 Text AI Processing** - Summarization, note cleaning, and text enhancement
- **🖼️ Image OCR + AI** - Extract text from lecture slides and process them
- **📋 Batch Processing** - Process multiple texts/images in parallel
- **🔍 Health Monitoring** - Server status and uptime tracking
- **📁 File Management** - Automatic upload directory creation and cleanup

## 🔧 Installation

```bash
cd AI/backend
npm install
```

### Required Environment Variables

Create a `.env` file:

```
GOOGLE_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY
PORT=3000
```

Get your API key: https://makersuite.google.com/app/apikey

## 🚀 Running the Server

### Development
```bash
npm run dev  # with auto-reload via nodemon
```

### Production
```bash
npm start
```

Server starts on `http://localhost:3000`

## 📡 API Endpoints

### 1️⃣ Text Processing
**POST** `/api/ai/text`

```json
{
  "prompt": "Clean and structure these notes: ..."
}
```

Response:
```json
{
  "reply": "Cleaned and structured text...",
  "timestamp": "2026-04-16T10:00:00.000Z"
}
```

### 2️⃣ Image Processing (OCR + AI)
**POST** `/api/ai/image`

- Content-Type: `multipart/form-data`
- Field: `image` (file)
- Supported formats: JPEG, PNG, GIF, WebP

Response:
```json
{
  "text": "Extracted and formatted text...",
  "fileName": "slide.png",
  "timestamp": "2026-04-16T10:00:00.000Z"
}
```

### 3️⃣ Batch Processing
**POST** `/api/ai/batch`

```json
{
  "texts": ["note 1", "note 2", "note 3"],
  "operation": "summarize"  // or "clean"
}
```

Response:
```json
{
  "operation": "summarize",
  "results": [
    {
      "input": "note 1...",
      "output": "summary 1..."
    }
  ],
  "count": 3,
  "timestamp": "2026-04-16T10:00:00.000Z"
}
```

### 4️⃣ Health Check
**GET** `/api/health`

Response:
```json
{
  "status": "🟢 Server is running",
  "timestamp": "2026-04-16T10:00:00.000Z",
  "uptime": 3600.5
}
```

## 🔌 Integration Examples

### Node.js/Express
```javascript
import fetch from "node-fetch";

const response = await fetch("http://localhost:3000/api/ai/text", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "Summarize this: ..."
  })
});

const data = await response.json();
console.log(data.reply);
```

### React
```javascript
const [result, setResult] = useState("");

async function processText(prompt) {
  const response = await fetch("http://localhost:3000/api/ai/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  
  const data = await response.json();
  setResult(data.reply);
}
```

### Frontend Image Upload
```javascript
async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  
  const response = await fetch("http://localhost:3000/api/ai/image", {
    method: "POST",
    body: formData
  });
  
  const data = await response.json();
  console.log("Extracted text:", data.text);
}
```

## 🛠️ Configuration

Edit `server.js` to customize:

- **Line 16**: Change default model from `gemini-1.5-flash`
- **Line 69**: Adjust file size limit (default: 50MB)
- **Line 18**: Configure CORS origin restrictions

## 📦 Dependencies

- **express** - Web framework
- **cors** - Cross-Origin Resource Sharing
- **multer** - File upload handling
- **@google/generative-ai** - Google Gemini AI

## ⚠️ Error Handling

All endpoints return proper HTTP status codes:

- `200` - Success
- `400` - Bad request (missing fields)
- `500` - Server error

Error responses:
```json
{
  "error": "Error description",
  "details": "Detailed error message"
}
```

## 🚦 Troubleshooting

### "API Key not configured"
```bash
# Set environment variable
export GOOGLE_API_KEY=your_key_here
npm start
```

### "CORS error"
Ensure your frontend is allowed:
```javascript
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"]
}));
```

### "File too large"
Increase the limit in server.js:
```javascript
app.use(express.json({ limit: "100mb" }));
```

## 📊 Logging

Server logs are prefixed with emojis for clarity:
- 🚀 Startup events
- 📝 Text processing
- 🖼️ Image processing
- 📋 Batch operations
- ✅ Success messages
- ❌ Error messages

## 🔐 Security Notes

1. **API Key** - Keep `GOOGLE_API_KEY` secret, never commit to repo
2. **CORS** - Configure allowed origins in production
3. **Rate Limiting** - Consider adding rate limiter for production
4. **File Validation** - Currently accepts all image types (add validation as needed)

## 📈 Performance Tips

- Batch process multiple items instead of individual requests
- Use appropriate image sizes (1-10MB recommended)
- Implement caching for repeated prompts
- Use CDN for static assets

## 📝 License

MIT

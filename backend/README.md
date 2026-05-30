# ⚙️ Backend - API Server & AI Logic

Express.js server with Google Gemini AI integration for lecture processing.

## 📁 Structure

```
src/
├── controllers/        # Request handlers
├── routes/             # API endpoints
├── models/             # Database schemas
├── services/           # Core business logic
│   └── ai/            # AI detection services
├── middleware/         # Express middlewares
├── config/             # Environment config
└── utils/              # Helpers & loggers
```

## 🚀 Getting Started

```bash
npm install
GOOGLE_API_KEY=your_key node server.js
```

API runs on: `http://localhost:3000`

## 🔐 Environment Variables

```env
GOOGLE_API_KEY=your_google_gemini_api_key
MONGODB_URI=mongodb://localhost:27017/ai-lecturer
PORT=3000
NODE_ENV=development
```

## 📡 API Endpoints

### AI Processing
- `POST /api/ai/text` - Process text with AI
- `POST /api/ai/image` - OCR + AI image processing
- `POST /api/ai/batch` - Batch process multiple items

### Lectures
- `GET /api/lectures` - List lectures
- `GET /api/lectures/:id` - Get lecture details
- `POST /api/lectures` - Create lecture
- `PUT /api/lectures/:id` - Update lecture

### Detection
- `POST /api/detect/slides` - Detect slide changes
- `POST /api/detect/person` - Detect person in frame

## 🧠 AI Services

### `ai/slideDetection.js`
Detects when lecture slides change using pixel difference analysis.

### `ai/ocr.js`
Extracts text from images using Tesseract.js and formats the output.

### `ai/personDetection.js`
Blocks capture if a person is detected (privacy protection).

### `ai/changeDetection.js`
Analyzes frame differences to detect significant content changes.

## 📦 Dependencies

- Express 4.x
- MongoDB + Mongoose
- Google Generative AI
- Multer (File uploads)
- CORS, JWT

## 🔗 Integration

### Frontend Requests
All frontend requests to `/api/*` are proxied to port 3000.

### External APIs
- Google Gemini API for AI processing
- MongoDB for data storage

## 🛣️ Adding New Routes

1. Create controller in `src/controllers/`
2. Create route in `src/routes/`
3. Register route in `app.js`

Example:
```js
// controllers/newController.js
exports.myAction = async (req, res) => {
  res.json({ success: true });
};

// routes/newRoutes.js
router.post('/action', newController.myAction);

// app.js
app.use('/api/new', newRoutes);
```

## 🧪 Testing

```bash
npm run test
```

## 🔧 Troubleshooting

**"Cannot find module"**
- Run `npm install`
- Check import paths

**"API Key not configured"**
- Set `GOOGLE_API_KEY` environment variable
- Get key from: https://makersuite.google.com/app/apikey

**"MongoDB connection error"**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`

## 📈 Performance

- Caching for repeated prompts
- Image optimization before processing
- Batch processing for multiple slides
- Connection pooling for DB

## 🔒 Security

- Input validation on all endpoints
- Rate limiting recommended
- CORS configured for frontend origin
- File upload validation

## 📝 License

MIT

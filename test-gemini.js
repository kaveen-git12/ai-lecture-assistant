// Quick test to verify Gemini API key is working
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

async function testGemini() {
  try {
    console.log("🧪 Testing Gemini 2.0 Flash model...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Hello, are you working?");
    console.log("✅ Gemini API is working!");
    console.log("Response:", result.response.text());
  } catch (error) {
    console.error("❌ Gemini API test failed:");
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

testGemini();
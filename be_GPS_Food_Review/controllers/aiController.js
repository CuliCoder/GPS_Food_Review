const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const foodVendors = require("../models/foods");
const ask_gemini = async (req, res) => {
  const { question } = req.body;

  // RAG: Đưa dữ liệu quán ăn vào làm ngữ cảnh cho Gemini
  const context = JSON.stringify(foodVendors);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }); // Hoặc gemini-pro

  const prompt = `Bạn là trợ lý ảo cho tuyến phố ẩm thực. 
    Dựa trên danh sách quán ăn sau: ${context}. 
    Hãy trả lời câu hỏi của khách hàng một cách thân thiện: ${question}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  res.json({ answer: response.text() });
};
module.exports = {
  ask_gemini,
};

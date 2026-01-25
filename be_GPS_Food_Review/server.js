// server.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Địa chỉ của Vite React
    methods: ['GET', 'POST'],
    credentials: true
}));
// Khởi tạo Gemini với API Key của bạn
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const foodVendors = [
  {
    name: "Phở Gia Truyền",
    dish: "Phở bò",
    desc: "Nước dùng ngọt thanh, thịt bò mềm.",
  },
  {
    name: "Bánh Mì Hội An",
    dish: "Bánh mì thập cẩm",
    desc: "Nổi tiếng với nước sốt đặc trưng.",
  },
];

app.post("/api/ask-gemini", async (req, res) => {
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
});
app.listen(3000, () => console.log("Server chạy tại port 3000"));

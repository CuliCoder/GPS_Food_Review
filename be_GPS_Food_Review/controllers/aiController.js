const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const foodVendors = require("../models/foods");
const ask_gemini = async (req, res) => {
  const { question, language } = req.body;
  const context = JSON.stringify(foodVendors);
  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    systemInstruction: {
      role: "system",
      parts: [
        {
          text: `Bạn là hướng dẫn viên du lịch bản địa sành ăn. 
      Nhiệm vụ: Tư vấn quán ăn dựa trên dữ liệu: ${context}.
      Quy tắc bắt buộc:
      1. LUÔN LUÔN phản hồi bằng ngôn ngữ mã: ${language}.
      2. Phong cách: Thân thiện, tự nhiên như đang trò chuyện trực tiếp, không dùng từ ngữ kỹ thuật hay liệt kê khô khan.
      3. Nếu khách hỏi bằng ngôn ngữ khác, vẫn phải trả lời bằng ${language}.
      4. Hãy trả về JSON theo cấu trúc sau:
      {
          "display_text": "Nội dung hiển thị cho người dùng. Đối với tên quán và tên món ăn: Hãy viết theo định dạng "Tên dịch [Tên gốc tiếng Việt]". 
          Ví dụ: "Bánh mì Hội An [Bánh Mì Hội An]" hoặc "越南河粉 [Phở bò]
          "speech_text": "Nội dung để robot đọc (chỉ dùng ngôn ngữ ${language}, bỏ qua các phần chú thích tên gốc rườm rà)"
      }`,
        },
      ],
    },
  });
  const result = await model.generateContent(question);
  const response = await result.response;
  res.json({ answer: response.text() });
};
module.exports = {
  ask_gemini,
};

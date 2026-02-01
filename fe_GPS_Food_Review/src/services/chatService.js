// Chat Service - Gọi API Gemini từ Backend
const API_BASE_URL = "http://localhost:3000";

const sendMessageToGemini = async (question) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ask-gemini`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.answer;
  } catch (error) {
    console.error("Chat Error:", error);
    return "Xin lỗi, không thể kết nối tới AI. Vui lòng thử lại!";
  }
};

export default sendMessageToGemini;

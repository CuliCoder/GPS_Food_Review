// Chat Service - Gọi API Gemini từ Backend
const API_BASE_URL = "http://localhost:3000";

const requestAssistantReply = async (question, language = "vi") => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ask-assistant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, language }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return {
      answer: data?.answer || "Xin lỗi, tôi chưa có phản hồi phù hợp.",
      speechText: data?.speechText || data?.answer || "",
      language: data?.language || language,
    };
  } catch (error) {
    console.error("Chat Error:", error);
    return {
      answer: "Xin lỗi, không thể kết nối tới AI. Vui lòng thử lại!",
      speechText: "",
      language,
    };
  }
};

// Backward-compatible alias.
export const sendMessageToGemini = requestAssistantReply;

export default requestAssistantReply;

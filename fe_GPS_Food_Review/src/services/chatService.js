import { buildApiUrl } from "./apiClient";

const requestAssistantReply = async (question, language = "vi", location = null) => {
  try {
    const response = await fetch(buildApiUrl("/api/chat"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question, language, location }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return {
      answer: data?.answer || "Xin loi, toi chua co phan hoi phu hop.",
      speechText: data?.speechText || data?.answer || "",
      language: data?.language || language,
    };
  } catch (error) {
    console.error("Chat Error:", error);
    return {
      answer: "Khong the ket noi AI. Vui long thu lai.",
      speechText: "",
      language,
    };
  }
};

// Backward-compatible alias.
export const sendMessageToGemini = requestAssistantReply;

export default requestAssistantReply;

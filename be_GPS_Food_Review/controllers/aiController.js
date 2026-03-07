require("dotenv").config();
const OpenAI = require("openai");
const foodVendors = require("../models/foods");

const DEFAULT_LANGUAGE = "vi";
const FALLBACK_ANSWER_TEXT = "Xin loi, toi chua tao duoc cau tra loi phu hop.";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "stepfun/step-3.5-flash:free";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.URL_CLIENT || "http://localhost:5173",
    "X-Title": "GPS Food Review",
  },
});

const extractJsonObject = (text) => {
  if (!text || typeof text !== "string") {
    return null;
  }

  const fencedJson = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedJson && fencedJson[1]) {
    try {
      return JSON.parse(fencedJson[1]);
    } catch {
      return null;
    }
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    } catch {
      return null;
    }
  }

  return null;
};

const normalizeOpenAIMessageContent = (content) => {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }
        if (item && typeof item.text === "string") {
          return item.text;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return "";
};

const normalizeRequestedLanguageCode = (language) => {
  if (!language || typeof language !== "string") {
    return DEFAULT_LANGUAGE;
  }

  const normalized = language.trim().toLowerCase();
  if (normalized === "cn") {
    return "zh";
  }

  return normalized;
};

const buildFoodAssistantPrompt = (vendorsContext, languageCode) => {
  return `Bạn là hướng dẫn viên du lịch bản địa sành ăn.
Nhiệm vụ: Tư vấn quán ăn dựa trên dữ liệu sau: ${vendorsContext}
Quy tắc bắt buộc:
1. Luôn luôn phản hồi bằng ngôn ngữ mã: ${languageCode}.
2. Phong cách thân thiện, tự nhiên như đang trò chuyện trực tiếp.
3. Nếu khách hỏi bằng ngôn ngữ khác, vẫn trả lời bằng ${languageCode}.
4. Chỉ trả về JSON hợp lệ, KHÔNG thêm giải thích, theo đúng cấu trúc:
{
  "display_text": "Nội dung hiển thị cho người dùng",
  "speech_text": "Nội dung để robot đọc"
}`;
};

const buildChatRequestBody = (systemPrompt, userQuestion) => {
  return {
    model: OPENROUTER_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userQuestion },
    ],
    temperature: 0.4,
    // Keep this enabled for GPT-5 family on OpenRouter.
    reasoning: { enabled: true },
  };
};

const requestAssistantCompletion = async (requestBody) => {
  try {
    return await client.chat.completions.create(requestBody);
  } catch {
    // Some models do not support `reasoning`; retry once without it.
    const fallbackRequestBody = { ...requestBody };
    delete fallbackRequestBody.reasoning;
    return client.chat.completions.create(fallbackRequestBody);
  }
};

const parseAssistantPayload = (assistantRawText) => {
  const parsedJson = extractJsonObject(assistantRawText);

  if (!parsedJson) {
    return {
      displayText: assistantRawText || FALLBACK_ANSWER_TEXT,
      speechText: assistantRawText || FALLBACK_ANSWER_TEXT,
    };
  }

  const displayText =
    parsedJson.display_text || parsedJson.speech_text || FALLBACK_ANSWER_TEXT;
  const speechText =
    parsedJson.speech_text || parsedJson.display_text || displayText;

  return { displayText, speechText };
};

const handleAskFoodAssistant = async (req, res) => {
  const { question, language = DEFAULT_LANGUAGE } = req.body;
  const normalizedLanguage = normalizeRequestedLanguageCode(language);

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Missing question" });
  }

  const vendorsContext = JSON.stringify(foodVendors);

  if (!process.env.OPENROUTER_API_KEY) {
    return res
      .status(500)
      .json({ error: "Missing OPENROUTER_API_KEY in .env" });
  }

  const systemPrompt = buildFoodAssistantPrompt(
    vendorsContext,
    normalizedLanguage,
  );
  const requestBody = buildChatRequestBody(systemPrompt, question);

  try {
    const completion = await requestAssistantCompletion(requestBody);

    const assistantRawText = normalizeOpenAIMessageContent(
      completion?.choices?.[0]?.message?.content,
    );

    const { displayText, speechText } = parseAssistantPayload(assistantRawText);
    return res.json({
      answer: displayText,
      speechText,
      language: normalizedLanguage,
    });
  } catch (error) {
    console.error("OpenRouter Error:", error?.message || error);

    const detail = error?.error?.message || error?.message || "Unknown error";
    return res.status(500).json({
      error: "Khong the ket noi OpenRouter",
      detail,
    });
  }
};

module.exports = {
  handleAskFoodAssistant,
};

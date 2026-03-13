require("dotenv").config();
const OpenAI = require("openai");
const { haversineDistanceMeters } = require("../utils/geo");
const { normalizeLanguage } = require("../utils/languages");
const { formatFoodByLanguage } = require("./foodsController");
const Food = require("../models/foods");

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "stepfun/step-3.5-flash:free";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.PUBLIC_WEB_URL || "http://localhost:5173",
    "X-Title": "GPS Food Review"
  }
});

const buildFoodContext = (foods, language, location) => {
  const localizedFoods = foods.map((food) => formatFoodByLanguage(food, language));

  if (!location || Number.isNaN(location.lat) || Number.isNaN(location.lng)) {
    return { localizedFoods, nearestFoods: [] };
  }

  const nearestFoods = localizedFoods
    .map((food) => ({
      ...food,
      distanceMeters: Number(
        haversineDistanceMeters({ lat: location.lat, lng: location.lng }, { lat: food.lat, lng: food.lng }).toFixed(2)
      )
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 3);

  return { localizedFoods, nearestFoods };
};

const askAssistant = async (req, res) => {
  const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";
  const language = normalizeLanguage(req.body?.language);
  const userLocation = req.body?.location || null;

  if (!question) {
    return res.status(400).json({ error: "question is required" });
  }

  const location = {
    lat: Number(userLocation?.lat),
    lng: Number(userLocation?.lng)
  };

  try {
    const foods = await Food.find({});
    const { localizedFoods, nearestFoods } = buildFoodContext(foods, language, location);

    const prompt = [
      "You are a local food guide assistant for one food street zone.",
      `Reply ONLY in language code: ${language}.`,
      "Keep answer practical, warm, and concise (max 120 words).",
      "If user asks unrelated things, gently redirect to food and nearby recommendations.",
      "Data of food vendors:",
      JSON.stringify(localizedFoods),
      "Nearest foods to user right now:",
      JSON.stringify(nearestFoods),
      "Return JSON only with this shape:",
      '{"answer":"...", "speechText":"..."}'
    ].join("\n");

    if (!process.env.OPENROUTER_API_KEY) {
      const fallback = nearestFoods[0]
        ? `Ban dang gan ${nearestFoods[0].name}. Goi y thu mon ${nearestFoods[0].specialty}.`
        : "Toi co the goi y mon ngon trong khu pho am thuc nay. Ban thich vi nao?";

      return res.json({ answer: fallback, speechText: fallback, language, fromFallback: true });
    }

    const completion = await client.chat.completions.create({
      model: OPENROUTER_MODEL,
      temperature: 0.3,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: question }
      ]
    });

    const raw = completion?.choices?.[0]?.message?.content || "";
    const normalized = typeof raw === "string" ? raw : JSON.stringify(raw);

    let parsed;
    try {
      parsed = JSON.parse(normalized);
    } catch (_error) {
      parsed = null;
    }

    const answer = parsed?.answer || normalized || "Xin loi, toi chua co cau tra loi phu hop.";
    const speechText = parsed?.speechText || answer;

    return res.json({ answer, speechText, language });
  } catch (error) {
    console.error('Error fetching foods:', error);
    return res.status(500).json({
      error: "AI service error",
      detail: error?.message || "Unknown error"
    });
  }
};

module.exports = {
  askAssistant
};

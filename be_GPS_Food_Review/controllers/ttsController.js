const fs = require("fs");
const path = require("path");
const gTTS = require("gtts");
const foods = require("../data/foods");
const { normalizeLanguage, DEFAULT_LANGUAGE } = require("../utils/languages");
const { formatFoodByLanguage } = require("./foodsController");

const AUDIO_DIR = path.join(__dirname, "..", "public", "audio");

const TTS_LANGUAGE_MAP = {
  zh: "zh-cn",
  vi: "vi",
  en: "en",
  es: "es",
  hi: "hi",
  ar: "ar",
  pt: "pt",
  bn: "bn",
  ru: "ru",
  ja: "ja",
  pa: "pa",
  de: "de",
  ko: "ko",
  fr: "fr",
  tr: "tr"
};

if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

const getTtsLanguage = (language) => TTS_LANGUAGE_MAP[normalizeLanguage(language)] || "en";

const createFoodNarrationText = (food, language) => {
  const localizedFood = formatFoodByLanguage(food, language);
  return `${localizedFood.name}. ${localizedFood.specialty}. ${localizedFood.description}.`;
};

const saveTextToMp3 = (text, language, filePath) => {
  const tts = new gTTS(text, getTtsLanguage(language));
  return new Promise((resolve, reject) => {
    tts.save(filePath, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

const getFoodAudio = async (req, res) => {
  const { foodId } = req.params;
  const language = normalizeLanguage(req.query.lang || DEFAULT_LANGUAGE);

  const food = foods.find((item) => item.id === foodId);
  if (!food) {
    return res.status(404).json({ error: "food not found" });
  }

  const fileName = `${food.id}_${language}.mp3`;
  const filePath = path.join(AUDIO_DIR, fileName);

  try {
    if (!fs.existsSync(filePath)) {
      const narrationText = createFoodNarrationText(food, language);
      await saveTextToMp3(narrationText, language, filePath);
    }

    return res.json({
      foodId,
      language,
      audioUrl: `/audio/${fileName}`
    });
  } catch (error) {
    return res.status(500).json({ error: "cannot render tts", detail: error?.message });
  }
};

const streamCustomTextTts = (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  const language = normalizeLanguage(req.body?.lang || DEFAULT_LANGUAGE);

  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }

  const tts = new gTTS(text, getTtsLanguage(language));
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "no-store");

  const stream = tts.stream();
  stream.on("error", (error) => {
    if (!res.headersSent) {
      res.status(500).json({ error: "cannot stream tts", detail: error?.message });
      return;
    }
    res.end();
  });

  stream.pipe(res);
};

module.exports = {
  getFoodAudio,
  streamCustomTextTts
};

const gTTS = require("gtts");

const LANGUAGE_MAP = {
  cn: "zh-cn",
  zh: "zh-cn",
  "zh-hans": "zh-cn",
  "zh-hant": "zh-tw",
  pt: "pt",
  en: "en",
  vi: "vi",
  es: "es",
  hi: "hi",
  ar: "ar",
  bn: "bn",
  ru: "ru",
  ja: "ja",
  pa: "pa",
  de: "de",
  ko: "ko",
  fr: "fr",
  tr: "tr",
};

const normalizeTtsLanguageCode = (languageCode) => {
  if (!languageCode || typeof languageCode !== "string") {
    return "en";
  }

  const normalized = languageCode.trim().toLowerCase();
  return LANGUAGE_MAP[normalized] || normalized;
};

const streamSpeechToResponse = (text, languageCode, res) => {
  const normalizedLanguageCode = normalizeTtsLanguageCode(languageCode);
  const tts = new gTTS(text, normalizedLanguageCode);

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "no-store");

  const stream = tts.stream();
  stream.on("error", (error) => {
    console.error("Lỗi stream TTS:", error);

    if (!res.headersSent) {
      res.status(500).json({ error: "Không thể stream âm thanh" });
      return;
    }

    res.end();
  });

  stream.pipe(res);
};

const handleTtsRequest = (req, res) => {
  const text = req.query.text || "Hello, this is a text to speech test.";
  const languageCode = normalizeTtsLanguageCode(req.query.lang || "en");

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing text" });
  }

  return streamSpeechToResponse(text, languageCode, res);
};

const handleTtsStreamRequest = (req, res) => {
  const { text, lang = "en" } = req.body || {};
  const languageCode = normalizeTtsLanguageCode(lang);

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing text" });
  }

  return streamSpeechToResponse(text, languageCode, res);
};

module.exports = {
  handleTtsRequest,
  handleTtsStreamRequest,
  streamSpeechToResponse,
  normalizeTtsLanguageCode,
  // Backward-compatible export names.
  generateSpeechAudio: streamSpeechToResponse,
  generate_speech: streamSpeechToResponse,
  return_speech: handleTtsRequest,
};

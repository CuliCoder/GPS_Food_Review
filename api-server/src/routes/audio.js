import { Router } from "express";
import gTTS from "gtts";
import { Poi } from "../models/poi.model.js";
import { AudioStat } from "../models/audioStat.model.js";

const router = Router();

const GTTS_LANG_MAP = {
  vi: "vi", en: "en", zh: "zh", ja: "ja", ko: "ko",
  fr: "fr", de: "de", es: "es", it: "it", pt: "pt",
  ru: "ru", ar: "ar", th: "th", id: "id", hi: "hi",
};

/**
 * GET /api/audio/:venueId?lang=vi
 * Tạo audio từ transcript hoặc description trong translations
 */
router.get("/:venueId", async (req, res) => {
  const { venueId } = req.params;
  const lang = req.query.lang || "en";

  try {
    const poi = await Poi.findOne({ id: venueId }).lean();
    if (!poi) {
      res.status(404).json({ success: false, message: "Venue not found" });
      return;
    }

    // 1. Ưu tiên audioTranscripts nếu có
    const transcripts =
      poi.audioTranscripts instanceof Map
        ? Object.fromEntries(poi.audioTranscripts)
        : (poi.audioTranscripts || {});

    // 2. Fallback: dùng description từ translations (GPS_Food_Review format)
    const translations =
      poi.translations instanceof Map
        ? Object.fromEntries(poi.translations)
        : (poi.translations || {});

    // Tìm text theo lang, fallback en, fallback bất kỳ
    let text =
      transcripts[lang] ||
      transcripts["en"] ||
      translations[lang]?.description ||
      translations["en"]?.description ||
      Object.values(translations)[0]?.description ||
      poi.description ||
      poi.name ||
      "Welcome!";

    // Tên quán ở đầu nếu chưa có
    const nameInLang =
      translations[lang]?.name ||
      translations["en"]?.name ||
      poi.name ||
      "";

    if (nameInLang && !text.includes(nameInLang)) {
      text = `${nameInLang}. ${text}`;
    }

    const resolvedLang = transcripts[lang] ? lang :
                         translations[lang] ? lang : "en";
    const gttsLang = GTTS_LANG_MAP[resolvedLang] || "en";

    // Ghi thống kê
    const today = new Date().toISOString().split("T")[0];
    AudioStat.create({ poiId: poi.id, lang: resolvedLang, date: today }).catch(() => {});

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("X-Lang", resolvedLang);

    const tts = new gTTS(text, gttsLang);
    tts.stream().pipe(res);

  } catch (err) {
    console.error("Audio route error:", err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "TTS generation failed" });
    }
  }
});

/**
 * GET /api/audio/:venueId/transcript?lang=vi
 */
router.get("/:venueId/transcript", async (req, res) => {
  const { venueId } = req.params;
  const lang = req.query.lang || "en";

  const poi = await Poi.findOne({ id: venueId }).lean();
  if (!poi) {
    res.status(404).json({ success: false, message: "Venue not found" });
    return;
  }

  const transcripts =
    poi.audioTranscripts instanceof Map
      ? Object.fromEntries(poi.audioTranscripts)
      : (poi.audioTranscripts || {});

  const translations =
    poi.translations instanceof Map
      ? Object.fromEntries(poi.translations)
      : (poi.translations || {});

  const resolvedLang = transcripts[lang] ? lang : "en";
  const text =
    transcripts[resolvedLang] ||
    translations[lang]?.description ||
    translations["en"]?.description ||
    poi.description || "";

  res.json({
    success: true,
    data: {
      venueId: poi.id,
      lang: resolvedLang,
      transcript: text,
      availableLanguages: Object.keys({ ...transcripts, ...translations }),
    },
  });
});

export default router;
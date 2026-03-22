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
 * Lấy text để đọc từ POI theo ngôn ngữ
 * Hỗ trợ 3 format:
 *  - audioTranscripts  (venues.js gốc từ Replit)
 *  - descriptionLocal  (quán mới đăng ký qua form)
 *  - translations      (GPS_Food_Review_pois.json)
 */
function getTextAndLang(poi, lang) {
  // Flatten Map → object
  const flatten = (v) =>
    v instanceof Map ? Object.fromEntries(v) : (v || {});

  const transcripts   = flatten(poi.audioTranscripts);
  const descLocal     = flatten(poi.descriptionLocal);
  const nameLocal     = flatten(poi.nameLocal);
  const translations  = flatten(poi.translations);

  // Ưu tiên: transcript → descriptionLocal → translations.description → description gốc
  const getText = (l) =>
    transcripts[l] ||
    descLocal[l] ||
    translations[l]?.description ||
    null;

  // Lấy tên theo ngôn ngữ
  const getName = (l) =>
    nameLocal[l] ||
    translations[l]?.name ||
    poi.name ||
    "";

  // Thử ngôn ngữ yêu cầu trước, fallback en, fallback bất kỳ
  let text = getText(lang);
  let resolvedLang = lang;

  if (!text) {
    text = getText("en");
    resolvedLang = "en";
  }

  if (!text) {
    // Thử bất kỳ ngôn ngữ nào có sẵn
    const allLangs = [
      ...Object.keys(transcripts),
      ...Object.keys(descLocal),
      ...Object.keys(translations),
    ];
    for (const l of allLangs) {
      text = getText(l);
      if (text) { resolvedLang = l; break; }
    }
  }

  // Fallback cuối: description gốc + name
  if (!text) {
    text = poi.description || poi.name || "Welcome!";
    resolvedLang = "en";
  }

  // Thêm tên quán vào đầu nếu chưa có
  const name = getName(resolvedLang);
  if (name && !text.startsWith(name)) {
    text = `${name}. ${text}`;
  }

  return { text, resolvedLang };
}

/**
 * GET /api/audio/:venueId?lang=vi
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

    const { text, resolvedLang } = getTextAndLang(poi, lang);
    const gttsLang = GTTS_LANG_MAP[resolvedLang] || "en";

    console.log(`🔊 [${venueId}] lang=${lang}→${resolvedLang}, text="${text.slice(0, 60)}..."`);

    // Ghi thống kê
    const today = new Date().toISOString().split("T")[0];
    AudioStat.create({ poiId: poi.id, lang: resolvedLang, date: today }).catch(() => {});

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("X-Lang", resolvedLang);
    res.setHeader("X-Resolved-Lang", resolvedLang);

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

  const { text, resolvedLang } = getTextAndLang(poi, lang);

  const flatten = (v) => v instanceof Map ? Object.fromEntries(v) : (v || {});
  const allLangs = [
    ...Object.keys(flatten(poi.audioTranscripts)),
    ...Object.keys(flatten(poi.descriptionLocal)),
    ...Object.keys(flatten(poi.translations)),
  ];

  res.json({
    success: true,
    data: {
      venueId: poi.id,
      lang: resolvedLang,
      transcript: text,
      availableLanguages: [...new Set(allLangs)],
    },
  });
});

export default router;
import { Router } from "express";
import gTTS from "gtts";
import crypto from "crypto";
import path from "path";
import { createReadStream, createWriteStream } from "fs";
import { mkdir, rm, rename, stat } from "fs/promises";
import { pipeline } from "stream/promises";
import { Poi } from "../models/poi.model.js";
import { AudioStat } from "../models/audioStat.model.js";
import { getRedisClient } from "../lib/redis.js";

const router = Router();

const AUDIO_CACHE_DIR = path.join(process.cwd(), ".cache", "audio");
const AUDIO_LOCK_TTL_MS = Number(process.env.AUDIO_LOCK_TTL_MS || 60000);
const AUDIO_WAIT_TIMEOUT_MS = Number(process.env.AUDIO_WAIT_TIMEOUT_MS || 30000);
const AUDIO_POLL_INTERVAL_MS = Number(process.env.AUDIO_POLL_INTERVAL_MS || 250);
const LOCK_RELEASE_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  end
  return 0
`;

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

async function ensureAudioCacheDir() {
  await mkdir(AUDIO_CACHE_DIR, { recursive: true });
}

function getAudioCachePath(venueId, resolvedLang, text) {
  const hash = crypto
    .createHash("sha1")
    .update([venueId, resolvedLang, text].join("|"))
    .digest("hex");

  return path.join(AUDIO_CACHE_DIR, `${venueId}-${resolvedLang}-${hash}.mp3`);
}

async function fileExistsWithContent(filePath) {
  try {
    const fileStat = await stat(filePath);
    return fileStat.size > 0;
  } catch {
    return false;
  }
}

async function acquireAudioLock(redis, lockKey) {
  const token = crypto.randomUUID();

  try {
    const result = await redis.set(lockKey, token, "PX", AUDIO_LOCK_TTL_MS, "NX");
    return result === "OK" ? token : null;
  } catch {
    return null;
  }
}

async function releaseAudioLock(redis, lockKey, token) {
  try {
    await redis.eval(LOCK_RELEASE_SCRIPT, 1, lockKey, token);
  } catch {
    // Best-effort unlock only.
  }
}

async function generateAudioFile(text, gttsLang, outputPath) {
  const tempPath = `${outputPath}.${crypto.randomUUID()}.tmp`;
  const tts = new gTTS(text, gttsLang);

  try {
    await pipeline(tts.stream(), createWriteStream(tempPath));

    try {
      await rename(tempPath, outputPath);
    } catch (renameError) {
      if (await fileExistsWithContent(outputPath)) {
        await rm(tempPath, { force: true }).catch(() => {});
        return;
      }

      throw renameError;
    }
  } catch (error) {
    await rm(tempPath, { force: true }).catch(() => {});
    throw error;
  }
}

function isTransientAudioError(error) {
  return ["ECONNRESET", "ETIMEDOUT", "ECONNREFUSED", "EAI_AGAIN"].includes(error?.code);
}

async function generateAudioFileWithRetry(text, gttsLang, outputPath, attempts = 2) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await generateAudioFile(text, gttsLang, outputPath);
      return;
    } catch (error) {
      lastError = error;

      if (!isTransientAudioError(error) || attempt === attempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }

  throw lastError;
}

async function serveAudioFile(res, filePath, resolvedLang) {
  const fileStat = await stat(filePath);

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Content-Length", String(fileStat.size));
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.setHeader("X-Resolved-Lang", resolvedLang);

  await pipeline(createReadStream(filePath), res);
}

async function waitForAudioCacheOrTakeover({ redis, lockKey, cachePath, text, gttsLang }) {
  const deadline = Date.now() + AUDIO_WAIT_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (await fileExistsWithContent(cachePath)) {
      return "cached";
    }

    if (redis) {
      const lockValue = await redis.get(lockKey).catch(() => null);

      if (!lockValue) {
        const takeoverToken = await acquireAudioLock(redis, lockKey);

        if (takeoverToken) {
          try {
            if (!(await fileExistsWithContent(cachePath))) {
              await generateAudioFileWithRetry(text, gttsLang, cachePath);
            }
          } finally {
            await releaseAudioLock(redis, lockKey, takeoverToken);
          }

          return "generated";
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, AUDIO_POLL_INTERVAL_MS));
  }

  return "timeout";
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
    const cachePath = getAudioCachePath(poi.id, resolvedLang, text);
    const redis = getRedisClient();
    const lockKey = `audio:lock:${poi.id}:${resolvedLang}:${crypto
      .createHash("sha1")
      .update(text)
      .digest("hex")}`;

    console.log(`🔊 [${venueId}] lang=${lang}→${resolvedLang}, text="${text.slice(0, 60)}..."`);

    // Ghi thống kê
    const today = new Date().toISOString().split("T")[0];
    AudioStat.create({ poiId: poi.id, lang: resolvedLang, date: today }).catch(() => {});

    res.setHeader("X-Lang", resolvedLang);

    await ensureAudioCacheDir();

    if (await fileExistsWithContent(cachePath)) {
      await serveAudioFile(res, cachePath, resolvedLang);
      return;
    }

    if (redis) {
      const lockToken = await acquireAudioLock(redis, lockKey);

      if (lockToken) {
        try {
          if (!(await fileExistsWithContent(cachePath))) {
            await generateAudioFileWithRetry(text, gttsLang, cachePath);
          }
        } finally {
          await releaseAudioLock(redis, lockKey, lockToken);
        }

        await serveAudioFile(res, cachePath, resolvedLang);
        return;
      }

      const status = await waitForAudioCacheOrTakeover({
        redis,
        lockKey,
        cachePath,
        text,
        gttsLang,
      });

      if (status !== "timeout" && (await fileExistsWithContent(cachePath))) {
        await serveAudioFile(res, cachePath, resolvedLang);
        return;
      }

      res.status(503).json({
        success: false,
        message: "Audio is being generated. Please retry shortly.",
      });
      return;
    }

    try {
      await generateAudioFileWithRetry(text, gttsLang, cachePath);
      await serveAudioFile(res, cachePath, resolvedLang);
      return;
    } catch (error) {
      if (await fileExistsWithContent(cachePath)) {
        await serveAudioFile(res, cachePath, resolvedLang);
        return;
      }

      throw error;
    }

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
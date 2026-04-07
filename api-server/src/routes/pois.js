import { Router } from "express";
import path from "path";
import { readdir, rm } from "fs/promises";
import { Poi } from "../models/poi.model.js";
import { Payment } from "../models/payment.model.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const LANGUAGES = [
  { code: "vi", name: "Vietnamese" },
  { code: "en", name: "English" },
  { code: "zh", name: "Chinese (Simplified)" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ar", name: "Arabic" },
  { code: "th", name: "Thai" },
  { code: "id", name: "Indonesian" },
  { code: "hi", name: "Hindi" },
];

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const TRANSLATION_PROVIDER = String(process.env.TRANSLATION_PROVIDER || "google").toLowerCase();
const ANTHROPIC_COOLDOWN_MS = Number(process.env.ANTHROPIC_COOLDOWN_MS || 30 * 60 * 1000);
let anthropicDisabledUntil = 0;
const AUDIO_CACHE_DIR = path.join(process.cwd(), ".cache", "audio");

async function cleanupVenueAudioCache(venueId) {
  try {
    const files = await readdir(AUDIO_CACHE_DIR);
    const staleFiles = files.filter((file) => file.startsWith(`${venueId}-`) && file.endsWith(".mp3"));
    await Promise.all(staleFiles.map((file) => rm(path.join(AUDIO_CACHE_DIR, file), { force: true })));
    return staleFiles.length;
  } catch {
    return 0;
  }
}

function cleanText(value, maxLen = 300) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/<[^>]*>/g, "").slice(0, maxLen);
}

function cleanStringArray(values, maxItems = 20, maxLen = 60) {
  if (!Array.isArray(values)) return [];
  return values
    .map((item) => cleanText(item, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

function isValidUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeHours(hours) {
  if (!hours || typeof hours !== "object" || Array.isArray(hours)) return null;
  const normalized = {};
  for (const [day, value] of Object.entries(hours)) {
    const safeDay = cleanText(day, 12);
    if (!safeDay) continue;
    normalized[safeDay] = cleanText(String(value || ""), 40);
  }
  return normalized;
}

function normalizeMenu(menu) {
  if (!Array.isArray(menu)) return null;
  const normalized = menu
    .map((item, index) => {
      const name = cleanText(item?.name, 120);
      if (!name) return null;

      const priceNum = Number(item?.price);
      const price = Number.isFinite(priceNum) && priceNum >= 0 ? Math.round(priceNum) : 0;
      const imageUrl = cleanText(item?.imageUrl, 500);

      return {
        id: cleanText(item?.id, 40) || `m-${Date.now()}-${index}`,
        name,
        description: cleanText(item?.description, 280),
        price,
        isFeatured: Boolean(item?.isFeatured),
        ...(imageUrl && isValidUrl(imageUrl) ? { imageUrl } : {}),
      };
    })
    .filter(Boolean)
    .slice(0, 80);

  return normalized;
}

function normalizeGallery(gallery) {
  if (!Array.isArray(gallery)) return null;
  return gallery
    .map((url) => cleanText(url, 500))
    .filter((url) => isValidUrl(url))
    .slice(0, 20);
}

function buildVenueLandingUrl(venueId) {
  const backendBase = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, "");
  return `${backendBase}/api/venues/${encodeURIComponent(venueId)}/qr-landing`;
}

function buildVenueLandingQrImageUrl(landingUrl) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(landingUrl)}`;
}

async function translateByGooglePublic(text, sourceLang, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sourceLang)}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google translate fallback failed: ${response.status}`);
  }

  const data = await response.json();
  const translated = Array.isArray(data?.[0])
    ? data[0].map((part) => part?.[0] || "").join("")
    : "";

  if (!translated) {
    throw new Error("Google translate fallback returned empty result");
  }

  return translated;
}

async function fallbackTranslateAllLanguages(text, sourceLang, targetLangs) {
  const translations = { [sourceLang]: text };

  for (const lang of targetLangs) {
    try {
      translations[lang.code] = await translateByGooglePublic(text, sourceLang, lang.code);
    } catch {
      // Nếu fallback cho 1 ngôn ngữ lỗi, giữ nguyên text gốc để không chặn luồng đăng ký.
      translations[lang.code] = text;
    }
  }

  return translations;
}

async function translateByAnthropic(text, sourceLang, targetLangs) {
  const sourceLangName = LANGUAGES.find(l => l.code === sourceLang)?.name || "Vietnamese";

  const prompt = `You are a professional food and travel translator.
Translate the following text from ${sourceLangName} into these ${targetLangs.length} languages.
Return ONLY a valid JSON object with language codes as keys and translated text as values.
Keep the tone friendly and appealing for a food tourism app.
Do not add any explanation or markdown.

Source text (${sourceLangName}):
"${text}"

Target languages: ${targetLangs.map(l => `${l.code} (${l.name})`).join(", ")}

Return format:
{"${targetLangs[0].code}": "...", "${targetLangs[1].code}": "...", ...}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const raw = data.content?.[0]?.text || "{}";
  const clean = raw.replace(/```json|```/g, "").trim();
  const translations = JSON.parse(clean);
  translations[sourceLang] = text;
  return translations;
}

/**
 * Dịch text sang 15 ngôn ngữ bằng Claude API
 * @param {string} text - Văn bản gốc
 * @param {string} sourceLang - Mã ngôn ngữ gốc (vi, en, ...)
 * @returns {Record<string, string>} - Map { langCode: translatedText }
 */
async function translateToAllLanguages(text, sourceLang = "vi") {
  if (!text?.trim()) {
    return { [sourceLang]: "" };
  }

  const targetLangs = LANGUAGES.filter(l => l.code !== sourceLang);

  // Default provider is free Google public endpoint.
  if (TRANSLATION_PROVIDER !== "anthropic") {
    return fallbackTranslateAllLanguages(text, sourceLang, targetLangs);
  }

  if (!ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY is missing. Using Google public translator.");
    return fallbackTranslateAllLanguages(text, sourceLang, targetLangs);
  }

  if (Date.now() < anthropicDisabledUntil) {
    return fallbackTranslateAllLanguages(text, sourceLang, targetLangs);
  }

  try {
    return await translateByAnthropic(text, sourceLang, targetLangs);

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/credit balance is too low|insufficient|billing/i.test(message)) {
      anthropicDisabledUntil = Date.now() + ANTHROPIC_COOLDOWN_MS;
    }

    console.warn(`Anthropic translation failed (${message}). Using Google public translator.`);
    return fallbackTranslateAllLanguages(text, sourceLang, targetLangs);
  }
}

// ── Vendor: đăng ký quán mới ──────────────────────────────────
router.post("/pois", requireAuth, requireRole("vendor", "admin"), async (req, res) => {
  const {
    name, category, description, lat, lng, address,
    priceRange, tags, phone, website, hours,
    paymentId,
    sourceLang = "vi", // ngôn ngữ vendor đang nhập
  } = req.body;

  let payment = null;
  if (req.user.role === "vendor") {
    if (!paymentId) {
      res.status(402).json({
        success: false,
        message: "Payment is required for each new venue registration",
      });
      return;
    }

    payment = await Payment.findOneAndUpdate({
      _id: paymentId,
      userId: req.user.id,
      status: "success",
      paymentCode: "poi_registration",
      poiId: { $exists: false },
      usedForPoiAt: { $exists: false },
      registrationClaimedAt: { $exists: false },
    }, {
      $set: { registrationClaimedAt: new Date() },
    }, {
      new: true,
    });

    if (!payment) {
      res.status(402).json({
        success: false,
        message: "Invalid or already used payment for venue registration",
      });
      return;
    }
  }

  const parsedLat = Number.parseFloat(lat);
  const parsedLng = Number.parseFloat(lng);
  const hasValidCoordinates = Number.isFinite(parsedLat) && Number.isFinite(parsedLng);

  if (!name || !category || !address || !hasValidCoordinates) {
    res.status(400).json({ success: false, message: "name, category, lat, lng, address are required" });
    return;
  }

  // Dịch tên và mô tả sang 15 ngôn ngữ
  console.log("🌐 Translating venue info...");
  const [nameTranslations, descTranslations] = await Promise.all([
    translateToAllLanguages(name, sourceLang),
    description ? translateToAllLanguages(description, sourceLang) : Promise.resolve({ [sourceLang]: "" }),
  ]);
  console.log("✅ Translation done");

  const id = `poi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const landingUrl = buildVenueLandingUrl(id);
  const landingQrImageUrl = buildVenueLandingQrImageUrl(landingUrl);

  try {
    const poi = await Poi.create({
      id,
      name: nameTranslations["en"] || nameTranslations[sourceLang] || name,
      nameLocal: nameTranslations,
      category,
      description: descTranslations["en"] || descTranslations[sourceLang] || description || "",
      descriptionLocal: descTranslations,
      lat: parsedLat,
      lng: parsedLng,
      location: { type: "Point", coordinates: [parsedLng, parsedLat] },
      address,
      priceRange: priceRange || "$",
      tags: tags || [],
      phone: phone || "",
      website: website || "",
      hours: hours || {},
      vendorId: req.user.id,
      status: "pending",
      rating: 0,
      reviewCount: 0,
      isOpen: true,
      audioRadius: 50,
      hasAudio: false,
      landingUrl,
      landingQrImageUrl,
    });

    if (payment) {
      payment.poiId = poi.id;
      payment.usedForPoiAt = new Date();
      payment.message = `Paid registration for venue ${poi.id}`;
      payment.registrationClaimedAt = undefined;
      await payment.save();
    }

    res.status(201).json({ success: true, data: poi });
  } catch (error) {
    if (payment) {
      await Payment.updateOne(
        { _id: payment._id, registrationClaimedAt: { $exists: true } },
        { $unset: { registrationClaimedAt: "" } }
      );
    }
    console.error("POI creation after payment failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create venue after payment",
      error: error.message,
    });
  }
});

// ── Vendor: danh sách quán của mình ───────────────────────────
router.get("/pois/mine", requireAuth, requireRole("vendor", "admin"), async (req, res) => {
  const pois = await Poi.find({ vendorId: req.user.id }).lean({ virtuals: true });
  res.json({ success: true, data: pois });
});

// ── Vendor: cập nhật quán ─────────────────────────────────────
router.patch("/pois/:id", requireAuth, requireRole("vendor", "admin"), async (req, res) => {
  const poi = await Poi.findOne({ id: req.params.id });
  if (!poi) {
    res.status(404).json({ success: false, message: "POI not found" });
    return;
  }
  if (req.user.role !== "admin" && poi.vendorId?.toString() !== req.user.id) {
    res.status(403).json({ success: false, message: "Not your venue" });
    return;
  }

  const shouldCleanupAudio = req.body.name !== undefined || req.body.description !== undefined;

  // Nếu có name/description mới + sourceLang → dịch lại localizations
  if ((req.body.description || req.body.name) && req.body.sourceLang) {
    const [nameT, descT] = await Promise.all([
      req.body.name
        ? translateToAllLanguages(cleanText(req.body.name, 140), req.body.sourceLang)
        : Promise.resolve(null),
      req.body.description
        ? translateToAllLanguages(cleanText(req.body.description, 4000), req.body.sourceLang)
        : Promise.resolve(null),
    ]);
    if (nameT) {
      poi.name = nameT["en"] || cleanText(req.body.name, 140);
      poi.nameLocal = nameT;
    }
    if (descT) {
      poi.description = descT["en"] || cleanText(req.body.description, 4000);
      poi.descriptionLocal = descT;
    }
  }

  if (req.body.category !== undefined) poi.category = cleanText(req.body.category, 40);
  if (req.body.address !== undefined) poi.address = cleanText(req.body.address, 240);
  if (req.body.phone !== undefined) poi.phone = cleanText(req.body.phone, 40);
  if (req.body.website !== undefined) {
    const website = cleanText(req.body.website, 500);
    poi.website = website && isValidUrl(website) ? website : "";
  }
  if (req.body.priceRange !== undefined) {
    const allowedRanges = ["$", "$$", "$$$"];
    poi.priceRange = allowedRanges.includes(req.body.priceRange) ? req.body.priceRange : poi.priceRange;
  }
  if (req.body.tags !== undefined) poi.tags = cleanStringArray(req.body.tags, 30, 40);
  if (req.body.isOpen !== undefined) poi.isOpen = Boolean(req.body.isOpen);

  if (req.body.imageUrl !== undefined) {
    const imageUrl = cleanText(req.body.imageUrl, 500);
    poi.imageUrl = imageUrl && isValidUrl(imageUrl) ? imageUrl : "";
  }

  if (req.body.hours !== undefined) {
    const hours = normalizeHours(req.body.hours);
    if (hours) poi.hours = hours;
  }

  if (req.body.menu !== undefined) {
    const menu = normalizeMenu(req.body.menu);
    if (menu) poi.menu = menu;
  }

  if (req.body.gallery !== undefined) {
    const gallery = normalizeGallery(req.body.gallery);
    if (gallery) poi.gallery = gallery;
  }

  if (req.user.role !== "admin") poi.status = "pending";
  await poi.save();

  if (shouldCleanupAudio) {
    const deletedCount = await cleanupVenueAudioCache(poi.id);
    if (deletedCount > 0) {
      console.log(`🧹 Deleted ${deletedCount} stale audio cache files for venue ${poi.id}`);
    }
  }

  res.json({ success: true, data: poi });
});

// ── Admin: duyệt POI ──────────────────────────────────────────
router.patch("/pois/:id/approve", requireAuth, requireRole("admin"), async (req, res) => {
  const poi = await Poi.findOneAndUpdate(
    { id: req.params.id },
    { status: "approved", rejectedReason: undefined },
    { new: true }
  );
  if (!poi) { res.status(404).json({ success: false, message: "POI not found" }); return; }
  res.json({ success: true, data: poi });
});

// ── Admin: từ chối POI ────────────────────────────────────────
router.patch("/pois/:id/reject", requireAuth, requireRole("admin"), async (req, res) => {
  const poi = await Poi.findOneAndUpdate(
    { id: req.params.id },
    { status: "rejected", rejectedReason: req.body.reason || "Does not meet requirements" },
    { new: true }
  );
  if (!poi) { res.status(404).json({ success: false, message: "POI not found" }); return; }
  res.json({ success: true, data: poi });
});

// ── Admin: xóa POI ────────────────────────────────────────────
router.delete("/pois/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const poi = await Poi.findOneAndDelete({ id: req.params.id });
  if (!poi) { res.status(404).json({ success: false, message: "POI not found" }); return; }
  await cleanupVenueAudioCache(poi.id);
  res.json({ success: true, message: `Deleted: ${poi.name}` });
});

// ── Vendor: xóa quán chưa duyệt ──────────────────────────────
router.delete("/pois/:id/mine", requireAuth, requireRole("vendor", "admin"), async (req, res) => {
  const poi = await Poi.findOne({ id: req.params.id });
  if (!poi) { res.status(404).json({ success: false, message: "POI not found" }); return; }
  if (req.user.role !== "admin" && poi.vendorId?.toString() !== req.user.id) {
    res.status(403).json({ success: false, message: "Not your venue" }); return;
  }
  if (req.user.role !== "admin" && poi.status === "approved") {
    res.status(400).json({ success: false, message: "Cannot delete approved venue. Contact admin." }); return;
  }
  await poi.deleteOne();
  await cleanupVenueAudioCache(poi.id);
  res.json({ success: true, message: "Deleted successfully" });
});

export default router;
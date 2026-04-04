import { Router } from "express";
import { Poi } from "../models/poi.model.js";
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

  if (!ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY is missing. Falling back to source language only.");
    return fallbackTranslateAllLanguages(text, sourceLang, LANGUAGES.filter(l => l.code !== sourceLang));
  }

  const sourceLangName = LANGUAGES.find(l => l.code === sourceLang)?.name || "Vietnamese";
  const targetLangs = LANGUAGES.filter(l => l.code !== sourceLang);

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

  try {
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

    // Parse JSON — bỏ markdown nếu có
    const clean = raw.replace(/```json|```/g, "").trim();
    const translations = JSON.parse(clean);

    // Thêm ngôn ngữ gốc vào
    translations[sourceLang] = text;
    return translations;

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`Anthropic translation failed (${message}). Using fallback translator.`);
    return fallbackTranslateAllLanguages(text, sourceLang, targetLangs);
  }
}

// ── Vendor: đăng ký quán mới ──────────────────────────────────
router.post("/pois", requireAuth, requireRole("vendor", "admin"), async (req, res) => {
  const {
    name, category, description, lat, lng, address,
    priceRange, tags, phone, website, hours,
    sourceLang = "vi", // ngôn ngữ vendor đang nhập
  } = req.body;

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
  });

  res.status(201).json({ success: true, data: poi });
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

  // Nếu có description mới → dịch lại
  if (req.body.description && req.body.sourceLang) {
    const [nameT, descT] = await Promise.all([
      req.body.name ? translateToAllLanguages(req.body.name, req.body.sourceLang) : Promise.resolve(null),
      translateToAllLanguages(req.body.description, req.body.sourceLang),
    ]);
    if (nameT) { poi.name = nameT["en"] || req.body.name; poi.nameLocal = nameT; }
    poi.description = descT["en"] || req.body.description;
    poi.descriptionLocal = descT;
  }

  const allowed = ["address", "priceRange", "tags", "phone", "website", "hours", "isOpen", "imageUrl", "menu", "gallery"];
  allowed.forEach(k => { if (req.body[k] !== undefined) poi[k] = req.body[k]; });

  if (req.user.role !== "admin") poi.status = "pending";
  await poi.save();
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
  res.json({ success: true, message: "Deleted successfully" });
});

export default router;
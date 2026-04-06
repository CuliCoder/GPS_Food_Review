import { Router } from "express";
import { Poi } from "../models/poi.model.js";
import { AudioStat } from "../models/audioStat.model.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

// Helper: localize POI fields theo ngôn ngữ
function localize(poi, lang = "en") {
  const nameLocal = poi.nameLocal instanceof Map ? Object.fromEntries(poi.nameLocal) : (poi.nameLocal || {});
  const descLocal = poi.descriptionLocal instanceof Map ? Object.fromEntries(poi.descriptionLocal) : (poi.descriptionLocal || {});
  const menu = (poi.menu || []).map((item) => {
    const nl = item.nameLocal instanceof Map ? Object.fromEntries(item.nameLocal) : (item.nameLocal || {});
    return { ...item, name: nl[lang] || nl["en"] || item.name };
  });
  return {
    ...poi,
    name: nameLocal[lang] || nameLocal["en"] || poi.name,
    description: descLocal[lang] || descLocal["en"] || poi.description,
    nameLocal,
    descriptionLocal: descLocal,
    menu,
  };
}

// Haversine distance (metres)
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const p1 = (lat1 * Math.PI) / 180, p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── GET /api/venues ───────────────────────────────────────────
router.get("/venues", optionalAuth, async (req, res) => {
  const lang = req.query.lang || "en";
  const category = req.query.category;
  const sort = req.query.sort || "distance";
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);

  const filter = { status: "approved" };
  if (category) filter.category = category;

  let pois = await Poi.find(filter).lean({ virtuals: true });

  // Sắp xếp theo khoảng cách nếu có tọa độ
  if (!isNaN(lat) && !isNaN(lng)) {
    pois = pois
      .map((p) => ({ ...p, _dist: haversine(lat, lng, p.lat, p.lng) }))
      .sort((a, b) => a._dist - b._dist);
  } else if (sort === "respect") {
    pois.sort((a, b) => (b.respectCount || 0) - (a.respectCount || 0));
  } else if (sort === "newest") {
    pois.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json(
    pois.map((p) => {
      const loc = localize(p, lang);
      return {
        id: loc.id,
        name: loc.name,
        category: loc.category,
        lat: loc.lat,
        lng: loc.lng,
        address: loc.address,
        rating: loc.rating,
        imageUrl: loc.imageUrl,
        isOpen: loc.isOpen,
        priceRange: loc.priceRange,
        tags: loc.tags,
        respectCount: loc.respectCount,
        distance: p._dist ? Math.round(p._dist) : undefined,
      };
    })
  );
});

// ── GET /api/venues/nearby ────────────────────────────────────
router.get("/venues/nearby", async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radius = parseFloat(req.query.radius) || 100;
  const lang = req.query.lang || "en";

  if (isNaN(lat) || isNaN(lng)) {
    res.status(400).json({ success: false, message: "lat and lng are required" });
    return;
  }

  const pois = await Poi.find({ status: "approved" }).lean({ virtuals: true });

  const nearby = pois
    .map((p) => {
      const dist = haversine(lat, lng, p.lat, p.lng);
      const loc = localize(p, lang);
      return {
        id: loc.id,
        name: loc.name,
        category: loc.category,
        lat: loc.lat,
        lng: loc.lng,
        address: loc.address,
        rating: loc.rating,
        imageUrl: loc.imageUrl,
        isOpen: loc.isOpen,
        priceRange: loc.priceRange,
        audioRadius: loc.audioRadius,
        distance: Math.round(dist),
        withinAudioRadius: dist <= (p.audioRadius || 50),
      };
    })
    .filter((p) => p.distance <= radius)
    .sort((a, b) => a.distance - b.distance);

  res.json(nearby);
});

// ── GET /api/venues/:id ───────────────────────────────────────
router.get("/venues/:id", async (req, res) => {
  const lang = req.query.lang || "en";
  const poi = await Poi.findOne({ id: req.params.id, status: "approved" }).lean({ virtuals: true });

  if (!poi) {
    res.status(404).json({ success: false, message: "Venue not found" });
    return;
  }

  const loc = localize(poi, lang);
  res.json({
    ...loc,
    hours: poi.hours instanceof Map ? Object.fromEntries(poi.hours) : poi.hours,
    phone: poi.phone,
    website: poi.website,
    gallery: poi.gallery,
    reviews: poi.reviews,
    hasAudio: poi.hasAudio,
    audioLanguages: poi.audioLanguages,
  });
});

// ── POST /api/venues/:id/respect ─────────────────────────────
router.post("/venues/:id/respect", async (req, res) => {
  const poi = await Poi.findOneAndUpdate(
    { id: req.params.id },
    { $inc: { respectCount: 1 } },
    { new: true }
  );
  if (!poi) {
    res.status(404).json({ success: false, message: "Venue not found" });
    return;
  }
  res.json({ success: true, data: { respectCount: poi.respectCount } });
});

// ── POST /api/venues/:id/qr-tap ──────────────────────────────
// Ghi lại khi user bấm nút QR (theo PRD FR3)
router.post("/venues/:id/qr-tap", async (req, res) => {
  await Poi.findOneAndUpdate({ id: req.params.id }, { $inc: { qrTapCount: 1 } });
  res.json({ success: true });
});

// ── GET /api/venues/:id/qr-landing ───────────────────────────
// QR in để trước quán sẽ trỏ vào endpoint này, sau đó redirect tới trang chi tiết quán
router.get("/venues/:id/qr-landing", async (req, res) => {
  const poi = await Poi.findOneAndUpdate(
    { id: req.params.id, status: "approved" },
    { $inc: { qrTapCount: 1 } },
    { new: true }
  ).lean({ virtuals: true });

  if (!poi) {
    res.status(404).json({ success: false, message: "Venue not found" });
    return;
  }

  const frontendBase = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  res.redirect(`${frontendBase}/venue/${encodeURIComponent(poi.id)}`);
});

export default router;
import { Router } from "express";
import crypto from "crypto";
import { Poi } from "../models/poi.model.js";
import { AudioStat } from "../models/audioStat.model.js";
import { optionalAuth } from "../middleware/auth.js";
import { getRedisClient } from "../lib/redis.js";

const router = Router();

const MAX_REVIEWS_PER_HOUR = Number(process.env.REVIEW_MAX_PER_HOUR || 5);
const REVIEW_HOURLY_WINDOW_SECONDS = 60 * 60;
const REVIEW_DUPLICATE_WINDOW_SECONDS = Number(process.env.REVIEW_DUPLICATE_WINDOW_SECONDS || 60 * 60 * 12);
const REVIEW_MAX_LINKS_IN_TEXT = Number(process.env.REVIEW_MAX_LINKS_IN_TEXT || 0);
const MEMORY_RATE_LIMIT = new Map();
const MEMORY_DUPLICATE_REVIEW = new Map();

const DEFAULT_BANNED_WORDS = [
  "sex",
  "xxx",
  "casino",
  "bet",
  "gambling",
  "scam",
  "fraud",
  "viagra",
  "hack",
  "crack",
  "lua dao",
  "danh bac",
  "ca do",
  "ma tuy",
  "ban ma tuy",
];

const REVIEW_BANNED_WORDS = (process.env.REVIEW_BANNED_WORDS || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const EFFECTIVE_BANNED_WORDS = Array.from(new Set([...DEFAULT_BANNED_WORDS, ...REVIEW_BANNED_WORDS]));

function getClientIp(req) {
  const ipRaw = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown-ip";
  return String(ipRaw).split(",")[0].trim();
}

function sanitizeText(value) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "");
}

function normalizeForCheck(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLinkCount(value) {
  const text = String(value || "");
  const matches = text.match(/(https?:\/\/\S+|www\.\S+|\[[^\]]+\]\(https?:\/\/[^\)]+\))/gi);
  return matches ? matches.length : 0;
}

function hasAbnormalRepeatingChars(value) {
  const text = String(value || "");
  const sameCharBurst = /(.)\1{7,}/.test(text);
  const punctuationBurst = /[!?,.~*#@\-_=+]{6,}/.test(text);
  const repeatedWordBurst = /\b([a-zA-Z0-9]{2,})\b(?:\s+\1){4,}/i.test(text);
  return sameCharBurst || punctuationBurst || repeatedWordBurst;
}

function hasBannedWords(value) {
  const normalized = normalizeForCheck(value);
  if (!normalized) return false;

  return EFFECTIVE_BANNED_WORDS.some((rawWord) => {
    const word = normalizeForCheck(rawWord);
    if (!word) return false;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
    return regex.test(normalized);
  });
}

function moderateReviewContent({ author, comment }) {
  const combined = `${author} ${comment}`;

  if (hasBannedWords(combined)) {
    return {
      ok: false,
      message: "Review contains blocked content.",
      code: "blocked_word",
    };
  }

  const linkCount = extractLinkCount(comment);
  if (linkCount > REVIEW_MAX_LINKS_IN_TEXT) {
    return {
      ok: false,
      message: "Links are not allowed in reviews.",
      code: "spam_link",
    };
  }

  if (hasAbnormalRepeatingChars(combined)) {
    return {
      ok: false,
      message: "Review looks like spam due to repeated characters or words.",
      code: "repeated_pattern",
    };
  }

  return { ok: true };
}

function getGuestToken(req) {
  const headerToken = req.headers["x-guest-token"];
  const bodyToken = req.body?.guestToken;
  const token = sanitizeText(String(headerToken || bodyToken || ""));
  if (!token) return "";
  return token.slice(0, 128);
}

function buildGuestFingerprint(req, venueId) {
  const ip = getClientIp(req);
  const userAgent = String(req.headers["user-agent"] || "unknown-ua");
  const guestToken = getGuestToken(req) || "no-token";
  const seed = `${venueId}|${ip}|${userAgent}|${guestToken}`;
  return crypto.createHash("sha256").update(seed).digest("hex");
}

function memoryIncrWithExpiry(key, windowSeconds) {
  const now = Date.now();
  const found = MEMORY_RATE_LIMIT.get(key);
  if (!found || found.expiresAt <= now) {
    MEMORY_RATE_LIMIT.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
    return 1;
  }

  found.count += 1;
  MEMORY_RATE_LIMIT.set(key, found);
  return found.count;
}

function memorySetIfNotExists(key, ttlSeconds) {
  const now = Date.now();
  const current = MEMORY_DUPLICATE_REVIEW.get(key);
  if (current && current > now) {
    return false;
  }
  MEMORY_DUPLICATE_REVIEW.set(key, now + ttlSeconds * 1000);
  return true;
}

async function enforceRateLimit(key, windowSeconds, maxHits) {
  const redis = getRedisClient();
  if (redis) {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    return count <= maxHits;
  }

  const count = memoryIncrWithExpiry(key, windowSeconds);
  return count <= maxHits;
}

async function markReviewOnce(key, ttlSeconds) {
  const redis = getRedisClient();
  if (redis) {
    const ok = await redis.set(key, "1", "EX", ttlSeconds, "NX");
    return ok === "OK";
  }
  return memorySetIfNotExists(key, ttlSeconds);
}

function toISODateOnly(date) {
  return date.toISOString().slice(0, 10);
}

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

// ── POST /api/venues/:id/reviews ─────────────────────────────
// Guest review with anti-spam protections:
// - Per-fingerprint hourly limit
// - Per-venue duplicate window
router.post("/venues/:id/reviews", optionalAuth, async (req, res) => {
  const venueId = req.params.id;
  const rating = Number(req.body?.rating);
  const comment = sanitizeText(req.body?.comment).slice(0, 600);
  const requestedAuthor = sanitizeText(req.body?.author).slice(0, 60);
  const lang = sanitizeText(req.body?.lang || "en").slice(0, 8) || "en";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    res.status(400).json({ success: false, message: "Rating must be an integer from 1 to 5" });
    return;
  }

  if (comment.length < 5) {
    res.status(400).json({ success: false, message: "Comment must be at least 5 characters" });
    return;
  }

  const author = req.user?.name ? sanitizeText(req.user.name).slice(0, 60) : requestedAuthor;
  if (!author || author.length < 2) {
    res.status(400).json({ success: false, message: "Author name is required" });
    return;
  }

  const moderation = moderateReviewContent({ author, comment });
  if (!moderation.ok) {
    res.status(400).json({
      success: false,
      message: moderation.message,
      code: moderation.code,
    });
    return;
  }

  const fingerprint = buildGuestFingerprint(req, venueId);
  const hourlyKey = `reviews:hourly:${fingerprint}`;
  const duplicateKey = `reviews:dup:${venueId}:${fingerprint}`;

  const withinRateLimit = await enforceRateLimit(
    hourlyKey,
    REVIEW_HOURLY_WINDOW_SECONDS,
    MAX_REVIEWS_PER_HOUR
  );
  if (!withinRateLimit) {
    res.status(429).json({ success: false, message: "Too many reviews. Please try again later." });
    return;
  }

  const canPost = await markReviewOnce(duplicateKey, REVIEW_DUPLICATE_WINDOW_SECONDS);
  if (!canPost) {
    res.status(409).json({ success: false, message: "You already reviewed this venue recently." });
    return;
  }

  const poi = await Poi.findOne({ id: venueId, status: "approved" });
  if (!poi) {
    res.status(404).json({ success: false, message: "Venue not found" });
    return;
  }

  const review = {
    id: `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    author,
    rating,
    comment,
    date: toISODateOnly(new Date()),
    lang,
  };

  poi.reviews = [review, ...(poi.reviews || [])].slice(0, 300);
  poi.reviewCount = poi.reviews.length;

  const totalRating = poi.reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0);
  poi.rating = poi.reviewCount > 0
    ? Number((totalRating / poi.reviewCount).toFixed(1))
    : 0;

  await poi.save();

  res.status(201).json({
    success: true,
    data: {
      review,
      rating: poi.rating,
      reviewCount: poi.reviewCount,
    },
  });
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
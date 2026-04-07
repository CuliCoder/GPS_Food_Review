import crypto from "crypto";
import { getRedisClient } from "./redis.js";

const ONLINE_WINDOW_MINUTES = Number(process.env.ONLINE_WINDOW_MINUTES || 5);
const ONLINE_WINDOW_MS = ONLINE_WINDOW_MINUTES * 60 * 1000;
const REDIS_GUEST_ONLINE_KEY = "online:guests";

const memoryGuestLastSeen = new Map();

function getGuestFingerprint(req) {
  const ipRaw = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown-ip";
  const ip = String(ipRaw).split(",")[0].trim();
  const ua = String(req.headers["user-agent"] || "unknown-ua");
  const lang = String(req.headers["accept-language"] || "unknown-lang");
  const seed = `${ip}|${ua}|${lang}`;
  return crypto.createHash("sha1").update(seed).digest("hex");
}

function pruneMemory(now) {
  const threshold = now - ONLINE_WINDOW_MS;
  for (const [fingerprint, lastSeen] of memoryGuestLastSeen.entries()) {
    if (lastSeen < threshold) {
      memoryGuestLastSeen.delete(fingerprint);
    }
  }
}

function shouldTrackGuest(req) {
  if (req.method === "OPTIONS") return false;

  // Chỉ tính guest (không có JWT Bearer)
  const authHeader = req.headers["authorization"];
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return false;
  }

  // Theo dõi hành vi sử dụng app của khách du lịch ở các endpoint public.
  const publicPaths = [
    "/api/venues",
    "/api/audio",
    "/api/chat",
    "/api/languages",
  ];

  return publicPaths.some((prefix) => req.path.startsWith(prefix));
}

export async function trackGuestOnline(req) {
  if (!shouldTrackGuest(req)) return;

  const now = Date.now();
  const fingerprint = getGuestFingerprint(req);
  const redis = getRedisClient();

  if (redis) {
    await redis
      .multi()
      .zadd(REDIS_GUEST_ONLINE_KEY, now, fingerprint)
      .zremrangebyscore(REDIS_GUEST_ONLINE_KEY, 0, now - ONLINE_WINDOW_MS)
      .expire(REDIS_GUEST_ONLINE_KEY, Math.ceil(ONLINE_WINDOW_MS / 1000) + 60)
      .exec();
    return;
  }

  memoryGuestLastSeen.set(fingerprint, now);
  pruneMemory(now);
}

export async function getOnlineGuestCount() {
  const now = Date.now();
  const redis = getRedisClient();

  if (redis) {
    const [, countResult] = await redis
      .multi()
      .zremrangebyscore(REDIS_GUEST_ONLINE_KEY, 0, now - ONLINE_WINDOW_MS)
      .zcard(REDIS_GUEST_ONLINE_KEY)
      .exec();

    return Number(countResult?.[1] || 0);
  }

  pruneMemory(now);
  return memoryGuestLastSeen.size;
}

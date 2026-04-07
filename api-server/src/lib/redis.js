import Redis from "ioredis";

let redisClient;
let redisErrorLogged = false;

export function getRedisClient() {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      connectTimeout: 10000,
      keepAlive: 10000,
    });

    redisClient.on("error", (error) => {
      if (!redisErrorLogged) {
        redisErrorLogged = true;
        console.warn("Redis client error:", error.message);
      }
    });

    redisClient.on("ready", () => {
      redisErrorLogged = false;
    });
  }

  return redisClient;
}
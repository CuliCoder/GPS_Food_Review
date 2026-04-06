import { Router } from "express";
import { getDbReadyState } from "../db/connection.js";

const router = Router();

router.get("/healthz", (_req, res) => {
  const dbState = getDbReadyState();
  // 1 = connected, 2 = connecting
  const dbStatus = dbState === 1 ? "ok" : dbState === 2 ? "connecting" : "error";

  res.status(dbStatus === "error" ? 503 : 200).json({
    status: dbStatus === "ok" ? "ok" : "degraded",
    db: dbStatus,
    uptime: Math.floor(process.uptime()),
  });
});

export default router;
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "change-me";

// Xác thực JWT - bắt buộc đăng nhập
export function requireAuth(req, res, next) {
  const header = req.headers["authorization"];
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);

    // Fire-and-forget heartbeat so admin dashboard can estimate online users.
    User.updateOne(
      { _id: req.user.id },
      { $set: { lastSeenAt: new Date() } }
    ).catch(() => {});

    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

// Chỉ cho phép role cụ thể
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: "Insufficient permissions" });
      return;
    }
    next();
  };
}

// Decode token nếu có nhưng không bắt buộc (Guest mode)
export function optionalAuth(req, _res, next) {
  const header = req.headers["authorization"];
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
}

export function signTokens(payload) {
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  });
  const refreshToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
  });
  return { accessToken, refreshToken };
}
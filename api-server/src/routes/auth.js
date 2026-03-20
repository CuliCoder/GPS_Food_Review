import { Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Poi } from "../models/poi.model.js";
import { AudioStat } from "../models/audioStat.model.js";
import { signTokens, requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// ── Đăng nhập ────────────────────────────────────────────────
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, message: "email and password required" });
    return;
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ success: false, message: "Invalid credentials" });
    return;
  }
  if (user.status === "blocked") {
    res.status(403).json({ success: false, message: "Account is blocked" });
    return;
  }

  const { accessToken, refreshToken } = signTokens({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  // Refresh token lưu vào httpOnly cookie (chống XSS)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
  });

  res.json({ success: true, data: { user, accessToken } });
});

// ── Đăng ký (Member) ─────────────────────────────────────────
router.post("/auth/register", async (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ success: false, message: "email, password and name required" });
    return;
  }

  if (await User.findOne({ email })) {
    res.status(409).json({ success: false, message: "Email already registered" });
    return;
  }

  const user = await User.create({ email, password, name, phone, role: "member" });
  const { accessToken, refreshToken } = signTokens({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
  });

  res.status(201).json({ success: true, data: { user, accessToken } });
});

// ── Đăng ký Vendor ────────────────────────────────────────────
router.post("/auth/register/vendor", async (req, res) => {
  const { email, password, name, phone, shopName } = req.body;
  if (!email || !password || !name || !shopName) {
    res.status(400).json({ success: false, message: "email, password, name and shopName required" });
    return;
  }

  if (await User.findOne({ email })) {
    res.status(409).json({ success: false, message: "Email already registered" });
    return;
  }

  // Vendor mặc định trạng thái "pending", chờ Admin duyệt
  const user = await User.create({
    email, password, name, phone, shopName,
    role: "vendor",
    status: "pending",
  });

  res.status(201).json({ success: true, data: { user, message: "Account pending approval" } });
});

// ── Refresh token ──────────────────────────────────────────────
router.post("/auth/refresh", async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401).json({ success: false, message: "No refresh token" });
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "change-me");
    const { accessToken } = signTokens({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });
    res.json({ success: true, data: { accessToken } });
  } catch {
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
});

// ── Đăng xuất ─────────────────────────────────────────────────
router.post("/auth/logout", (_req, res) => {
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out" });
});

// ── Vendor: thống kê dashboard ────────────────────────────────
router.get("/vendor/stats", requireAuth, requireRole("vendor", "admin"), async (req, res) => {
  const vendor = req.user;

  // Lấy POIs của vendor này
  const pois = await Poi.find({ vendorId: vendor.id }).lean();
  const poiIds = pois.map((p) => p.id);

  const today = new Date();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  // Lượt nghe audio 7 ngày
  const audioStats = await AudioStat.aggregate([
    { $match: { poiId: { $in: poiIds }, date: { $in: last7 } } },
    { $group: { _id: "$date", count: { $sum: 1 } } },
  ]);
  const audioByDay = Object.fromEntries(audioStats.map((s) => [s._id, s.count]));

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dailyTraffic = last7.map((date, i) => ({
    day: days[new Date(date).getDay()],
    visits: audioByDay[date] || 0,
  }));

  res.json({
    success: true,
    data: {
      totalPois: pois.length,
      weeklyAudioPlays: Object.values(audioByDay).reduce((a, b) => a + b, 0),
      totalQrTaps: pois.reduce((sum, p) => sum + (p.qrTapCount || 0), 0),
      totalRespects: pois.reduce((sum, p) => sum + (p.respectCount || 0), 0),
      dailyTraffic,
    },
  });
});

// ── Vendor: danh sách POI của mình ────────────────────────────
router.get("/vendor/venues", requireAuth, requireRole("vendor", "admin"), async (req, res) => {
  const pois = await Poi.find({ vendorId: req.user.id }).lean({ virtuals: true });
  res.json({ success: true, data: pois });
});

// ── Admin: danh sách users ────────────────────────────────────
router.get("/admin/users", requireAuth, requireRole("admin"), async (req, res) => {
  const users = await User.find().lean();
  res.json({ success: true, data: users });
});

// ── Admin: cập nhật trạng thái user ──────────────────────────
router.patch("/admin/users/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }
  res.json({ success: true, data: user });
});

// ── Admin: danh sách POI chờ duyệt ────────────────────────────
router.get("/admin/pending", requireAuth, requireRole("admin"), async (req, res) => {
  const pois = await Poi.find({ status: "pending" }).lean({ virtuals: true });
  res.json({ success: true, data: pois });
});

// ── Admin: duyệt / từ chối POI ────────────────────────────────
router.patch("/admin/pending/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const { action, reason } = req.body;
  const update =
    action === "approve"
      ? { status: "approved" }
      : { status: "rejected", rejectedReason: reason || "Does not meet requirements" };

  const poi = await Poi.findOneAndUpdate({ id: req.params.id }, update, { new: true });
  if (!poi) {
    res.status(404).json({ success: false, message: "POI not found" });
    return;
  }
  res.json({ success: true, data: poi });
});

// ── Admin: thống kê tổng quan ─────────────────────────────────
router.get("/admin/stats", requireAuth, requireRole("admin"), async (req, res) => {
  const [totalVenues, totalVendors, pendingApprovals, totalAudioPlays] = await Promise.all([
    Poi.countDocuments({ status: "approved" }),
    User.countDocuments({ role: "vendor" }),
    Poi.countDocuments({ status: "pending" }),
    AudioStat.countDocuments(),
  ]);

  // Top ngôn ngữ
  const topLangs = await AudioStat.aggregate([
    { $group: { _id: "$lang", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $project: { _id: 0, lang: "$_id", count: 1 } },
  ]);

  res.json({
    success: true,
    data: { totalVenues, totalVendors, pendingApprovals, totalAudioPlays, topLanguages: topLangs },
  });
});

// ── Admin: danh sách toàn bộ POI ─────────────────────────────
router.get("/admin/venues", requireAuth, requireRole("admin"), async (req, res) => {
  const pois = await Poi.find().lean({ virtuals: true });
  res.json({ success: true, data: pois });
});

export default router;
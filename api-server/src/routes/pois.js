import { Router } from "express";
import { Poi } from "../models/poi.model.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// ── Vendor: đăng ký quán mới (status = pending) ───────────────
router.post("/pois", requireAuth, requireRole("vendor", "admin"), async (req, res) => {
  const { name, nameLocal, category, description, descriptionLocal,
    lat, lng, address, priceRange, tags, phone, website, hours } = req.body;

  if (!name || !category || !lat || !lng || !address) {
    res.status(400).json({ success: false, message: "name, category, lat, lng, address are required" });
    return;
  }

  const id = `poi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const poi = await Poi.create({
    id,
    name,
    nameLocal: nameLocal || { en: name },
    category,
    description: description || "",
    descriptionLocal: descriptionLocal || {},
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    location: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
    address,
    priceRange: priceRange || "$",
    tags: tags || [],
    phone: phone || "",
    website: website || "",
    hours: hours || {},
    vendorId: req.user.id,
    status: "pending", // Chờ Admin duyệt
    rating: 0,
    reviewCount: 0,
    isOpen: true,
    audioRadius: 50,
    hasAudio: false,
  });

  res.status(201).json({ success: true, data: poi });
});

// ── Vendor: lấy danh sách quán của mình ──────────────────────
router.get("/pois/mine", requireAuth, requireRole("vendor", "admin"), async (req, res) => {
  const pois = await Poi.find({ vendorId: req.user.id }).lean({ virtuals: true });
  res.json({ success: true, data: pois });
});

// ── Vendor: cập nhật thông tin quán của mình ──────────────────
router.patch("/pois/:id", requireAuth, requireRole("vendor", "admin"), async (req, res) => {
  const poi = await Poi.findOne({ id: req.params.id });
  if (!poi) {
    res.status(404).json({ success: false, message: "POI not found" });
    return;
  }

  // Vendor chỉ sửa được quán của mình
  if (req.user.role !== "admin" && poi.vendorId?.toString() !== req.user.id) {
    res.status(403).json({ success: false, message: "Not your venue" });
    return;
  }

  const allowed = ["name", "nameLocal", "description", "descriptionLocal",
    "address", "priceRange", "tags", "phone", "website", "hours",
    "isOpen", "imageUrl", "menu", "gallery"];

  allowed.forEach(k => {
    if (req.body[k] !== undefined) poi[k] = req.body[k];
  });

  // Nếu vendor sửa nội dung → về pending lại (cần Admin duyệt lại)
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
  if (!poi) {
    res.status(404).json({ success: false, message: "POI not found" });
    return;
  }
  res.json({ success: true, data: poi });
});

// ── Admin: từ chối POI ────────────────────────────────────────
router.patch("/pois/:id/reject", requireAuth, requireRole("admin"), async (req, res) => {
  const poi = await Poi.findOneAndUpdate(
    { id: req.params.id },
    { status: "rejected", rejectedReason: req.body.reason || "Does not meet requirements" },
    { new: true }
  );
  if (!poi) {
    res.status(404).json({ success: false, message: "POI not found" });
    return;
  }
  res.json({ success: true, data: poi });
});

// ── Admin: xóa POI ────────────────────────────────────────────
router.delete("/pois/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const poi = await Poi.findOneAndDelete({ id: req.params.id });
  if (!poi) {
    res.status(404).json({ success: false, message: "POI not found" });
    return;
  }
  res.json({ success: true, message: `Deleted: ${poi.name}` });
});

// ── Vendor: xóa quán của mình (chưa duyệt) ───────────────────
router.delete("/pois/:id/mine", requireAuth, requireRole("vendor", "admin"), async (req, res) => {
  const poi = await Poi.findOne({ id: req.params.id });
  if (!poi) {
    res.status(404).json({ success: false, message: "POI not found" });
    return;
  }
  if (req.user.role !== "admin" && poi.vendorId?.toString() !== req.user.id) {
    res.status(403).json({ success: false, message: "Not your venue" });
    return;
  }
  if (req.user.role !== "admin" && poi.status === "approved") {
    res.status(400).json({ success: false, message: "Cannot delete approved venue. Contact admin." });
    return;
  }
  await poi.deleteOne();
  res.json({ success: true, message: "Deleted successfully" });
});

export default router;
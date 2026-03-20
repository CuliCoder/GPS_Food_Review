import { Router } from "express";
import { Poi } from "../models/poi.model.js";

const router = Router();

// POST /api/chat
router.post("/chat", async (req, res) => {
  const { message, lang = "en", userLat, userLng } = req.body;
  if (!message) {
    res.status(400).json({ success: false, message: "message is required" });
    return;
  }

  const language = typeof lang === "string" && lang.length > 0 ? lang : "en";
  const latitude = Number(userLat);
  const longitude = Number(userLng);
  const hasCoords = Number.isFinite(latitude) && Number.isFinite(longitude);

  const msg = message.toLowerCase();

  // Nhận diện ý định đa ngôn ngữ
  const isNearest  = /nearest|near|gần|近|가까|proche|nächst|cerca|vicin|próxim|ближайш|ใกล|terdekat|नजदीक/.test(msg);
  const isVegetarian = /vegetarian|vegan|chay|素|ベジ|채식|végétar|نباتي|มังสวิรัติ|sayuran|शाकाहारी/.test(msg);
  const isOpen = /open|mở|营业|영업|ouvert|geöffnet|abierto|aperto|مفتوح|เปิด|buka|खुला/.test(msg);
  const isBudget = /budget|cheap|giá rẻ|便宜|安い|저렴|économ|günstig|econom|اقتصاد|ราคา|terjangkau|किफाय/.test(msg);

  const translate = (map) => map[language] ?? map["en"] ?? map["default"] ?? "";

  const nameOf = (p) => {
    const nl = p.nameLocal instanceof Map ? Object.fromEntries(p.nameLocal) : (p.nameLocal || {});
    return nl[language] || nl["en"] || p.name;
  };

  const toCard = (p) => ({
    id: p.id,
    name: nameOf(p),
    category: p.category,
    rating: p.rating,
    address: p.address,
    imageUrl: p.imageUrl,
    isOpen: p.isOpen,
    priceRange: p.priceRange,
  });

  let pois, reply;

  if (isVegetarian) {
    pois = await Poi.find({ status: "approved", category: "vegetarian" }).limit(3).lean();
    reply = translate({ vi: "Quán chay gợi ý:", en: "Great vegetarian options:", zh: "素食推荐：", ja: "ベジタリアン：", ko: "채식:", default: "Great vegetarian options:" });

  } else if (isBudget) {
    pois = await Poi.find({ status: "approved", priceRange: "$" }).limit(3).lean();
    reply = translate({ vi: "Quán ngon giá rẻ:", en: "Budget-friendly picks:", zh: "经济实惠：", ja: "リーズナブル：", ko: "저렴한 곳:", default: "Budget-friendly picks:" });

  } else if (isOpen) {
    pois = await Poi.find({ status: "approved", isOpen: true }).limit(3).lean();
    reply = translate({ vi: "Đang mở cửa:", en: "Open right now:", zh: "现在营业：", ja: "営業中：", ko: "영업 중:", default: "Open right now:" });

  } else if (isNearest && hasCoords) {
    const R = 6371000;
    const all = await Poi.find({ status: "approved" }).lean();
    pois = all
      .map((p) => {
        const dp = ((p.lat - latitude) * Math.PI) / 180;
        const dl = ((p.lng - longitude) * Math.PI) / 180;
        const a = Math.sin(dp / 2) ** 2 +
          Math.cos((latitude * Math.PI) / 180) *
          Math.cos((p.lat * Math.PI) / 180) *
          Math.sin(dl / 2) ** 2;
        return { ...p, _dist: R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) };
      })
      .sort((a, b) => a._dist - b._dist)
      .slice(0, 3);
    reply = translate({ vi: "Quán gần bạn nhất:", en: "Nearest restaurants:", zh: "最近的餐厅：", ja: "最寄り：", ko: "가장 가까운:", default: "Nearest restaurants:" });

  } else {
    pois = await Poi.find({ status: "approved" }).limit(3).lean();
    reply = translate({
      vi: "Tôi có thể giúp bạn tìm quán ăn! Hỏi về: gần nhất, đồ chay, đang mở cửa, hoặc giá rẻ.",
      en: "I can help you find great food! Ask about: nearest, vegetarian, open now, or budget-friendly.",
      zh: "我可以帮您找美食！询问：最近、素食、营业中或经济实惠。",
      ja: "食事探しのお手伝いができます！最寄り、ベジタリアン、営業中、リーズナブルを聞いてください。",
      ko: "맛집을 찾아드릴게요! 가장 가까운, 채식, 영업 중, 저렴한 곳을 물어보세요.",
      default: "I can help you find great food! Ask about: nearest, vegetarian, open now, or budget-friendly.",
    });
  }

  res.json({ success: true, data: { reply, suggestedVenues: (pois || []).map(toCard) } });
});

export default router;
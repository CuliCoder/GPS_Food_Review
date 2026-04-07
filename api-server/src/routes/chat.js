import { OpenRouter } from "@openrouter/sdk";
import { Router } from "express";
import { Poi } from "../models/poi.model.js";

const router = Router();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.CHATBOT_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "qwen/qwen3.6-plus:free";
const OPENROUTER_FALLBACK_MODELS = (process.env.OPENROUTER_FALLBACK_MODELS || "")
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);
const CHATBOT_DEBUG = String(process.env.CHATBOT_DEBUG || "").toLowerCase() === "true";
const OPENROUTER_MAX_RETRIES = Math.max(1, Number(process.env.OPENROUTER_MAX_RETRIES || 2));
const openrouter = OPENROUTER_API_KEY ? new OpenRouter({ apiKey: OPENROUTER_API_KEY }) : null;

console.log(`[CHAT] Init: OpenRouter=${!!openrouter}, DEBUG=${CHATBOT_DEBUG}, Model=${OPENROUTER_MODEL}`);

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function includesAny(text, keywords) {
  const normalizedText = normalizeText(text);
  return keywords.some((keyword) => normalizedText.includes(normalizeText(keyword)));
}

function toChatHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-8)
    .map((item) => {
      const role = item?.role === "assistant" || item?.role === "ai" ? "assistant" : "user";
      const content = typeof item?.content === "string" ? item.content : item?.text;

      if (!content || !String(content).trim()) return null;

      return {
        role,
        content: String(content).trim(),
      };
    })
    .filter(Boolean);
}

function formatVenueContext(venues) {
  if (!Array.isArray(venues) || venues.length === 0) return "";

  return venues
    .map((venue, index) => {
      const distance = Number.isFinite(venue._dist)
        ? `, distance: ${Math.round(venue._dist)}m`
        : "";
      return `${index + 1}. ${venue.name} | category: ${venue.category} | rating: ${venue.rating} | open: ${venue.isOpen ? "yes" : "no"} | price: ${venue.priceRange} | address: ${venue.address}${distance}`;
    })
    .join("\n");
}

async function generateAiReply({ language, message, history, candidateVenues }) {
  if (!openrouter) {
    console.warn("[CHAT] ❌ OpenRouter not initialized - will use contextual fallback");
    return {
      reply: "",
      modelUsed: null,
      error: {
        name: "OpenRouterUnavailable",
        message: "Missing OpenRouter API key",
      },
    };
  }

  const languageNames = {
    vi: "Vietnamese",
    en: "English",
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean",
  };

  const replyLanguage = languageNames[language] || "the user's language";
  const venueContext = formatVenueContext(candidateVenues);
  const modelsToTry = [OPENROUTER_MODEL, ...OPENROUTER_FALLBACK_MODELS.filter((model) => model !== OPENROUTER_MODEL)].filter(Boolean);

  console.log(`[CHAT] 🤖 Trying ${modelsToTry.length} model(s):`, modelsToTry);

  const messages = [
    {
      role: "system",
      content: [
        "You are Smart Food Tour, a helpful restaurant discovery assistant.",
        "Keep the conversation flowing naturally and continue from the previous messages.",
        `Always answer in ${replyLanguage}.`,
        "Be concise, friendly, and useful.",
        "If venue candidates are provided, recommend from those venues only. Do not invent new places.",
        "When the user asks for recommendations, explain why the venues fit the request and invite a follow-up.",
        venueContext ? `\nCandidate venues:\n${venueContext}` : "",
      ].join("\n"),
    },
    ...history,
    {
      role: "user",
      content: message,
    },
  ];

  let lastError = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= OPENROUTER_MAX_RETRIES; attempt += 1) {
      try {
        console.log(`[CHAT] → Attempting ${model} (try ${attempt}/${OPENROUTER_MAX_RETRIES})...`);

        const response = await openrouter.chat.send({
          chatRequest: {
            model,
            messages,
            provider: {
              allowFallbacks: true,
              sort: "price",
            },
            stream: false,
            temperature: 0.6,
          },
        });

        const content =
          response?.choices?.[0]?.message?.content ??
          response?.choices?.[0]?.delta?.content ??
          response?.output_text ??
          response?.content ??
          "";

        if (Array.isArray(content)) {
          const text = content.join("").trim();
          if (text) {
            console.log(`[CHAT] ✅ Got response from ${model} (${text.length} chars)`);
            return { reply: text, modelUsed: model, error: null };
          }

          lastError = {
            name: "EmptyModelResponse",
            message: "Model returned an empty array content",
            model,
          };
          console.warn("OpenRouter returned empty array content", lastError);
          break;
        }

        const text = String(content || "").trim();
        if (text) {
          console.log(`[CHAT] ✅ Got response from ${model} (${text.length} chars)`);
          return { reply: text, modelUsed: model, error: null };
        }

        lastError = {
          name: "EmptyModelResponse",
          message: "Model returned an empty response",
          model,
          responseKeys: response && typeof response === "object" ? Object.keys(response) : [],
        };
        console.warn("OpenRouter returned empty response", lastError);
        break;
      } catch (error) {
        const retryableErrors = new Set([
          "TooManyRequestsResponseError",
          "ProviderOverloadedResponseError",
          "RequestTimeoutResponseError",
          "EdgeNetworkTimeoutResponseError",
        ]);

        lastError = {
          name: error?.name || "UnknownOpenRouterError",
          message: error?.message || String(error),
          model,
          rawMessage: error?.rawMessage,
          status: error?.status,
          code: error?.code,
        };

        if (!retryableErrors.has(error?.name)) {
          console.error(`[CHAT] ❌ Error from ${model}:`, lastError);
          break;
        }

        if (attempt < OPENROUTER_MAX_RETRIES) {
          const backoffMs = 350 * attempt;
          console.warn(`[CHAT] ⚠️ Retryable error from ${model}, waiting ${backoffMs}ms before retry`, lastError);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }

        console.warn(`[CHAT] ⚠️ Retryable error from ${model}, retries exhausted`, lastError);
      }
    }
  }

  console.error("[CHAT] 📋 All AI models failed, using contextual fallback");
  return {
    reply: "",
    modelUsed: null,
    error: lastError,
  };
}

async function buildSuggestionBundle({ msg, language, hasCoords, latitude, longitude }) {
  const translate = (map) => map[language] ?? map.en ?? map.default ?? "";

  const isNearest = includesAny(msg, [
    "nearest", "near", "gan", "gan nhat", "nearby", "closest", "around me", "xung quanh",
    "proche", "nächst", "cerca", "vicino", "terdekat", "ใกล", "ближай", "नजदीक",
  ]);
  const isVegetarian = includesAny(msg, [
    "vegetarian", "vegan", "chay", "plant based", "meatless", "végétar", "채식", "ベジ", "素食", "نبات",
  ]);
  const isOpen = includesAny(msg, [
    "open", "mo cua", "dang mo", "gio mo", "open now", "ouvert", "geoffnet", "abierto", "aperto", "buka", "खुला",
  ]);
  const isBudget = includesAny(msg, [
    "budget", "cheap", "gia re", "gia binh dan", "affordable", "economy", "low cost", "günstig", "économ", "terjangkau", "คุ้ม",
  ]);

  if (isVegetarian) {
    const pois = await Poi.find({ status: "approved", category: "vegetarian" }).limit(3).lean();
    return {
      pois,
      fallbackReply: translate({
        vi: "Quán chay gợi ý:",
        en: "Great vegetarian options:",
        zh: "素食推荐：",
        ja: "ベジタリアン：",
        ko: "채식:",
        default: "Great vegetarian options:",
      }),
    };
  }

  if (isBudget) {
    const pois = await Poi.find({ status: "approved", priceRange: "$" }).limit(3).lean();
    return {
      pois,
      fallbackReply: translate({
        vi: "Quán ngon giá rẻ:",
        en: "Budget-friendly picks:",
        zh: "经济实惠：",
        ja: "リーズナブル：",
        ko: "저렴한 곳:",
        default: "Budget-friendly picks:",
      }),
    };
  }

  if (isOpen) {
    const pois = await Poi.find({ status: "approved", isOpen: true }).limit(3).lean();
    return {
      pois,
      fallbackReply: translate({
        vi: "Đang mở cửa:",
        en: "Open right now:",
        zh: "现在营业：",
        ja: "営業中：",
        ko: "영업 중:",
        default: "Open right now:",
      }),
    };
  }

  if (isNearest && hasCoords) {
    const R = 6371000;
    const all = await Poi.find({ status: "approved" }).lean();
    const pois = all
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

    return {
      pois,
      fallbackReply: translate({
        vi: "Quán gần bạn nhất:",
        en: "Nearest restaurants:",
        zh: "最近的餐厅：",
        ja: "最寄り：",
        ko: "가장 가까운:",
        default: "Nearest restaurants:",
      }),
    };
  }

  if (isNearest) {
    const pois = await Poi.find({ status: "approved" }).sort({ rating: -1, reviewCount: -1 }).limit(3).lean();
    return {
      pois,
      fallbackReply: translate({
        vi: "Hãy bật vị trí để mình gợi ý quán gần bạn chính xác hơn. Tạm thời đây là các quán nổi bật:",
        en: "Turn on location for precise nearby suggestions. For now, here are top-rated picks:",
        default: "Turn on location for precise nearby suggestions. For now, here are top-rated picks:",
      }),
    };
  }

  const pois = await Poi.find({ status: "approved" }).sort({ rating: -1, reviewCount: -1 }).limit(3).lean();
  return {
    pois,
    fallbackReply: translate({
      vi: "Mình có thể giúp bạn tìm quán ăn theo gu, giá, giờ mở cửa hoặc vị trí. Bạn cứ hỏi tự nhiên nhé.",
      en: "I can help you find food based on taste, budget, opening hours, or location. Just ask naturally.",
      zh: "我可以帮您按口味、价格、营业时间或位置找餐厅。您可以自然地提问。",
      ja: "好み、予算、営業時間、場所に合わせてお店探しをお手伝いできます。自然に話しかけてください。",
      ko: "취향, 가격, 영업 시간, 위치에 맞춰 맛집을 찾아드릴 수 있어요. 편하게 질문해 주세요.",
      default: "I can help you find food based on taste, budget, opening hours, or location. Just ask naturally.",
    }),
  };
}

function describeVenue(venue) {
  if (!venue) return "";

  const parts = [venue.name];
  if (venue.rating) parts.push(`${venue.rating} sao`);
  if (venue.priceRange) parts.push(`mức giá ${venue.priceRange}`);
  if (venue.isOpen) parts.push("đang mở cửa");
  if (venue.address) parts.push(venue.address);

  return parts.join(", ");
}

function buildContextualFallbackReply({ language, msg, pois, hasCoords }) {
  const topVenues = Array.isArray(pois) ? pois.slice(0, 3) : [];
  const names = topVenues.map((venue) => venue.name).filter(Boolean);
  const firstVenue = topVenues[0];
  const secondVenue = topVenues[1];

  const translate = (map) => map[language] ?? map.en ?? map.default ?? "";
  const isVegetarian = includesAny(msg, ["vegetarian", "vegan", "chay", "plant based", "meatless", "素食", "채식", "ベジ"]);
  const isBudget = includesAny(msg, ["budget", "cheap", "gia re", "gia binh dan", "affordable", "low cost", "giá rẻ"]);
  const isOpen = includesAny(msg, ["open", "mo cua", "dang mo", "gio mo", "open now", "đang mở"]);
  const isNearest = includesAny(msg, ["nearest", "near", "gan", "gan nhat", "nearby", "closest", "xung quanh"]);

  if (language === "vi") {
    if (isVegetarian && names.length > 0) {
      return `Mình đã lọc được một vài quán chay hợp gu của bạn. Nổi bật nhất là ${describeVenue(firstVenue)}${secondVenue ? `, và ${describeVenue(secondVenue)}` : ""}. Nếu bạn muốn, mình có thể lọc tiếp theo khu vực hoặc mức giá.`;
    }

    if (isBudget && names.length > 0) {
      return `Mình thấy vài quán giá mềm đáng thử: ${describeVenue(firstVenue)}${secondVenue ? `, thêm ${describeVenue(secondVenue)}` : ""}. Bạn muốn mình ưu tiên món gì, ví dụ cơm, bún hay đồ chay không?`;
    }

    if (isOpen && names.length > 0) {
      return `Hiện tại mình thấy các quán đang mở cửa phù hợp gồm ${describeVenue(firstVenue)}${secondVenue ? ` và ${describeVenue(secondVenue)}` : ""}. Nếu cần, mình có thể chọn quán gần bạn nhất hoặc theo món bạn thích.`;
    }

    if (isNearest && hasCoords && names.length > 0) {
      return `Mình đã tìm các quán gần bạn nhất, nổi bật là ${describeVenue(firstVenue)}${secondVenue ? `, tiếp theo là ${describeVenue(secondVenue)}` : ""}. Nếu bạn muốn, mình có thể gợi ý thêm quán chay, quán rẻ hoặc quán đang mở cửa ngay bây giờ.`;
    }

    if (names.length > 0) {
      return `Mình đang có vài gợi ý đáng thử: ${describeVenue(firstVenue)}${secondVenue ? `, thêm ${describeVenue(secondVenue)}` : ""}. Bạn cứ nói tiếp kiểu quán bạn thích, mình sẽ lọc sát hơn cho bạn.`;
    }

    return "Mình chưa lọc ra quán phù hợp hơn ngay lúc này. Bạn cứ nói thêm về món, giá hoặc khu vực, mình sẽ thu hẹp lại cho bạn.";
  }

  if (isVegetarian && names.length > 0) {
    return `I found some vegetarian picks for you. The standout is ${describeVenue(firstVenue)}${secondVenue ? `, plus ${describeVenue(secondVenue)}` : ""}. If you want, I can narrow them down by area or price.`;
  }

  if (isBudget && names.length > 0) {
    return `Here are some budget-friendly spots: ${describeVenue(firstVenue)}${secondVenue ? `, and ${describeVenue(secondVenue)}` : ""}. Tell me what kind of food you want and I will narrow it down.`;
  }

  if (isOpen && names.length > 0) {
    return `These places are open now and fit your request: ${describeVenue(firstVenue)}${secondVenue ? ` and ${describeVenue(secondVenue)}` : ""}. I can also sort them by distance or cuisine.`;
  }

  if (isNearest && hasCoords && names.length > 0) {
    return `I found the nearest matches. Start with ${describeVenue(firstVenue)}${secondVenue ? `, then ${describeVenue(secondVenue)}` : ""}. If you want, I can keep the conversation going with a more specific filter.`;
  }

  if (names.length > 0) {
    return `I have a few solid picks for you: ${describeVenue(firstVenue)}${secondVenue ? `, plus ${describeVenue(secondVenue)}` : ""}. Ask me to refine by taste, budget, or location and I will continue from here.`;
  }

  return "I do not have a better match yet, but I can refine by cuisine, price, opening hours, or location. Just keep going and I will narrow it down.";
}

// POST /api/chat
router.post("/chat", async (req, res) => {
  try {
    const { message, lang = "en", userLat, userLng, history = [] } = req.body;
    if (!message) {
      res.status(400).json({ success: false, message: "message is required" });
      return;
    }

    const language = typeof lang === "string" && lang.length > 0 ? lang : "en";
    const latitude = Number(userLat);
    const longitude = Number(userLng);
    const hasCoords = Number.isFinite(latitude) && Number.isFinite(longitude);

    const msg = normalizeText(message);

    const { pois, fallbackReply } = await buildSuggestionBundle({
      msg,
      language,
      hasCoords,
      latitude,
      longitude,
    });

    const aiResult = await generateAiReply({
      language,
      message,
      history: toChatHistory(history),
      candidateVenues: pois,
    });

    const reply = aiResult.reply || buildContextualFallbackReply({
      language,
      msg,
      pois,
      hasCoords,
    }) || fallbackReply;

    if (aiResult.error) {
      console.warn("Chat model fallback used", {
        model: aiResult.modelUsed || OPENROUTER_MODEL,
        error: aiResult.error,
      });
    }

    const nameOf = (p) => {
      const nl = p.nameLocal instanceof Map ? Object.fromEntries(p.nameLocal) : (p.nameLocal || {});
      return nl[language] || nl.en || p.name;
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

    res.json({
      success: true,
      data: {
        reply,
        suggestedVenues: (pois || []).map(toCard),
        ...(CHATBOT_DEBUG ? { debug: { modelUsed: aiResult.modelUsed || OPENROUTER_MODEL, error: aiResult.error } } : {}),
      },
    });
  } catch (error) {
    console.error("Chat route error:", {
      name: error?.name || "UnknownChatRouteError",
      message: error?.message || String(error),
      rawMessage: error?.rawMessage,
      stack: error?.stack,
    });

    res.status(500).json({
      success: false,
      message: error?.message || "Internal server error",
    });
  }
});

export default router;

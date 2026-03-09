const foods = require("../data/foods");
const { haversineDistanceMeters } = require("../utils/geo");
const {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  normalizeLanguage
} = require("../utils/languages");

const formatFoodByLanguage = (food, languageCode) => {
  const fallback = food.translations["en"] || food.translations[DEFAULT_LANGUAGE];
  const localized = food.translations[languageCode] || fallback;

  return {
    id: food.id,
    lat: food.coordinate.lat,
    lng: food.coordinate.lng,
    radiusMeters: food.radiusMeters,
    imageUrl: food.imageUrl,
    name: localized.name,
    specialty: localized.specialty,
    description: localized.description,
    address: localized.address
  };
};

const getLanguages = (_req, res) => {
  return res.json({ languages: SUPPORTED_LANGUAGES, defaultLanguage: DEFAULT_LANGUAGE });
};

const getFoods = (req, res) => {
  const language = normalizeLanguage(req.query.lang);
  const result = foods.map((food) => formatFoodByLanguage(food, language));
  return res.json({ language, foods: result });
};

const getNearbyFoods = (req, res) => {
  const language = normalizeLanguage(req.query.lang);
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Number(req.query.radius || 100);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: "lat and lng are required" });
  }

  const userPosition = { lat, lng };

  const result = foods
    .map((food) => {
      const distanceMeters = haversineDistanceMeters(userPosition, food.coordinate);
      return {
        ...formatFoodByLanguage(food, language),
        distanceMeters: Number(distanceMeters.toFixed(2))
      };
    })
    .filter((food) => food.distanceMeters <= radius)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  return res.json({ language, foods: result });
};

module.exports = {
  getLanguages,
  getFoods,
  getNearbyFoods,
  formatFoodByLanguage
};

const Food = require("../models/foods");
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

const getFoods = async (req, res) => {
  try {
    const language = normalizeLanguage(req.query.lang);
    const foods = await Food.find({});
    const result = foods.map((food) => formatFoodByLanguage(food, language));
    return res.json({ language, foods: result });
  } catch (error) {
    console.error('Error fetching foods:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getNearbyFoods = async (req, res) => {
  try {
    const language = normalizeLanguage(req.query.lang);
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius || 100);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: "lat and lng are required" });
    }

    const userPosition = { lat, lng };
    const foods = await Food.find({});

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
  } catch (error) {
    console.error('Error fetching nearby foods:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getLanguages,
  getFoods,
  getNearbyFoods,
  formatFoodByLanguage
};

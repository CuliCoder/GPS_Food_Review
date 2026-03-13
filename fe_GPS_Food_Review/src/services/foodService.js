import { buildApiUrl } from "./apiClient";

export const getFoods = async (language) => {
  const response = await fetch(buildApiUrl(`/api/foods?lang=${language}`));
  if (!response.ok) {
    throw new Error("Cannot fetch foods");
  }
  const payload = await response.json();
  return payload.foods || [];
};

export const getFoodsNearUser = async (language, location) => {
  if (!location) {
    return getFoods(language);
  }

  const query = new URLSearchParams({
    lang: language,
    lat: String(location.lat),
    lng: String(location.lng)
  });

  const response = await fetch(buildApiUrl(`/api/foods?${query.toString()}`));
  if (!response.ok) {
    throw new Error("Cannot fetch nearby test foods");
  }

  const payload = await response.json();
  return payload.foods || [];
};

export const getFoodNarrationAudioUrl = async (foodId, language) => {
  const response = await fetch(buildApiUrl(`/api/tts/food/${foodId}?lang=${language}`));
  if (!response.ok) {
    throw new Error("Cannot fetch audio");
  }
  const payload = await response.json();
  return buildApiUrl(payload.audioUrl);
};

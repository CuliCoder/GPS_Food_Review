const SUPPORTED_LANGUAGES = [
  { code: "vi", label: "Tieng Viet" },
  { code: "en", label: "English" },
  { code: "zh", label: "Chinese" },
  { code: "es", label: "Spanish" },
  { code: "hi", label: "Hindi" },
  { code: "ar", label: "Arabic" },
  { code: "pt", label: "Portuguese" },
  { code: "bn", label: "Bengali" },
  { code: "ru", label: "Russian" },
  { code: "ja", label: "Japanese" },
  { code: "pa", label: "Punjabi" },
  { code: "de", label: "German" },
  { code: "ko", label: "Korean" },
  { code: "fr", label: "French" },
  { code: "tr", label: "Turkish" }
];

const DEFAULT_LANGUAGE = "vi";

const normalizeLanguage = (lang) => {
  if (!lang || typeof lang !== "string") {
    return DEFAULT_LANGUAGE;
  }

  const trimmed = lang.toLowerCase().trim();
  const aliasMap = {
    cn: "zh",
    "zh-cn": "zh",
    "zh-hans": "zh",
    "zh-tw": "zh"
  };

  const normalized = aliasMap[trimmed] || trimmed;
  const exists = SUPPORTED_LANGUAGES.some((item) => item.code === normalized);
  return exists ? normalized : DEFAULT_LANGUAGE;
};

module.exports = {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  normalizeLanguage
};

import React, { useState } from "react";
import "../styles/selectLanguage.css";

const SelectLanguage = ({ onLanguageSelected }) => {
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const languages = [
    { code: "zh", name: "Chinese", flag: "🇨🇳", nativeName: "中文" },
    { code: "es", name: "Spanish", flag: "🇪🇸", nativeName: "Español" },
    { code: "en", name: "English", flag: "🇬🇧", nativeName: "English" },
    { code: "hi", name: "Hindi", flag: "🇮🇳", nativeName: "हिन्दी" },
    { code: "ar", name: "Arabic", flag: "🇸🇦", nativeName: "العربية" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹", nativeName: "Português" },
    { code: "bn", name: "Bengali", flag: "🇧🇩", nativeName: "বাংলা" },
    { code: "ru", name: "Russian", flag: "🇷🇺", nativeName: "Русский" },
    { code: "ja", name: "Japanese", flag: "🇯🇵", nativeName: "日本語" },
    { code: "pa", name: "Punjabi", flag: "🇵🇰", nativeName: "پنجابی" },
    { code: "de", name: "German", flag: "🇩🇪", nativeName: "Deutsch" },
    { code: "ko", name: "Korean", flag: "🇰🇷", nativeName: "한국어" },
    { code: "fr", name: "French", flag: "🇫🇷", nativeName: "Français" },
    { code: "tr", name: "Turkish", flag: "🇹🇷", nativeName: "Türkçe" },
    { code: "vi", name: "Vietnamese", flag: "🇻🇳", nativeName: "Tiếng Việt" },
  ];

  const handleLanguageSelect = (e) => {
    const languageCode = e.target.value;
    setSelectedLanguage(languageCode);
    // Lưu ngôn ngữ đã chọn vào localStorage
    localStorage.setItem("selectedLanguage", languageCode);
  };

  const handleContinue = () => {
    console.log("handleContinue gọi, selectedLanguage:", selectedLanguage);
    if (selectedLanguage) {
      console.log("onLanguageSelected callback:", onLanguageSelected);
      if (onLanguageSelected) {
        console.log("Gọi onLanguageSelected với:", selectedLanguage);
        onLanguageSelected(selectedLanguage);
      } else {
        console.log("KHÔNG có callback!");
      }
    } else {
      console.log("Chưa chọn ngôn ngữ!");
    }
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
        width: "100vw",
        height: "100vh",
        margin: 0,
        overflow: "hidden",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            {/* Header */}
            <div className="text-center mb-5">
              <h1
                className="display-4 fw-bold text-white mb-3"
                style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)" }}
              >
                🌍 Chọn Ngôn Ngữ
              </h1>
              <p className="lead text-white-50">Select Your Language</p>
            </div>

            {/* Select Dropdown */}
            <div className="mb-4">
              <select
                className="form-select form-select-lg shadow-lg"
                value={selectedLanguage}
                onChange={handleLanguageSelect}
                style={{
                  padding: "20px 25px",
                  fontSize: "1.2rem",
                  borderRadius: "15px",
                  border: "3px solid rgba(255, 255, 255, 0.3)",
                  transition: "all 0.3s ease",
                }}
              >
                <option value="">-- Chọn ngôn ngữ / Select Language --</option>
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Continue Button */}
            <div className="text-center">
              <button
                className={`btn btn-lg shadow-lg ${selectedLanguage ? "btn-danger" : "btn-light"}`}
                onClick={handleContinue}
                disabled={!selectedLanguage}
                style={{
                  padding: "15px 50px",
                  fontSize: "1.2rem",
                  borderRadius: "50px",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                  transition: "all 0.3s ease",
                  textTransform: "uppercase",
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectLanguage;

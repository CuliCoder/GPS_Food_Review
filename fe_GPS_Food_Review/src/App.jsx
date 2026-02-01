// src/App.jsx
import React, { useState } from "react";
import SelectLanguage from "./pages/selectLanguage";
import Home from "./pages/home";

const App = () => {
  const [isLanguageSelected, setIsLanguageSelected] = useState(() => {
    return !!localStorage.getItem("selectedLanguage");
  });

  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem("selectedLanguage") || "";
  });

  const handleLanguageSelected = (language) => {
    setSelectedLanguage(language);
    setIsLanguageSelected(true);
  };

  const handleReset = () => {
    localStorage.removeItem("selectedLanguage");
    setIsLanguageSelected(false);
    setSelectedLanguage("");
  };

  // Nếu chưa chọn ngôn ngữ, hiển thị SelectLanguage
  if (!isLanguageSelected) {
    return <SelectLanguage onLanguageSelected={handleLanguageSelected} />;
  }

  // Nếu đã chọn, hiển thị Home
  return <Home language={selectedLanguage} onReset={handleReset} />;
};

export default App;

import { useState } from "react";
import SelectLanguage from "./pages/selectLanguage";
import Home from "./pages/home";

const STORAGE_KEY = "gps_food_language";

const App = () => {
  const [language, setLanguage] = useState(() => localStorage.getItem(STORAGE_KEY) || "");

  const handleLanguageSelected = (nextLanguage) => {
    localStorage.setItem(STORAGE_KEY, nextLanguage);
    setLanguage(nextLanguage);
  };

  const handleResetLanguage = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLanguage("");
  };

  if (!language) {
    return <SelectLanguage onSelect={handleLanguageSelected} />;
  }

  return (
    <Home
      language={language}
      onChangeLanguage={handleLanguageSelected}
      onResetLanguage={handleResetLanguage}
    />
  );
};

export default App;

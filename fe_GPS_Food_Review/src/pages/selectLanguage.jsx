import { useMemo, useState } from "react";
import { LANGUAGES } from "../constants/languages";
import "../styles/selectLanguage.css";

const SelectLanguage = ({ onSelect }) => {
  const [selectedLanguage, setSelectedLanguage] = useState("vi");

  const sortedLanguages = useMemo(() => {
    const copy = [...LANGUAGES];
    copy.sort((a, b) => {
      if (a.code === "vi") {
        return -1;
      }
      if (b.code === "vi") {
        return 1;
      }
      if (a.code === "en") {
        return -1;
      }
      if (b.code === "en") {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
    return copy;
  }, []);

  return (
    <main className="language-page">
      <section className="language-card">
        <p className="language-eyebrow">Smart Food Map</p>
        <h1>Choose App Language</h1>
        <p className="language-description">
          Language applies to UI text, food narration audio, and AI chatbot replies.
        </p>

        <label htmlFor="language-select" className="language-label">
          15 supported languages
        </label>
        <select
          id="language-select"
          value={selectedLanguage}
          onChange={(event) => setSelectedLanguage(event.target.value)}
          className="language-select"
        >
          {sortedLanguages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.name} ({language.code})
            </option>
          ))}
        </select>

        <button type="button" className="language-action" onClick={() => onSelect(selectedLanguage)}>
          Continue
        </button>
      </section>
    </main>
  );
};

export default SelectLanguage;

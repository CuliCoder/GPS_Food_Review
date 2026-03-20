import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/store/use-app-store";
import { motion } from "framer-motion";
import { Search, Map as MapIcon, Compass } from "lucide-react";
const LANGUAGES = [
    { code: "en", name: "English", native: "English", flag: "🇬🇧" },
    { code: "vi", name: "Vietnamese", native: "Tiếng Việt", flag: "🇻🇳" },
    { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳" },
    { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "Korean", native: "한국어", flag: "🇰🇷" },
    { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
    { code: "th", name: "Thai", native: "ไทย", flag: "🇹🇭" },
    { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
    { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
    { code: "it", name: "Italian", native: "Italiano", flag: "🇮🇹" },
    { code: "pt", name: "Portuguese", native: "Português", flag: "🇧🇷" },
    { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
    { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦" },
    { code: "id", name: "Indonesian", native: "Bahasa Indonesia", flag: "🇮🇩" },
    { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
];
export default function LanguageSelect() {
    const [, setLocation] = useLocation();
    const { language, setLanguage } = useAppStore();
    const [search, setSearch] = useState("");
    const filteredLangs = useMemo(() => {
        const s = search.toLowerCase();
        return LANGUAGES.filter(l => l.name.toLowerCase().includes(s) ||
            l.native.toLowerCase().includes(s));
    }, [search]);
    const handleSelect = (code) => {
        setLanguage(code);
        setLocation("/map");
    };
    return (<div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-background">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img src={`${import.meta.env.BASE_URL}images/landing-bg.png`} alt="Food background" className="w-full h-full object-cover opacity-60"/>
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background"></div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-4xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl shadow-primary/10 rounded-3xl p-6 sm:p-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-6 transform -rotate-6">
          <Compass className="w-8 h-8 text-white"/>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-display font-bold text-center mb-4 text-foreground">
          Smart <span className="text-primary">Food</span> Tour
        </h1>
        <p className="text-muted-foreground text-center text-lg sm:text-xl mb-8 max-w-lg">
          Discover local culinary treasures in your native language. Select how you'd like to experience the tour.
        </p>

        <div className="w-full max-w-md relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5"/>
          <input type="text" placeholder="Search language..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-border/50 rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg placeholder:text-muted-foreground/70 shadow-inner"/>
        </div>

        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredLangs.map((lang) => (<motion.button key={lang.code} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => handleSelect(lang.code)} className={`
                group p-4 rounded-2xl flex flex-col items-center gap-3 transition-all duration-300
                ${language === lang.code
                ? 'bg-primary text-white shadow-lg shadow-primary/30 border-none'
                : 'bg-white hover:bg-secondary/50 border border-border/50 hover:border-primary/30 shadow-sm hover:shadow-md'}
              `}>
              <span className="text-4xl drop-shadow-sm group-hover:scale-110 transition-transform">{lang.flag}</span>
              <div className="text-center">
                <div className={`font-semibold text-sm ${language === lang.code ? 'text-white' : 'text-foreground'}`}>
                  {lang.native}
                </div>
                <div className={`text-xs mt-0.5 ${language === lang.code ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {lang.name}
                </div>
              </div>
            </motion.button>))}
          {filteredLangs.length === 0 && (<div className="col-span-full py-8 text-center text-muted-foreground">
              No languages found matching "{search}"
            </div>)}
        </div>
        
        <div className="mt-8 pt-6 border-t border-border/50 w-full flex justify-center">
          <button onClick={() => setLocation("/map")} className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-colors shadow-lg">
            <MapIcon className="w-5 h-5"/>
            Continue to Map
          </button>
        </div>
      </motion.div>
    </div>);
}

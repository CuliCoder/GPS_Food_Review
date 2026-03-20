import { useAppStore } from "@/store/use-app-store";
import { Globe } from "lucide-react";
import { Link } from "wouter";
export function LanguageSwitcher() {
    const { language } = useAppStore();
    const getFlag = (code) => {
        const flags = {
            en: "🇬🇧", vi: "🇻🇳", zh: "🇨🇳", ja: "🇯🇵", ko: "🇰🇷",
            fr: "🇫🇷", de: "🇩🇪", es: "🇪🇸", it: "🇮🇹", pt: "🇧🇷",
            ru: "🇷🇺", ar: "🇸🇦", th: "🇹🇭", id: "🇮🇩", hi: "🇮🇳"
        };
        return flags[code] || "🌐";
    };
    return (<Link href="/" className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-md border border-border/50 rounded-full shadow-sm hover:shadow-md hover:bg-white transition-all cursor-pointer text-sm font-medium text-foreground">
      <Globe className="w-4 h-4 text-muted-foreground"/>
      <span className="flex items-center gap-1.5">
        <span className="text-base leading-none">{getFlag(language)}</span>
        <span className="uppercase tracking-wider opacity-80">{language}</span>
      </span>
    </Link>);
}

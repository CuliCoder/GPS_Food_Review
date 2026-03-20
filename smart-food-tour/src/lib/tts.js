/**
 * Audio playback — ưu tiên gTTS từ BE, fallback Web Speech API
 */

let currentAudio = null;

/**
 * Phát audio từ BE (gTTS stream)
 * @param {string} url - URL audio stream từ BE
 * @param {function} onEnd - callback khi audio kết thúc
 */
export const playAudioFromUrl = (url, onEnd) => {
  stopAudioTranscript();

  currentAudio = new Audio(url);

  if (onEnd) currentAudio.addEventListener("ended", onEnd);

  currentAudio.play().catch((err) => {
    console.error("Audio play error:", err);
  });

  return currentAudio;
};

/**
 * Dừng audio đang phát
 */
export const stopAudioTranscript = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Fallback: Web Speech API
 * Dùng khi venue không có audio transcript
 */
const LANG_BCP47 = {
  vi: "vi-VN", en: "en-US", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR",
  fr: "fr-FR", de: "de-DE", es: "es-ES", it: "it-IT", pt: "pt-BR",
  ru: "ru-RU", ar: "ar-SA", th: "th-TH", id: "id-ID", hi: "hi-IN",
};

export const playAudioTranscript = (text, lang = "en") => {
  if (!window.speechSynthesis) return;
  stopAudioTranscript();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG_BCP47[lang] || lang;
  utterance.rate = lang === "vi" ? 0.85 : 0.95;

  const loadAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(lang.toLowerCase())
    );
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    loadAndSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = loadAndSpeak;
  }
};
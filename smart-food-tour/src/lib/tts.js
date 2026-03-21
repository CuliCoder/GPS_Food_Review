/**
 * Audio playback — gTTS stream từ BE
 * Tự động dừng khi rời khỏi phạm vi hoặc unmount
 */

let currentAudio = null;
let currentVenueId = null;

// Unlock AudioContext sau lần tương tác đầu tiên của user
let audioUnlocked = false;
export function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  // Tạo và resume AudioContext để unlock autoplay policy
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctx.resume().then(() => ctx.close());
  } catch {}
}

/**
 * Phát audio từ URL (gTTS stream)
 * @returns {HTMLAudioElement}
 */
export const playAudioFromUrl = (url, venueId, { onEnd, onError } = {}) => {
  // Dừng audio đang phát nếu khác venue
  if (currentAudio && currentVenueId !== venueId) {
    stopAudioTranscript();
  }
  // Nếu đang phát cùng venue thì không phát lại
  if (currentVenueId === venueId && currentAudio && !currentAudio.paused) return currentAudio;

  currentAudio = new Audio(url);
  currentVenueId = venueId;

  currentAudio.addEventListener("ended", () => {
    currentVenueId = null;
    onEnd?.();
  });
  currentAudio.addEventListener("error", (e) => {
    console.error("Audio error:", e);
    currentVenueId = null;
    onError?.(e);
  });

  currentAudio.play().catch((err) => {
    console.error("Audio play error:", err);
    currentVenueId = null;
    onError?.(err);
  });

  return currentAudio;
};

/**
 * Dừng audio đang phát
 */
export const stopAudioTranscript = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
  currentVenueId = null;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
};

/**
 * Lấy venue đang phát
 */
export const getCurrentPlayingVenueId = () => currentVenueId;

/**
 * Fallback: Web Speech API
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
    const voice = window.speechSynthesis.getVoices()
      .find(v => v.lang.toLowerCase().startsWith(lang.toLowerCase()));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };
  window.speechSynthesis.getVoices().length > 0
    ? loadAndSpeak()
    : (window.speechSynthesis.onvoiceschanged = loadAndSpeak);
};
import { create } from "zustand";
import { persist } from "zustand/middleware";

function getStoredAuth() {
  if (typeof window === "undefined") {
    return { user: null, accessToken: null };
  }

  try {
    return {
      user: JSON.parse(localStorage.getItem("sft_user") || "null"),
      accessToken: localStorage.getItem("sft_token"),
    };
  } catch {
    return { user: null, accessToken: null };
  }
}

const initialAuth = getStoredAuth();

export const useAppStore = create()(
  persist(
    (set) => ({
      // ── Ngôn ngữ ────────────────────────────────────────────
      language: "en",
      setLanguage: (language) => set({ language }),

      // ── GPS (fake GPS — click map để di chuyển) ─────────────
      // Mặc định trung tâm TP.HCM
      gpsPosition: [10.7769, 106.7009],
      setGpsPosition: (lat, lng) => set({ gpsPosition: [lat, lng] }),

      // ── Audio: chỉ phát mỗi venue 1 lần/session ─────────────
      playedVenues: [],
      markVenuePlayed: (venueId) =>
        set((state) => ({
          playedVenues: [...new Set([...state.playedVenues, venueId])],
        })),
      resetPlayedVenues: () => set({ playedVenues: [] }),

      // ── Auth ─────────────────────────────────────────────────
      user: initialAuth.user,
      accessToken: initialAuth.accessToken,

      setAuth: (user, accessToken) => {
        // Lưu vào localStorage để dashboard dùng trực tiếp
        localStorage.setItem("sft_token", accessToken);
        localStorage.setItem("sft_user", JSON.stringify(user));
        set({ user, accessToken });
      },

      clearAuth: () => {
        localStorage.removeItem("sft_token");
        localStorage.removeItem("sft_user");
        set({ user: null, accessToken: null });
      },
    }),
    {
      name: "smart-food-tour-storage",
      // Chỉ persist language — token/user không persist vì bảo mật
      partialize: (state) => ({ language: state.language }),
    }
  )
);
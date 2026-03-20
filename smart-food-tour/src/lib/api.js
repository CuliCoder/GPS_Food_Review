import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/use-app-store";

const API_BASE = "/api";

/**
 * Core fetch helper
 * - Tự động gắn JWT Bearer token
 * - Tự động unwrap { success, data } format
 * - Throw lỗi rõ ràng khi !res.ok
 */
async function apiFetch(path, options = {}) {
  // Lấy token từ store (memory) hoặc localStorage fallback
  const token = useAppStore.getState().accessToken
    || localStorage.getItem("sft_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `API error ${res.status}`);
  }

  const json = await res.json();

  // Unwrap { success: true, data: ... } nếu có
  if (json && typeof json === "object" && "success" in json && "data" in json) {
    return json.data;
  }
  return json;
}

// ── Public API (không cần token) ─────────────────────────────

export function useVenues(lang, category, lat, lng) {
  const params = new URLSearchParams({ lang });
  if (category) params.set("category", category);
  if (lat != null) params.set("lat", lat);
  if (lng != null) params.set("lng", lng);

  return useQuery({
    queryKey: ["venues", lang, category, lat, lng],
    queryFn: () => apiFetch(`/venues?${params}`),
  });
}

export function useNearbyVenues(lat, lng, radius = 10000, lang = "en") {
  return useQuery({
    queryKey: ["venues/nearby", lat, lng, radius, lang],
    queryFn: () =>
      apiFetch(`/venues/nearby?lat=${lat}&lng=${lng}&radius=${radius}&lang=${lang}`),
    enabled: lat != null && lng != null,
  });
}

export function useVenueDetail(id, lang = "en") {
  return useQuery({
    queryKey: ["venues", id, lang],
    queryFn: () => apiFetch(`/venues/${id}?lang=${lang}`),
    enabled: !!id,
  });
}

export function useLanguages() {
  return useQuery({
    queryKey: ["languages"],
    queryFn: () => apiFetch("/languages"),
    staleTime: Infinity, // Không đổi, cache mãi
  });
}

export function getAudioUrl(venueId, lang = "en") {
  return `${API_BASE}/audio/${venueId}?lang=${lang}`;
}

export async function fetchAudioTranscript(venueId, lang = "en") {
  return apiFetch(`/audio/${venueId}/transcript?lang=${lang}`);
}

export function useSendChat() {
  return useMutation({
    mutationFn: (body) =>
      apiFetch("/chat", { method: "POST", body: JSON.stringify(body) }),
  });
}

// Respect (yêu thích)
export function useRespect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (venueId) =>
      apiFetch(`/venues/${venueId}/respect`, { method: "POST" }),
    onSuccess: (_data, venueId) => {
      // Invalidate cache để refetch venue detail
      queryClient.invalidateQueries({ queryKey: ["venues", venueId] });
    },
  });
}

// QR tap tracking
export function useQrTap() {
  return useMutation({
    mutationFn: (venueId) =>
      apiFetch(`/venues/${venueId}/qr-tap`, { method: "POST" }),
  });
}

// ── Auth ──────────────────────────────────────────────────────

export async function apiLogin(email, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(data) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiRegisterVendor(data) {
  return apiFetch("/auth/register/vendor", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiLogout() {
  return apiFetch("/auth/logout", { method: "POST" });
}

// ── Vendor ────────────────────────────────────────────────────

export function useVendorStats() {
  return useQuery({
    queryKey: ["vendor/stats"],
    queryFn: () => apiFetch("/vendor/stats"),
  });
}

export function useVendorVenues() {
  return useQuery({
    queryKey: ["vendor/venues"],
    queryFn: () => apiFetch("/vendor/venues"),
  });
}

// ── Admin ─────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin/stats"],
    queryFn: () => apiFetch("/admin/stats"),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin/users"],
    queryFn: () => apiFetch("/admin/users"),
  });
}

export function useAdminPending() {
  return useQuery({
    queryKey: ["admin/pending"],
    queryFn: () => apiFetch("/admin/pending"),
  });
}

export function useAdminVenues() {
  return useQuery({
    queryKey: ["admin/venues"],
    queryFn: () => apiFetch("/admin/venues"),
  });
}

export function useAdminApprovePending() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }) =>
      apiFetch(`/admin/pending/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ action, reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin/pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin/stats"] });
    },
  });
}

export function useAdminUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) =>
      apiFetch(`/admin/users/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin/users"] });
    },
  });
}
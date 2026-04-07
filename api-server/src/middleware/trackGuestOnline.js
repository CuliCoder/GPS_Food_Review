import { trackGuestOnline } from "../lib/onlineGuests.js";

export function trackGuestOnlineMiddleware(req, _res, next) {
  trackGuestOnline(req).catch(() => {});
  next();
}

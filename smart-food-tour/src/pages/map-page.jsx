import { useEffect, useState, useCallback } from "react";
import {
  MapContainer, TileLayer, Marker, Popup,
  useMapEvents, useMap,
} from "react-leaflet";
import L from "leaflet";
import { Link } from "wouter";
import { useNearbyVenues, getAudioUrl } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";
import {
  playAudioFromUrl, stopAudioTranscript,
  unlockAudio, getCurrentPlayingVenueId,
} from "@/lib/tts";
import { ChatBox } from "@/components/chat-box";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapPin, Navigation, Star, ChevronRight, Menu, X, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const userIcon = L.divIcon({
  className: "custom-user-marker",
  html: `<div class="gps-marker-pulse" style="width:20px;height:20px;"></div>`,
  iconSize: [20, 20], iconAnchor: [10, 10],
});

const getCategoryEmoji = (cat) => {
  const map = { vietnamese: "🍜", "banh-mi": "🥖", coffee: "☕", hotpot: "🔥", seafood: "🦐", vegetarian: "🥗" };
  return map[cat] || "🍽️";
};

const getVenueIcon = (category, isPlaying) =>
  L.divIcon({
    className: "custom-venue-marker",
    html: `<div class="venue-marker${isPlaying ? ' venue-marker-glow' : ''}" style="width:36px;height:36px;">${getCategoryEmoji(category)}</div>`,
    iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18],
  });

function MapEvents({ onLocationClick }) {
  useMapEvents({
    click(e) {
      unlockAudio(); // Unlock autoplay khi user click map
      onLocationClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapInvalidate({ trigger }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(t);
  }, [trigger, map]);
  return null;
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function MapPage() {
  const { language, gpsPosition, setGpsPosition, playedVenues, markVenuePlayed } = useAppStore();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [playingVenueId, setPlayingVenueId] = useState(null);

  const { data: venues, isLoading } = useNearbyVenues(
    gpsPosition[0], gpsPosition[1], 10000, language
  );

  // Dừng audio khi unmount (rời trang)
  useEffect(() => {
    return () => stopAudioTranscript();
  }, []);

  // Proximity: tự phát khi vào phạm vi, dừng khi ra khỏi phạm vi
  useEffect(() => {
    if (!venues) return;

    // Kiểm tra venue đang phát có còn trong phạm vi không
    const currentId = getCurrentPlayingVenueId();
    if (currentId) {
      const current = venues.find(v => v.id === currentId);
      if (current) {
        const dist = haversine(gpsPosition[0], gpsPosition[1], current.lat, current.lng);
        if (dist > (current.audioRadius || 50)) {
          // Ra khỏi phạm vi → dừng audio
          stopAudioTranscript();
          setPlayingVenueId(null);
        }
      }
    }

    // Tìm venue mới trong phạm vi chưa phát
    const triggerable = venues.filter(
      v => v.withinAudioRadius && !playedVenues.includes(v.id)
    );
    if (triggerable.length === 0) return;

    const venue = triggerable[0];
    markVenuePlayed(venue.id);

    const audioUrl = getAudioUrl(venue.id, language);
    playAudioFromUrl(audioUrl, venue.id, {
      onEnd: () => setPlayingVenueId(null),
      onError: () => setPlayingVenueId(null),
    });
    setPlayingVenueId(venue.id);
  }, [venues, gpsPosition]);

  const handleStopAudio = () => {
    stopAudioTranscript();
    setPlayingVenueId(null);
  };

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-background">
      {isMobile && sidebarOpen && (
        <button
          aria-label="Close venue list"
          onClick={() => setSidebarOpen(false)}
          className="absolute inset-0 z-10 bg-black/35"
        />
      )}

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div key="sidebar"
            initial={isMobile ? { x: -360, opacity: 0 } : { width: 0, opacity: 0 }}
            animate={isMobile ? { x: 0, opacity: 1 } : { width: 360, opacity: 1 }}
            exit={isMobile ? { x: -360, opacity: 0 } : { width: 0, opacity: 0 }}
            transition={{ type: "tween", duration: 0.25 }}
            className={`${
              isMobile
                ? "absolute left-0 top-0 h-full w-[88vw] max-w-[360px]"
                : "h-full w-[360px]"
            } bg-white shadow-2xl z-20 flex flex-col shrink-0 overflow-hidden`}>
            <div className="p-4 sm:p-5 bg-gradient-to-b from-primary/10 to-transparent border-b border-border/50 w-full">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-xl font-bold text-foreground">Nearby Venues</h1>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block">
                    <LanguageSwitcher />
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-primary" />
                Click map to move your location
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 w-full">
              {isLoading
                ? [1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse flex gap-4 bg-muted/30 p-3 rounded-2xl">
                      <div className="w-20 h-20 bg-muted rounded-xl" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))
                : venues?.map(venue => (
                    <Link href={`/venue/${venue.id}`} key={venue.id}>
                      <div className={`group bg-white border rounded-2xl p-3 flex gap-4 cursor-pointer hover:shadow-lg transition-all duration-300 ${
                        playingVenueId === venue.id
                          ? "border-primary/60 shadow-md shadow-primary/10"
                          : "border-border/50 hover:border-primary/40"
                      }`}>
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative">
                          <img
                            src={venue.imageUrl || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80"}
                            alt={venue.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {playingVenueId === venue.id && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <Volume2 className="w-6 h-6 text-white drop-shadow" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {venue.name}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1 text-amber-500 font-medium">
                                <Star className="w-3.5 h-3.5 fill-current" />{venue.rating}
                              </span>
                              <span className="truncate">{venue.category}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              venue.distance && venue.distance < 100
                                ? "bg-green-100 text-green-700"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {venue.distance ? `${Math.round(venue.distance)}m away` : ""}
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map */}
      <div className="flex-1 relative h-full">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] z-[1000] bg-white p-2.5 sm:p-3 rounded-xl shadow-lg border border-border hover:bg-slate-50 transition-colors">
          <Menu className="w-5 h-5" />
        </button>

        <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-[1000] flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <Link href="/login">
            <span className="bg-white shadow-md border border-gray-200 text-gray-700 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-xl cursor-pointer flex items-center gap-1.5">
              <span className="sm:hidden">🏪 Admin</span>
              <span className="hidden sm:inline">🏪 Chủ quán / Admin</span>
            </span>
          </Link>
        </div>

        {/* Now playing bar */}
        <AnimatePresence>
          {playingVenueId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-[7.2rem] sm:bottom-24 left-1/2 -translate-x-1/2 z-[1000] bg-white border border-primary/30 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 max-w-xs w-[90%]"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary">Đang phát thuyết minh</p>
                <p className="text-xs text-muted-foreground truncate">
                  {venues?.find(v => v.id === playingVenueId)?.name}
                </p>
              </div>
              <button onClick={handleStopAudio}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors shrink-0">
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <MapContainer center={gpsPosition} zoom={15} className="w-full h-full" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapEvents onLocationClick={setGpsPosition} />
          <MapInvalidate trigger={sidebarOpen} />

          <Marker position={gpsPosition} icon={userIcon}>
            <Popup>
              <div className="font-semibold text-center pb-1">You are here</div>
              <div className="text-xs text-muted-foreground text-center">Click anywhere to move</div>
            </Popup>
          </Marker>

          {venues?.map(venue => (
            <Marker
              key={venue.id}
              position={[venue.lat, venue.lng]}
              icon={getVenueIcon(venue.category, playingVenueId === venue.id)}
            >
              <Popup>
                <div className="w-48 pb-1">
                  <div className="h-24 -mt-4 -mx-4 mb-3 overflow-hidden">
                    <img src={venue.imageUrl} alt={venue.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{venue.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3 h-3" />
                    <span>{venue.distance ? `${Math.round(venue.distance)}m away` : venue.address}</span>
                  </div>
                  <Link href={`/venue/${venue.id}`}>
                    <button className="w-full py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                      View Details
                    </button>
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <ChatBox />
    </div>
  );
}
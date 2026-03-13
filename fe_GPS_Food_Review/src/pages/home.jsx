import { useEffect, useMemo, useRef, useState } from "react";
import ChatBubble from "../components/ChatBubble";
import ChatWidget from "../components/ChatWidget";
import MapSection from "../components/MapSection";
import { LANGUAGES } from "../constants/languages";
import requestAssistantReply from "../services/chatService";
import { getFoodNarrationAudioUrl, getFoodsNearUser } from "../services/foodService";
import "../styles/home.css";

const PROXIMITY_COOLDOWN_MS = 45000;

const distanceInMeters = (from, to) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const Home = ({ language, onChangeLanguage, onResetLanguage }) => {
  const [foods, setFoods] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [activeFood, setActiveFood] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Hello. I can suggest food places near your current position." }
  ]);
  const [audioState, setAudioState] = useState({ isMuted: false, isPlaying: false });

  const audioRef = useRef(null);
  const insideRadiusRef = useRef(new Set());
  const playedAtRef = useRef(new Map());
  const roundedLocationKey = userLocation
    ? `${userLocation.lat.toFixed(4)}_${userLocation.lng.toFixed(4)}`
    : "none";

  useEffect(() => {
    let cancelled = false;

    const loadFoods = async () => {
      try {
        const data = await getFoodsNearUser(language, userLocation);
        if (!cancelled) {
          setFoods(data);
        }
      } catch (_error) {
        if (!cancelled) {
          setFoods([]);
        }
      }
    };

    loadFoods();

    return () => {
      cancelled = true;
    };
  }, [language, roundedLocationKey]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return undefined;
    }

    const watcherId = navigator.geolocation.watchPosition(
      (position) => {
        setLocationError("");
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        setLocationError("Unable to read GPS. Please allow location permission.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 10000
      }
    );

    return () => navigator.geolocation.clearWatch(watcherId);
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.muted = audioState.isMuted;
  }, [audioState.isMuted]);

  useEffect(() => {
    if (!userLocation || foods.length === 0) {
      return;
    }

    const now = Date.now();
    const insideNow = new Set();

    foods.forEach((food) => {
      const meters = distanceInMeters(userLocation, { lat: food.lat, lng: food.lng });
      const inRadius = meters <= food.radiusMeters;

      if (!inRadius) {
        return;
      }

      insideNow.add(food.id);

      const wasInsideBefore = insideRadiusRef.current.has(food.id);
      const lastPlayedAt = playedAtRef.current.get(food.id) || 0;
      const isOutOfCooldown = now - lastPlayedAt > PROXIMITY_COOLDOWN_MS;

      if (!wasInsideBefore && isOutOfCooldown) {
        setActiveFood(food);
        playedAtRef.current.set(food.id, now);

        getFoodNarrationAudioUrl(food.id, language)
          .then((url) => {
            if (!audioRef.current) {
              return;
            }

            audioRef.current.src = url;
            audioRef.current.play().then(() => {
              setAudioState((prev) => ({ ...prev, isPlaying: true }));
            }).catch(() => {
              setAudioState((prev) => ({ ...prev, isPlaying: false }));
            });
          })
          .catch(() => {
            setAudioState((prev) => ({ ...prev, isPlaying: false }));
          });
      }
    });

    insideRadiusRef.current = insideNow;
  }, [foods, language, userLocation]);

  const nearestFoods = useMemo(() => {
    if (!userLocation) {
      return [];
    }

    return foods
      .map((food) => ({
        ...food,
        distanceMeters: distanceInMeters(userLocation, { lat: food.lat, lng: food.lng })
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 3);
  }, [foods, userLocation]);

  const togglePlayPause = async () => {
    if (!audioRef.current?.src) {
      return;
    }

    if (audioState.isPlaying) {
      audioRef.current.pause();
      setAudioState((prev) => ({ ...prev, isPlaying: false }));
      return;
    }

    try {
      await audioRef.current.play();
      setAudioState((prev) => ({ ...prev, isPlaying: true }));
    } catch (_error) {
      setAudioState((prev) => ({ ...prev, isPlaying: false }));
    }
  };

  const toggleMute = () => {
    setAudioState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const sendChat = async () => {
    const question = chatInput.trim();
    if (!question || chatLoading) {
      return;
    }

    setMessages((prev) => [...prev, { id: prev.length + 1, sender: "user", text: question }]);
    setChatInput("");
    setChatLoading(true);

    const reply = await requestAssistantReply(question, language, userLocation);
    setMessages((prev) => [...prev, { id: prev.length + 1, sender: "bot", text: reply.answer }]);
    setChatLoading(false);
  };

  return (
    <main className="home-page">
      <MapSection
        userLocation={userLocation}
        foods={foods}
        activeFood={activeFood}
        onResetLanguage={onResetLanguage}
      />

      <section className="status-strip">
        <div>
          <strong>Language:</strong> {language}
          <select
            value={language}
            className="inline-select"
            onChange={(event) => onChangeLanguage(event.target.value)}
          >
            {LANGUAGES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div>{locationError || "GPS tracking is active"}</div>
      </section>

      <section className="proximity-panel">
        <h3>Nearby recommendations</h3>
        {nearestFoods.length === 0 && <p>Waiting for stable GPS location...</p>}
        {nearestFoods.map((food) => (
          <article key={food.id} className="food-row">
            <div>
              <h4>{food.name}</h4>
              <p>{food.specialty}</p>
            </div>
            <span>{food.distanceMeters.toFixed(0)} m</span>
          </article>
        ))}
      </section>

      {activeFood && (
        <section className="active-food-popup">
          <img src={activeFood.imageUrl} alt={activeFood.name} />
          <div>
            <h4>{activeFood.name}</h4>
            <p>{activeFood.description}</p>
          </div>
        </section>
      )}

      <section className="audio-controls" aria-label="Audio controls">
        <button type="button" onClick={togglePlayPause}>
          {audioState.isPlaying ? "Pause" : "Play"}
        </button>
        <button type="button" onClick={toggleMute}>
          {audioState.isMuted ? "Unmute" : "Mute"}
        </button>
      </section>

      {!chatOpen && <ChatBubble onClick={() => setChatOpen(true)} />}
      {chatOpen && (
        <ChatWidget
          messages={messages}
          inputMessage={chatInput}
          onInputChange={(event) => setChatInput(event.target.value)}
          onSend={sendChat}
          onClose={() => setChatOpen(false)}
          loading={chatLoading}
        />
      )}

      <audio
        ref={audioRef}
        onPlay={() => setAudioState((prev) => ({ ...prev, isPlaying: true }))}
        onPause={() => setAudioState((prev) => ({ ...prev, isPlaying: false }))}
        onEnded={() => setAudioState((prev) => ({ ...prev, isPlaying: false }))}
      />
    </main>
  );
};

export default Home;

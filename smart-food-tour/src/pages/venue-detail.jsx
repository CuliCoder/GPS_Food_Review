import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useVenueDetail, getAudioUrl, useRespect, useQrTap } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";
import { playAudioFromUrl, stopAudioTranscript } from "@/lib/tts";
import {
  ArrowLeft, Star, MapPin, Clock, Phone, Globe,
  Volume2, Images, Heart, QrCode,
} from "lucide-react";
import { ChatBox } from "@/components/chat-box";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function VenueDetail() {
  const [, params] = useRoute("/venue/:id");
  const venueId = params?.id || "";
  const { language } = useAppStore();
  const { toast } = useToast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [showQr, setShowQr] = useState(false);
  const [respected, setRespected] = useState(false);

  const { data: venue, isLoading, error } = useVenueDetail(venueId, language);
  const respectMutation = useRespect();
  const qrTapMutation = useQrTap();

  useEffect(() => {
    return () => stopAudioTranscript();
  }, []);

  const handlePlayAudio = () => {
    if (isPlaying) {
      stopAudioTranscript();
      setIsPlaying(false);
      return;
    }

    if (!venue?.hasAudio) {
      toast({ title: "Audio unavailable", description: "No audio guide for this venue." });
      return;
    }

    setIsPlaying(true);
    const audioUrl = getAudioUrl(venueId, language);
    const audio = playAudioFromUrl(audioUrl, () => setIsPlaying(false));

    // Handle lỗi stream
    if (audio) {
      audio.addEventListener("error", () => {
        setIsPlaying(false);
        toast({ title: "Audio error", description: "Could not load audio guide." });
      });
    }
  };

  const handleRespect = () => {
    if (respected) return;
    respectMutation.mutate(venueId, {
      onSuccess: (data) => {
        setRespected(true);
        toast({ title: `❤️ Saved!`, description: `${data.respectCount} people love this place.` });
      },
    });
  };

  const handleQrTap = () => {
    qrTapMutation.mutate(venueId);
    setShowQr(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Venue not found</h2>
        <p className="text-muted-foreground mb-6">We couldn't load the details for this location.</p>
        <Link href="/map" className="px-6 py-3 bg-primary text-white rounded-xl font-medium">
          Back to Map
        </Link>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", { weekday: "short" });
  const todaysHours = venue.hours?.[today] || "Check with restaurant";
  const tabs = [
    { id: "about", label: "About" },
    { id: "menu", label: "Menu" },
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Hero */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        <img
          src={venue.imageUrl || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&q=80"}
          alt={venue.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

        <div className="absolute top-4 left-4 z-10">
          <Link href="/map">
            <button className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors border border-white/20">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-5 sm:p-8 text-white">
          <span className="inline-block px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-xs font-bold tracking-wider uppercase mb-3">
            {venue.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">{venue.name}</h1>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{venue.rating}</span>
              <span className="text-white/70">({venue.reviewCount} reviews)</span>
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full font-medium">
              {venue.priceRange}
            </span>
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium ${
              venue.isOpen ? "bg-green-500/80" : "bg-red-500/80"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${venue.isOpen ? "bg-green-200" : "bg-red-200"}`} />
              {venue.isOpen ? "Open Now" : "Closed"}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-5 relative z-10 mb-6 flex gap-3">
        {/* Audio guide */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handlePlayAudio}
          className={`flex-1 py-3.5 px-6 rounded-2xl flex items-center justify-center gap-3 font-semibold text-base shadow-lg transition-all duration-300 ${
            isPlaying
              ? "bg-white border-2 border-primary text-primary"
              : "bg-gradient-to-r from-primary to-orange-500 text-white"
          }`}
        >
          <Volume2 className={`w-5 h-5 ${isPlaying ? "animate-bounce" : ""}`} />
          {isPlaying ? "Playing..." : "🎙 Audio Guide"}
        </motion.button>

        {/* Respect */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRespect}
          disabled={respected}
          className={`py-3.5 px-4 rounded-2xl flex items-center gap-2 font-semibold shadow-lg transition-all ${
            respected
              ? "bg-red-100 text-red-500 border-2 border-red-300"
              : "bg-white border-2 border-border text-foreground hover:border-red-300"
          }`}
        >
          <Heart className={`w-5 h-5 ${respected ? "fill-red-500 text-red-500" : ""}`} />
          <span className="text-sm">{venue.respectCount || 0}</span>
        </motion.button>

        {/* QR Payment */}
        {venue.qrImageUrl && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleQrTap}
            className="py-3.5 px-4 rounded-2xl bg-white border-2 border-border flex items-center gap-2 font-semibold shadow-lg hover:border-primary transition-all"
          >
            <QrCode className="w-5 h-5 text-primary" />
            <span className="text-sm">Pay</span>
          </motion.button>
        )}
      </div>

      {/* QR Modal */}
      {showQr && venue.qrImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setShowQr(false)}
        >
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full mx-4 text-center shadow-2xl">
            <h3 className="font-bold text-lg mb-4">Scan to Pay</h3>
            <img src={venue.qrImageUrl} alt="QR Code" className="w-full rounded-2xl" />
            <p className="text-xs text-muted-foreground mt-4">Tap anywhere to close</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Tabs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-1 flex gap-1 shadow-sm border border-border/40">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* About */}
            {activeTab === "about" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-border/40">
                  <h2 className="text-lg font-bold mb-3 text-foreground">About this place</h2>
                  <p className="text-muted-foreground leading-relaxed">{venue.description}</p>
                  {venue.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/40">
                      {venue.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {venue.gallery?.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-border/40">
                    <h2 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
                      <Images className="w-5 h-5 text-primary" /> Gallery
                    </h2>
                    <div className="grid grid-cols-2 gap-2">
                      {venue.gallery.slice(0, 4).map((img, i) => (
                        <div key={i} className={`rounded-xl overflow-hidden ${i === 0 ? "col-span-2 aspect-[16/7]" : "aspect-square"}`}>
                          <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Menu */}
            {activeTab === "menu" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {venue.menu?.length > 0 ? (
                  <div className="space-y-3">
                    {venue.menu.map((item) => (
                      <div key={item.id} className="bg-white rounded-2xl p-4 border border-border/40 flex gap-4 hover:shadow-md transition-shadow">
                        {item.imageUrl && (
                          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-foreground pr-2">{item.name}</h4>
                            <span className="font-bold text-primary shrink-0 text-sm">
                              {item.price.toLocaleString()}đ
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-8 text-center text-muted-foreground border border-border/40">
                    No menu available
                  </div>
                )}
              </motion.div>
            )}

            {/* Reviews */}
            {activeTab === "reviews" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {venue.reviews?.length > 0 ? (
                  <div className="space-y-3">
                    {venue.reviews.map((review) => (
                      <div key={review.id} className="bg-white rounded-2xl p-5 border border-border/40">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                              {review.author.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-foreground">{review.author}</span>
                              <div className="flex gap-0.5 mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-8 text-center text-muted-foreground border border-border/40">
                    No reviews yet
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right: Info card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-border/40 space-y-4">
              <h3 className="font-bold text-foreground">Info</h3>
              <div className="space-y-3 text-sm">
                {venue.address && (
                  <div className="flex gap-3">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{venue.address}</span>
                  </div>
                )}
                <div className="flex gap-3">
                  <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Today: {todaysHours}</span>
                </div>
                {venue.phone && (
                  <div className="flex gap-3">
                    <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <a href={`tel:${venue.phone}`} className="text-primary hover:underline">{venue.phone}</a>
                  </div>
                )}
                {venue.website && (
                  <div className="flex gap-3">
                    <Globe className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <a href={venue.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                      Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Audio languages */}
            {venue.audioLanguages?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-border/40">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-primary" /> Audio Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {venue.audioLanguages.map((lang) => (
                    <span key={lang} className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold uppercase">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ChatBox />
    </div>
  );
}
import React, { useState, useEffect } from "react";
import MapSection from "../components/MapSection";
import ChatBubble from "../components/ChatBubble";
import ChatWidget from "../components/ChatWidget";
import requestAssistantReply from "../services/chatService";
import "../styles/home.css";

const API_BASE_URL = "http://localhost:3000";

const Home = ({ language, onReset }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Xin chào! 👋", sender: "bot" },
    { id: 2, text: "Tôi có thể giúp bạn tìm quán ăn tốt nhất", sender: "bot" },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [location, setLocation] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  // Lấy vị trí GPS của người dùng
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      });
    }
  }, []);

  const appendChatMessage = (sender, text) => {
    setMessages((prev) => [...prev, { id: prev.length + 1, text, sender }]);
  };

  const replaceTypingIndicator = (text) => {
    setMessages((prev) => {
      const filtered = prev.filter((msg) => msg.text !== "Đang xử lý...");
      return [...filtered, { id: filtered.length + 1, text, sender: "bot" }];
    });
  };

  const playReplyAudio = async (speechText, speechLanguage) => {
    if (!speechText) {
      console.log("Không có audio để phát");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/tts-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: speechText, lang: speechLanguage }),
      });

      if (!response.ok) {
        throw new Error(`TTS stream failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.volume = 0.8;
      audio.onended = () => URL.revokeObjectURL(audioUrl);

      audio.play().catch((err) => {
        URL.revokeObjectURL(audioUrl);
        console.error("Lỗi phát audio:", err);
      });
    } catch (error) {
      console.error("Lỗi stream audio:", error);
    }
  };

  const handleSendMessage = async () => {
    const userMessage = inputMessage.trim();
    if (!userMessage) {
      return;
    }

    appendChatMessage("user", userMessage);
    setInputMessage("");
    appendChatMessage("bot", "Đang xử lý...");

    const reply = await requestAssistantReply(userMessage, language);
    const botText = reply?.answer || "Xin lỗi, tôi chưa có phản hồi phù hợp.";

    replaceTypingIndicator(botText);
    await playReplyAudio(reply?.speechText, reply?.language || language);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="home-container">
      {/* Bản đồ */}
      <MapSection location={location} onReset={onReset} restaurants={restaurants} />

      {/* Chat Bubble - Floating Widget */}
      {!isChatOpen && <ChatBubble onClick={() => setIsChatOpen(true)} />}

      {/* Chat Widget Modal */}
      {isChatOpen && (
        <ChatWidget
          messages={messages}
          inputMessage={inputMessage}
          onInputChange={(e) => setInputMessage(e.target.value)}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;

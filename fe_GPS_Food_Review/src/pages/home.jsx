import React, { useState, useEffect } from "react";
import MapSection from "../components/MapSection";
import ChatBubble from "../components/ChatBubble";
import ChatWidget from "../components/ChatWidget";
import sendMessageToGemini from "../services/chatService";
import "../styles/home.css";

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

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const userMsg = inputMessage;

      // Thêm tin nhắn của người dùng
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, text: userMsg, sender: "user" },
      ]);

      setInputMessage("");

      // Thêm "đang gõ..." indicator
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, text: "Đang xử lý...", sender: "bot" },
      ]);

      // Gọi API Gemini từ backend
      const reply = await sendMessageToGemini(userMsg);

      // Xóa "đang gõ..." và thêm reply thực tế
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.text !== "Đang xử lý...");
        return [
          ...filtered,
          { id: filtered.length + 1, text: reply, sender: "bot" },
        ];
      });
    }
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

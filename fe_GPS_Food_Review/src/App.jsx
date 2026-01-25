// src/App.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [vendors, setVendors] = useState([]); // Danh sách quán ăn
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  // 1. Lấy vị trí GPS của người dùng
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
    // Lấy dữ liệu quán ăn từ Express Backend
    axios
      .get("http://localhost:3000/api/vendors")
      .then((res) => setVendors(res.data));
  }, []);

  // 2. Gửi câu hỏi cho Chatbot AI
  const askAI = async () => {
    setAiResponse("Đang suy nghĩ...");
    try {
      const res = await axios.post("http://localhost:3000/api/ask-gemini", {
        question,
      });
      setAiResponse(res.data.answer);
    } catch (err) {
      setAiResponse("Lỗi kết nối AI.");
    }
  };

  return (
    <div className="mobile-app">
      <header>📍 Tuyến Phố Ẩm Thực AI</header>

      {/* Hiển thị tọa độ hiện tại (Tương đương tính năng Live Location)  */}
      <div className="status">
        Vị trí của bạn:{" "}
        {location.lat
          ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
          : "Đang xác vị..."}
      </div>

      {/* Danh sách các quán ăn (POI) [cite: 34, 45] */}
      <div className="vendor-list">
        <h3>Quán ăn gần đây</h3>
        {vendors.map((v) => (
          <div key={v.id} className="vendor-card">
            <h4>{v.name}</h4>
            <p>
              {v.dish} - {v.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Chatbot AI [cite: 9, 37] */}
      <div className="ai-section">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Hỏi về món ăn, quán xá..."
        />
        <button onClick={askAI}>Hỏi Trợ Lý</button>
        <div className="response">{aiResponse}</div>
      </div>
    </div>
  );
};

export default App;

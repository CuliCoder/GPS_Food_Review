import React, { useEffect, useRef } from "react";

const ChatWidget = ({
  messages,
  inputMessage,
  onInputChange,
  onSendMessage,
  onKeyPress,
  onClose,
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-widget-modal">
      <div className="chat-container">
        <div className="chat-header">
          <h2>💬 Trợ Lý AI</h2>
          <button
            className="btn-close"
            onClick={onClose}
            aria-label="Đóng chat"
          ></button>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className="message-content">{msg.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input form-control"
            placeholder="Nhập câu hỏi..."
            value={inputMessage}
            onChange={onInputChange}
            onKeyPress={onKeyPress}
            aria-label="Nhập tin nhắn"
          />
          <button
            className="send-btn"
            onClick={onSendMessage}
            aria-label="Gửi tin nhắn"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;

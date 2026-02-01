import React from "react";

const ChatBubble = ({ onClick }) => {
  return (
    <button
      className="chat-bubble"
      onClick={onClick}
      title="Mở chat"
      aria-label="Mở trợ lý chat"
    >
      💬
    </button>
  );
};

export default ChatBubble;

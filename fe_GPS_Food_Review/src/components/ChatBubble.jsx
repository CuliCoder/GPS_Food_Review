const ChatBubble = ({ onClick }) => {
  return (
    <button
      className="chat-bubble"
      onClick={onClick}
      title="Open chat"
      aria-label="Open assistant chat"
    >
      AI
    </button>
  );
};

export default ChatBubble;

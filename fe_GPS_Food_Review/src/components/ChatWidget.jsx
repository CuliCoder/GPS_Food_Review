import { useEffect, useRef } from "react";

const ChatWidget = ({ messages, inputMessage, onInputChange, onSend, onClose, loading }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section className="chat-widget" aria-label="AI assistant chat">
      <header className="chat-header">
        <h3>AI Food Assistant</h3>
        <button type="button" onClick={onClose} className="close-chat" aria-label="Close chat">
          x
        </button>
      </header>

      <div className="chat-thread">
        {messages.map((message) => (
          <article key={message.id} className={`chat-item ${message.sender}`}>
            {message.text}
          </article>
        ))}
        <div ref={endRef} />
      </div>

      <form
        className="chat-input-row"
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
      >
        <input
          type="text"
          placeholder="Ask about nearby food..."
          value={inputMessage}
          onChange={onInputChange}
          aria-label="Chat input"
        />
        <button type="submit" disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </form>
    </section>
  );
};

export default ChatWidget;

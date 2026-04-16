import { useState, useRef, useEffect } from "react";
import { useSendChat } from "@/lib/api";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/store/use-app-store";

export function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "ai",
      text: "Hello! I'm your Smart Food Tour guide. Ask me anything about local food, or pick a quick option below!",
    },
  ]);
  const [input, setInput] = useState("");
  const { language, gpsPosition } = useAppStore();
  const messagesEndRef = useRef(null);
  const chatMutation = useSendChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (text) => {
    if (!text.trim()) return;
    const newMsg = { id: Date.now().toString(), role: "user", text };
    const history = [...messages, newMsg].slice(-8).map((msg) => ({
      role: msg.role === "ai" ? "assistant" : msg.role,
      content: msg.text,
    }));

    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    const [userLat, userLng] = Array.isArray(gpsPosition)
      ? [gpsPosition[0], gpsPosition[1]]
      : [undefined, undefined];

    chatMutation.mutate(
      {
        message: text,
        lang: language,
        userLat,
        userLng,
        history,
      },
      {
        onSuccess: (data) => {
          const nextMessages = [
            { id: Date.now().toString(), role: "ai", text: data.reply || "" },
          ];

          if (data.suggestedVenues?.length > 0) {
            const venueText = data.suggestedVenues.map((v) => `• ${v.name}`).join("\n");
            nextMessages.push({
              id: (Date.now() + 1).toString(),
              role: "ai",
              text: `📍 Gợi ý:\n${venueText}`,
            });
          }

          setMessages((prev) => [...prev, ...nextMessages]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "ai",
              text: "Sorry, I'm having trouble connecting right now. Let's try again!",
            },
          ]);
        },
      }
    );
  };

  const quickReplies = [
    "Nearest restaurant",
    "Vegetarian options",
    "Open now",
    "Budget-friendly",
  ];

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 sm:bottom-6 sm:right-6 w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-tr from-primary to-orange-400 text-white rounded-full shadow-xl shadow-primary/30 flex items-center justify-center z-[1000]"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed left-2 right-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] h-[72vh] max-h-[520px] sm:left-auto sm:right-6 sm:bottom-6 sm:w-[90vw] sm:max-w-[360px] sm:h-[550px] sm:max-h-[80vh] bg-background border border-border rounded-2xl shadow-2xl z-[1000] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 text-primary-foreground flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 opacity-90" />
                <h3 className="font-semibold">Foodie AI Guide</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-white border border-border text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-border">
              <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar -mx-1 px-1">
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(reply)}
                    disabled={chatMutation.isPending}
                    className="whitespace-nowrap px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-full hover:bg-secondary/80 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                  placeholder="Ask for recommendations..."
                  disabled={chatMutation.isPending}
                  className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || chatMutation.isPending}
                  className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
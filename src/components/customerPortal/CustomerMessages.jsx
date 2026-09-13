/**
 * Customer Messages — Module 11
 * Renders the customer-facing portal messaging box with travel operators.
 * Implements optimistic UI updates and blocks XSS. Hides internal staff notes.
 */
import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, RefreshCw } from "lucide-react";
import { sendPortalMessage } from "../../services/customerPortal/customerPortalMessageService";

export default function CustomerMessages({ bookingId, initialMessages = [], onMutation }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [failedMessage, setFailedMessage] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e, retryText = null) => {
    e?.preventDefault();
    const textToSend = retryText || input.trim();
    if (!textToSend || submitting) return;

    if (!retryText) setInput("");
    setFailedMessage(null);

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      text: textToSend,
      sender: "customer",
      senderName: "You",
      timestamp: new Date().toISOString(),
      sending: true
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setSubmitting(true);

    try {
      const response = await sendPortalMessage(bookingId, textToSend);
      if (response.success) {
        // Replace optimistic message with actual verified message
        setMessages(prev => prev.map(m => m.id === tempId ? response.message : m));
        onMutation?.();
      } else {
        throw new Error("Send failed");
      }
    } catch (_err) {
      // Remove optimistic message and set fail states
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setFailedMessage(textToSend);
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[480px]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 shrink-0">
        <h2 className="text-slate-200 font-semibold text-sm">Message Operations Team</h2>
        <p className="text-slate-500 text-[10px] uppercase tracking-wider mt-0.5">Direct chat channel</p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-slate-950/20">
        {messages.length === 0 && (
          <p className="text-slate-500 text-xs text-center py-12">
            No messages sent yet. Ask our operations team about stays, travel permits, or pricing adjustments.
          </p>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2.5 max-w-[85%] ${msg.sender === "customer" ? "ml-auto flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
              msg.sender === "customer" ? "bg-slate-800 border-slate-700" : "bg-indigo-950 border-indigo-900/40"
            }`}>
              {msg.sender === "customer" ? <User className="w-3.5 h-3.5 text-slate-300" /> : <Bot className="w-3.5 h-3.5 text-indigo-400" />}
            </div>
            <div className="space-y-1">
              <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                msg.sender === "customer" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-200"
              }`}>
                {msg.text}
              </div>
              <span className={`text-[9px] text-slate-500 block ${msg.sender === "customer" ? "text-right" : "text-left"}`}>
                {new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                {msg.sending && " (sending...)"}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Failed send warning */}
      {failedMessage && (
        <div className="bg-red-950/30 border-t border-red-900/30 px-4 py-2 flex items-center justify-between text-xs text-red-300 shrink-0">
          <span>Message could not be sent.</span>
          <button
            onClick={() => handleSend(null, failedMessage)}
            className="flex items-center gap-1 text-red-400 hover:text-red-300 underline font-semibold"
          >
            <RefreshCw className="w-3 h-3" /> Retry Send
          </button>
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={submitting}
          placeholder="Type message to operations team..."
          className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || submitting}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

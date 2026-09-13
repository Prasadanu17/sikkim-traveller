import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Clock, AlertCircle } from "lucide-react";
import { sendCustomerMessage } from "../../services/customer/customerCommunicationService";

export default function CustomerMessages({ booking, onMessageSent }) {
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const messages = booking?.customerMessages || [];
  const customerName = booking?.customer?.firstName || "You";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;

    setError("");
    setSending(true);
    try {
      const result = await sendCustomerMessage(booking.trackingToken, clean, customerName);
      setInputText("");
      onMessageSent?.(result.booking);
    } catch (err) {
      setError(err.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleQuickQuestion = (q) => {
    setInputText(q);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl space-y-6 text-slate-100 flex flex-col h-[580px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Operations Concierge Messages</span>
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-white mt-0.5">
            Direct Operations Desk Chat
          </h2>
        </div>
        <span className="text-[11px] text-emerald-400 flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Desk Active</span>
        </span>
      </div>

      {/* Message Timeline */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-700" />
            <p className="text-xs text-slate-400 max-w-xs">
              No messages yet. Send a message to connect directly with your Sikkim travel architect.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCustomer = msg.sender === "customer";

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isCustomer ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                    isCustomer
                      ? "bg-amber-500 text-slate-950"
                      : "bg-slate-800 border border-slate-700 text-amber-400"
                  }`}
                >
                  {isCustomer ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`space-y-1 max-w-[80%] ${isCustomer ? "items-end text-right" : "items-start text-left"}`}>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 px-1">
                    <span className="font-semibold text-slate-400">{msg.senderName}</span>
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isCustomer
                        ? "bg-amber-500 text-slate-950 rounded-tr-none font-medium"
                        : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Question Chips */}
      <div className="shrink-0 pt-2 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          <button
            type="button"
            onClick={() => handleQuickQuestion("What time will the airport chauffeur pick us up?")}
            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors shrink-0 cursor-pointer"
          >
            Airport pickup time?
          </button>
          <button
            type="button"
            onClick={() => handleQuickQuestion("Can we add an extra night in Lachung?")}
            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors shrink-0 cursor-pointer"
          >
            Extra night in Lachung?
          </button>
          <button
            type="button"
            onClick={() => handleQuickQuestion("Are warm jackets required for Yumthang Valley?")}
            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors shrink-0 cursor-pointer"
          >
            Clothing advice?
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input bar */}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a question for the Sikkim travel operations desk..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
            maxLength={1500}
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

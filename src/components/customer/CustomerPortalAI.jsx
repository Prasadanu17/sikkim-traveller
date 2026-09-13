/**
 * Customer Portal AI Concierge Component — Module 8 & 18
 * Scoped read-only travel intelligence assistant for customers.
 * Displays "AI Generated / Proposed" badges on AI responses.
 * Provides direct action shortcuts to Change Request Hub for operational mutations.
 */

import { useState, useRef, useEffect } from "react";
import { Bot, Sparkles, Send, User, ShieldCheck, ArrowRight } from "lucide-react";
import { answerCustomerQuery } from "../../services/customer/customerPortalToolExecutor";

const SUGGESTED_QUERIES = [
  "What is my booking status?",
  "Are my permits approved?",
  "What is included in the proposal?",
  "What is my day-by-day itinerary?",
  "What should I prepare before my trip?",
  "Are there any weather or road alerts?",
  "How much do I still need to pay?",
  "Change my hotel or travel dates"
];

export default function CustomerPortalAI({ booking, onOpenChangeRequests }) {
  const [messages, setMessages] = useState([
    {
      id: "INIT",
      sender: "ai",
      text: `Namaste ${booking?.customer?.firstName || "Traveler"}! I am your **Sikkim Travel AI Concierge**. I can answer any questions about your itinerary, inclusions, travel status, permits, or weather conditions. How may I assist you today?`
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, loading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery;
    const clean = textToSend.trim();
    if (!clean || loading) return;

    const userMsg = { id: `U-${Date.now()}`, sender: "user", text: clean };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);

    // Check if query is an operational modification request
    const lower = clean.toLowerCase();
    if (lower.includes("change hotel") || lower.includes("modify date") || lower.includes("cancel") || lower.includes("change my")) {
      setTimeout(() => {
        const aiMsg = {
          id: `AI-${Date.now()}`,
          sender: "ai",
          text: "I can help you understand your trip, but operational changes (hotels, dates, vehicles) require Travel Operations review. I can open a formal Change Request for you now.",
          isMutationRequest: true
        };
        setMessages((prev) => [...prev, aiMsg]);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const answer = await answerCustomerQuery(clean, booking);
      const aiMsg = { id: `AI-${Date.now()}`, sender: "ai", text: answer };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.warn("[CustomerPortalAI] Query execution error:", err);
      const errorMsg = {
        id: `ERR-${Date.now()}`,
        sender: "ai",
        text: "I am unable to answer this inquiry right now. Please try again or check your trip workspace."
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl space-y-5 text-slate-100 flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white">
              Sikkim Travel AI Concierge
            </h2>
            <p className="text-[11px] text-slate-400">Read-Only Trip Intelligence Assistant</p>
          </div>
        </div>

        <span className="text-[10px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 flex items-center gap-1 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>AI Generated / Proposed</span>
        </span>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent text-xs leading-relaxed">
        {messages.map((m) => {
          const isUser = m.sender === "user";

          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? "bg-amber-500 text-slate-950"
                    : "bg-slate-800 border border-slate-700 text-amber-400"
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div className="space-y-2 max-w-[85%]">
                <div
                  className={`p-3.5 rounded-2xl whitespace-pre-line ${
                    isUser
                      ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none"
                      : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm"
                  }`}
                >
                  {m.text}
                </div>

                {m.isMutationRequest && onOpenChangeRequests && (
                  <button
                    onClick={onOpenChangeRequests}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <span>Create Change Request</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl rounded-tl-none text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce delay-200" />
              <span className="text-[11px] ml-1">Analyzing trip context...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested chips & input */}
      <div className="shrink-0 pt-2 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-300 transition-colors shrink-0 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about itinerary, costs, permits, or weather..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

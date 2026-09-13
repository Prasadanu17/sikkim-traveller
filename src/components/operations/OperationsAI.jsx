/**
 * Operations AI — Module 10
 * Read-only AI Assistant Chat UI for staff/operators.
 * Dispatches natural language queries to the operations tool executor.
 */
import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, ShieldAlert, ArrowRight } from "lucide-react";
import { executeTool } from "../../services/operations/operationsToolExecutor";

export default function OperationsAI({ bookings = [], currentUser }) {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: `Hello ${currentUser?.name || "Operator"}. I am your AI Operations Assistant. How can I help you manage trips today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || processing) return;

    const userText = input.trim();
    setInput("");
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date()
    }]);

    setProcessing(true);

    // Simulate short network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const response = await processNaturalLanguageQuery(userText);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `ai-err-${Date.now()}`,
        sender: "ai",
        text: `Error processing query: ${err.message}`,
        timestamp: new Date()
      }]);
    }

    setProcessing(false);
  };

  // Helper to convert natural language queries into tool execution
  const processNaturalLanguageQuery = async (queryText) => {
    const text = queryText.toLowerCase();
    let toolName = "getDashboardStats";
    let params = {};
    let matchedQuery = "dashboard overview";

    if (text.includes("permit") || text.includes("document") || text.includes("restricted")) {
      toolName = "getPermitIssues";
      matchedQuery = "unresolved permit issues";
    } else if (text.includes("unassigned") || text.includes("assign") || text.includes("no operator")) {
      toolName = "getUnassignedBookings";
      matchedQuery = "unassigned booking requests";
    } else if (text.includes("urgent") || text.includes("attention") || text.includes("high priority")) {
      toolName = "getUrgentBookings";
      matchedQuery = "urgent and high priority bookings";
    } else if (text.includes("alert") || text.includes("warning") || text.includes("advisory")) {
      toolName = "getRealtimeAlerts";
      matchedQuery = "realtime travel alerts";
    } else if (text.includes("upcoming") || text.includes("starting") || text.includes("weekend")) {
      toolName = "getUpcomingTrips";
      params = { days: text.includes("90") ? 90 : text.includes("30") ? 30 : 7 };
      matchedQuery = `upcoming trips in the next ${params.days} days`;
    } else if (text.includes("summarize") || text.includes("summary") || text.includes("details for")) {
      toolName = "summarizeBooking";
      // Extract Request ID regex pattern (e.g. ST-REQ-20260819-1042)
      const match = queryText.match(/ST-REQ-\d{8}-\d{4}/i);
      if (match) {
        params = { requestId: match[0].toUpperCase() };
        matchedQuery = `summary of booking ${params.requestId}`;
      } else {
        return {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: "Please specify a valid Request ID (e.g. ST-REQ-20260819-1042) to summarize.",
          timestamp: new Date()
        };
      }
    } else if (text.includes("lachung") || text.includes("lachen") || text.includes("north") || text.includes("pelling") || text.includes("gangtok")) {
      toolName = "getBookingsByDestination";
      // Simple keyword extract
      const dest = text.includes("lachung") ? "lachung" : text.includes("lachen") ? "lachen" : text.includes("north") ? "north-sikkim" : text.includes("pelling") ? "pelling" : "gangtok";
      params = { destination: dest };
      matchedQuery = `bookings containing destination: ${dest}`;
    } else if (text.includes("search") || text.includes("find")) {
      toolName = "searchBookings";
      // Extract queries
      params = { query: queryText.replace(/search|find/gi, "").trim() };
      matchedQuery = `search results for "${params.query}"`;
    }

    // Safe execution via approved registry tool executor
    const response = await executeTool(toolName, params, bookings);

    if (!response.success) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `Error executing query tool: ${response.error}`,
        timestamp: new Date()
      };
    }

    // Format tool results as user-friendly UI cards
    return formatToolResponse(toolName, matchedQuery, response.result);
  };

  const formatToolResponse = (toolName, matchedQuery, result) => {
    const timestamp = new Date();
    const id = `ai-${Date.now()}`;

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return {
        id,
        sender: "ai",
        text: `I executed the approved query for **${matchedQuery}**, but found no matching records in the system.`,
        timestamp
      };
    }

    if (toolName === "getDashboardStats") {
      return {
        id,
        sender: "ai",
        text: `Here is the current operational snapshot:\n\n` +
          `• **New Requests**: ${result.newRequests}\n` +
          `• **Under Review**: ${result.underReview}\n` +
          `• **Awaiting Customer**: ${result.awaitingCustomer}\n` +
          `• **Trips Starting This Week**: ${result.upcomingThisWeek}\n` +
          `• **Urgent Alerts**: ${result.urgentAlerts}\n\n` +
          `All statistics are derived from live, verified operations logs.`,
        timestamp
      };
    }

    if (toolName === "summarizeBooking") {
      if (result.found === false) {
        return {
          id,
          sender: "ai",
          text: `I could not find a booking request with ID **${result.requestId}**.`,
          timestamp
        };
      }
      return {
        id,
        sender: "ai",
        text: `### Booking Summary: ${result.requestId}\n\n` +
          `• **Customer**: ${result.customer}\n` +
          `• **Status**: \`${result.status}\`\n` +
          `• **Priority**: \`${result.priority}\`\n` +
          `• **Route**: ${result.trip}\n` +
          `• **Starts**: ${result.startDate || "Flexible"}\n` +
          `• **Assigned Operator**: ${result.assignedTo}\n` +
          `• **Permits Needed**: ${result.requiresPermit ? "Yes" : "No"}\n` +
          `• **Hotel Verification**: \`${result.accommodationStatus}\`\n` +
          `• **Vehicle Verification**: \`${result.transportStatus}\`\n` +
          `• **Customer Approval**: ${result.customerAccepted ? "✓ Approved" : "Pending"}\n\n` +
          `*Note: AI cannot execute write actions (such as status updates or permit approvals) independently. All changes must be made via the dashboard by an authorized operator.*`,
        timestamp,
        bookingId: result.requestId
      };
    }

    if (Array.isArray(result)) {
      const itemsList = result.map(item => {
        const start = item.startDate ? new Date(item.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Flexible";
        return `• **${item.requestId}** — ${item.customerName || "Traveler"} (${item.duration} days, starting ${start}). Status: \`${item.status}\``;
      }).join("\n");

      return {
        id,
        sender: "ai",
        text: `I found ${result.length} record(s) matching **${matchedQuery}**:\n\n${itemsList}`,
        timestamp,
        list: result.map(item => ({ id: item.requestId, label: item.requestId }))
      };
    }

    return {
      id,
      sender: "ai",
      text: `Executed approved tool query for **${matchedQuery}** successfully.`,
      timestamp
    };
  };

  const SUGGESTED_QUERIES = [
    "Which bookings need attention today?",
    "Which trips have permit issues?",
    "Show upcoming North Sikkim trips.",
    "Which bookings are awaiting customers?",
    "Show operational stats summary."
  ];

  return (
    <div className="p-6 h-[calc(100vh-2.5rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" /> ✨ AI Operations Assistant
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Read-only tool registry verification active. Write operations blocked.</p>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 min-h-0 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.sender === "user" ? "bg-slate-800 border-slate-700" : "bg-indigo-950/60 border-indigo-800/40"}`}>
                {msg.sender === "user" ? <User className="w-4 h-4 text-slate-300" /> : <Bot className="w-4 h-4 text-indigo-400" />}
              </div>
              <div className="space-y-2">
                <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.sender === "user" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-200"
                }`}>
                  <div className="markdown-content whitespace-pre-line">
                    {msg.text}
                  </div>
                </div>

                {/* Interactive list suggestions for returned results */}
                {msg.list && (
                  <div className="flex gap-2 flex-wrap">
                    {msg.list.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setInput(`Summarize ${item.id}`);
                        }}
                        className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                      >
                        Inspect {item.label} <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {processing && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-950/60 border border-indigo-800/40 shrink-0">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="bg-slate-800 text-slate-400 rounded-2xl px-4 py-3 text-sm animate-pulse">
                Querying verified tools...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion tags */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/40 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider shrink-0">Suggestions:</span>
          {SUGGESTED_QUERIES.map(q => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="text-[11px] bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-full px-3 py-1 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={processing}
            placeholder="Ask AI about bookings, permit status, upcoming trips..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || processing}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Safety Notice */}
      <div className="shrink-0 bg-amber-950/20 border border-amber-900/30 rounded-xl p-3 flex gap-2 text-xs text-amber-500">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          <strong>Safety Policy Guard:</strong> Operations Assistant is read-only. AI can search, filter, and summarize, but has no mutation rights. Staff assignment, status updates, pricing changes, and permit status approvals require explicit human actions and permission validation.
        </p>
      </div>
    </div>
  );
}

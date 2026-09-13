/**
 * Operations Communication Panel Component — Module 13
 * Operations staff view for customer communication history, manual message drafting,
 * and Module 8 Copilot AI draft assistance.
 * 
 * STRICT SECURITY GUARDRAIL:
 * AI-generated drafts are tagged with `_isAIDraft: true`.
 * AI CANNOT send messages automatically; staff must explicitly click SEND.
 */

import { useState } from "react";
import { Send, Sparkles, History, MessageSquare, Mail, AlertTriangle, ShieldCheck } from "lucide-react";
import { dispatchNotificationEvent } from "../../services/notifications/notificationOrchestrator";
import { generateAIDraftMessage, summarizeCommunicationHistory } from "../../services/notifications/notificationAIComposer";
import { NOTIFICATION_CHANNELS, NOTIFICATION_EVENTS } from "../../services/notifications/notificationContextService";
import { getNotificationQueue } from "../../services/notifications/notificationQueueService";
import NotificationCard from "./NotificationCard";

export default function OperationsCommunicationPanel({ booking, currentUser, onMutation }) {
  const [channel, setChannel] = useState(NOTIFICATION_CHANNELS.WHATSAPP);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAIDraft, setIsAIDraft] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendNotice, setSendNotice] = useState(null);

  const reqId = booking?.requestId || "GENERAL";
  const customer = booking?.customer || { name: "Rahul Sharma", email: "rahul@example.com", phone: "+91 98765 43210" };

  const allQueue = getNotificationQueue();
  const customerHistory = allQueue.filter(n => n.requestId === reqId || n.recipient?.email === customer.email);

  const handleGenerateAIDraft = async () => {
    if (!aiPrompt.trim()) return;
    setGeneratingAI(true);
    try {
      const draft = await generateAIDraftMessage({
        requestId: reqId,
        customerName: customer.name,
        eventType: NOTIFICATION_EVENTS.MANUAL_MESSAGE,
        channel,
        instructions: aiPrompt,
        bookingContext: booking
      });

      setSubject(draft.subject);
      setBody(draft.body);
      setIsAIDraft(true);
      setAiPrompt("");
    } catch (_err) {
      console.warn("AI draft generation failed");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSendNotification = async () => {
    if (!body.trim()) return;
    setSending(true);

    const result = await dispatchNotificationEvent({
      eventType: NOTIFICATION_EVENTS.MANUAL_MESSAGE,
      requestId: reqId,
      customerId: booking?.customerId || "CUST-GUEST",
      recipient: customer,
      channel,
      customSubject: subject || `Update regarding request ${reqId}`,
      customBody: body,
      source: `OPERATIONS (${currentUser?.name || currentUser?.role || "Staff"})`,
      isAIDraft
    });

    setSending(false);
    if (result.success) {
      setSubject("");
      setBody("");
      setIsAIDraft(false);
      setSendNotice({ type: "success", text: `Message dispatched via ${channel} (${result.notification.providerRef || "Mock"})` });
      onMutation?.();
    } else {
      setSendNotice({ type: "error", text: result.error || "Message delivery failed." });
    }

    setTimeout(() => setSendNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Communication Summary Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Customer Communication History</h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
            {customerHistory.length} Record(s)
          </span>
        </div>
        <p className="text-slate-400 text-xs">{summarizeCommunicationHistory(customerHistory)}</p>
      </div>

      {/* Manual Dispatch & AI Composer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composer Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-400" /> Compose Message to Customer
            </h3>

            {isAIDraft && (
              <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-mono">
                ✨ AI Draft Prepared
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Target Channel</label>
              <div className="flex gap-2">
                {[NOTIFICATION_CHANNELS.WHATSAPP, NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.IN_APP, NOTIFICATION_CHANNELS.SMS].map(ch => (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      channel === ch
                        ? "bg-indigo-600 border-indigo-500 text-white font-medium"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Subject / Header</label>
              <input
                type="text"
                value={subject}
                onChange={e => { setSubject(e.target.value); setIsAIDraft(false); }}
                placeholder="e.g. Update regarding your Lachung itinerary"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Message Body</label>
              <textarea
                value={body}
                onChange={e => { setBody(e.target.value); setIsAIDraft(false); }}
                placeholder="Type your message to the customer..."
                rows={4}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* AI Safety Banner */}
            {isAIDraft && (
              <div className="bg-purple-950/40 border border-purple-800/40 rounded-xl p-3 flex items-start gap-2 text-xs text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p>
                  <strong>AI Guardrail Active:</strong> This message was drafted by Copilot. Staff verification is required before sending.
                </p>
              </div>
            )}

            {sendNotice && (
              <div className={`p-3 rounded-xl border text-xs ${sendNotice.type === "success" ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-300" : "bg-rose-950/40 border-rose-800/40 text-rose-300"}`}>
                {sendNotice.text}
              </div>
            )}

            <button
              onClick={handleSendNotification}
              disabled={sending || !body.trim()}
              className="w-full text-xs font-semibold px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-indigo-900/30 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" /> {sending ? "Dispatching..." : `Send via ${channel}`}
            </button>
          </div>
        </div>

        {/* AI Copilot Draft Assistant */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">AI Copilot Draft Assistant</h3>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed">
            Instruct Copilot to draft a context-aware message (e.g. proposal updates, weather advisories, or permit reminders).
          </p>

          <div className="space-y-3">
            <textarea
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="e.g. Draft a friendly WhatsApp telling the customer their proposal is ready and valid for 7 days."
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
            />

            <button
              onClick={handleGenerateAIDraft}
              disabled={generatingAI || !aiPrompt.trim()}
              className="w-full text-xs font-semibold px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" /> {generatingAI ? "Copilot Drafting..." : "Generate AI Draft"}
            </button>
          </div>

          {/* Quick AI Presets */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Quick Assistant Prompts</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setAiPrompt("Draft a proposal ready review reminder for customer.")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                + Proposal Ready
              </button>
              <button
                onClick={() => setAiPrompt("Draft a weather alert for Yumthang valley snow.")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                + Weather Advisory
              </button>
              <button
                onClick={() => setAiPrompt("Draft a PAP permit document request message.")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                + Permit Request
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Message History Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 font-semibold text-sm text-slate-200">
          Message Log — Request {reqId}
        </div>

        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
          {customerHistory.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No sent communications for this request yet.</p>
          ) : (
            customerHistory.map(n => (
              <NotificationCard key={n.notificationId || n.id} notification={n} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

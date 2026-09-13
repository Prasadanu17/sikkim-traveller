/**
 * Notification Preferences Component — Module 13
 * Customer preference settings panel with channel toggles and topic category controls.
 * Marketing defaults to OFF; mandatory operational alerts are clearly explained.
 */

import { useState } from "react";
import { SlidersHorizontal, Check, ShieldAlert, Mail, MessageSquare, Phone, Bell, Smartphone } from "lucide-react";
import { getCustomerPreferences, saveCustomerPreferences } from "../../services/notifications/notificationPreferenceService";

export default function NotificationPreferences({ customerId, onClose }) {
  const [prefs, setPrefs] = useState(() => getCustomerPreferences(customerId));
  const [saved, setSaved] = useState(false);

  const toggleChannel = (channelKey) => {
    setPrefs(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channelKey]: !prev.channels?.[channelKey]
      }
    }));
  };

  const toggleTopic = (topicKey) => {
    setPrefs(prev => ({
      ...prev,
      topics: {
        ...prev.topics,
        [topicKey]: !prev.topics?.[topicKey]
      }
    }));
  };

  const handleSave = () => {
    saveCustomerPreferences(customerId, prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Notification Preferences</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800">
            Done
          </button>
        )}
      </div>

      {/* Delivery Channels */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Preferred Channels</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ChannelToggle icon={Bell} title="In-App Notifications" sub="Real-time updates inside portal" active={prefs.channels?.inApp} onClick={() => toggleChannel("inApp")} />
          <ChannelToggle icon={Mail} title="Email Digest" sub="Booking quotes, receipts & proposals" active={prefs.channels?.email} onClick={() => toggleChannel("email")} />
          <ChannelToggle icon={MessageSquare} title="WhatsApp Support" sub="Instant travel updates & driver info" active={prefs.channels?.whatsApp} onClick={() => toggleChannel("whatsApp")} />
          <ChannelToggle icon={Phone} title="SMS Alerts" sub="Emergency travel advisories" active={prefs.channels?.sms} onClick={() => toggleChannel("sms")} />
          <ChannelToggle icon={Smartphone} title="Web Push" sub="Browser push notifications" active={prefs.channels?.push} onClick={() => toggleChannel("push")} />
        </div>
      </div>

      {/* Notification Categories / Topics */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Notification Categories</h3>
        <div className="space-y-2">
          <TopicRow title="Booking & Itinerary Updates" sub="Proposal ready, quote revisions, permit status" active={prefs.topics?.bookingUpdates} onClick={() => toggleTopic("bookingUpdates")} />
          <TopicRow title="Payment & Invoice Receipts" sub="Advance confirmation, invoice creation, refund notices" active={prefs.topics?.paymentUpdates} onClick={() => toggleTopic("paymentUpdates")} />
          <TopicRow title="Travel & Weather Alerts" sub="High-altitude advisories, road closures, weather alerts" active={prefs.topics?.travelAlerts} onClick={() => toggleTopic("travelAlerts")} />
          <TopicRow title="Pre-Trip & Daily Reminders" sub="Packing tips, 1-day pickup alerts, driver contacts" active={prefs.topics?.tripReminders} onClick={() => toggleTopic("tripReminders")} />
          <TopicRow title="Promotional & Seasonal Offers" sub="Sikkim festival updates & off-peak discounts (Defaults OFF)" active={prefs.topics?.marketing} onClick={() => toggleTopic("marketing")} />
        </div>
      </div>

      {/* Operational Override Guarantee */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex gap-2 text-xs text-slate-400">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-200">Safety Policy:</strong> Urgent safety warnings (high weather risks or road blockages) will always be delivered via In-App notification to ensure guest safety during journeys.
        </p>
      </div>

      <div className="flex items-center justify-between pt-2">
        {saved ? (
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
            <Check className="w-4 h-4" /> Preferences saved!
          </span>
        ) : <span />}

        <button
          onClick={handleSave}
          className="text-xs px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-900/30 transition-all"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}

function ChannelToggle({ icon: Icon, title, sub, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-left transition-all ${
        active ? "bg-slate-800 border-indigo-500/50 text-white" : "bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${active ? "bg-indigo-950 text-indigo-400" : "bg-slate-900 text-slate-500"}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-semibold">{title}</p>
          <p className="text-[11px] text-slate-500">{sub}</p>
        </div>
      </div>

      <div className={`w-9 h-5 rounded-full flex items-center p-0.5 transition-colors ${active ? "bg-indigo-600" : "bg-slate-800"}`}>
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${active ? "translate-x-4" : "translate-x-0"}`} />
      </div>
    </button>
  );
}

function TopicRow({ title, sub, active, onClick }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
      <div>
        <p className="text-xs font-semibold text-slate-200">{title}</p>
        <p className="text-[11px] text-slate-500">{sub}</p>
      </div>
      <button
        onClick={onClick}
        className={`w-9 h-5 rounded-full flex items-center p-0.5 transition-colors shrink-0 ${active ? "bg-indigo-600" : "bg-slate-800"}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${active ? "translate-x-4" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

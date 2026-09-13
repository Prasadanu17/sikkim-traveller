/**
 * Notification Channel Badge Component — Module 13
 * Visual channel icon and label for Email, WhatsApp, SMS, In-App, and Push notifications.
 */

import { Mail, MessageSquare, Phone, Bell, Smartphone } from "lucide-react";
import { NOTIFICATION_CHANNELS } from "../../services/notifications/notificationContextService";

const CHANNEL_CONFIG = {
  [NOTIFICATION_CHANNELS.EMAIL]: { icon: Mail, label: "Email", color: "text-blue-400 bg-blue-950/40 border-blue-800/40" },
  [NOTIFICATION_CHANNELS.WHATSAPP]: { icon: MessageSquare, label: "WhatsApp", color: "text-emerald-400 bg-emerald-950/40 border-emerald-800/40" },
  [NOTIFICATION_CHANNELS.SMS]: { icon: Phone, label: "SMS", color: "text-amber-400 bg-amber-950/40 border-amber-800/40" },
  [NOTIFICATION_CHANNELS.IN_APP]: { icon: Bell, label: "In-App", color: "text-indigo-400 bg-indigo-950/40 border-indigo-800/40" },
  [NOTIFICATION_CHANNELS.PUSH]: { icon: Smartphone, label: "Push", color: "text-purple-400 bg-purple-950/40 border-purple-800/40" }
};

export default function NotificationChannelBadge({ channel = "IN_APP", showLabel = true }) {
  const config = CHANNEL_CONFIG[channel] || CHANNEL_CONFIG.IN_APP;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

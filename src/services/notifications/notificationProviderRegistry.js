/**
 * Notification Provider Registry — Module 13
 * Pluggable multi-channel provider abstraction layer.
 * Isolatess provider logic for Email, WhatsApp, SMS, In-App, and Push notifications.
 * Provides deterministic simulation in mock mode and clean API boundaries for production.
 */

import { NOTIFICATION_CHANNELS, NOTIFICATION_STATUSES } from "./notificationContextService";

// Mock Provider Implementations
const MockEmailProvider = {
  name: "MockEmailProvider (SMTP Simulation)",
  channel: NOTIFICATION_CHANNELS.EMAIL,
  async send(notification) {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Simulate high success rate with rare failure mode testing
    if (notification.payload?._simulateFailure) {
      return { success: false, error: "Simulated SMTP timeout error (504 Gateway Timeout)" };
    }
    return {
      success: true,
      providerRef: `MOCK-EMAIL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      deliveredAt: new Date().toISOString(),
      notice: "DEVELOPMENT SIMULATION — Mock Email dispatched."
    };
  }
};

const MockWhatsAppProvider = {
  name: "MockWhatsAppProvider (Meta Cloud API Simulation)",
  channel: NOTIFICATION_CHANNELS.WHATSAPP,
  async send(notification) {
    await new Promise(resolve => setTimeout(resolve, 350));
    if (notification.payload?._simulateFailure) {
      return { success: false, error: "Simulated Meta WhatsApp API phone number unverified error" };
    }
    return {
      success: true,
      providerRef: `MOCK-WA-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      deliveredAt: new Date().toISOString(),
      notice: "DEVELOPMENT SIMULATION — Mock WhatsApp message delivered."
    };
  }
};

const MockSMSProvider = {
  name: "MockSMSProvider (Twilio SMS Simulation)",
  channel: NOTIFICATION_CHANNELS.SMS,
  async send(notification) {
    await new Promise(resolve => setTimeout(resolve, 250));
    if (notification.payload?._simulateFailure) {
      return { success: false, error: "Simulated SMS Gateway carrier unreachable error" };
    }
    return {
      success: true,
      providerRef: `MOCK-SMS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      deliveredAt: new Date().toISOString(),
      notice: "DEVELOPMENT SIMULATION — Mock SMS sent."
    };
  }
};

const MockInAppProvider = {
  name: "MockInAppProvider (Internal State Store)",
  channel: NOTIFICATION_CHANNELS.IN_APP,
  async send(notification) {
    return {
      success: true,
      providerRef: `INAPP-${notification.notificationId}`,
      deliveredAt: new Date().toISOString(),
      notice: "In-App notification recorded."
    };
  }
};

const MockPushProvider = {
  name: "MockPushProvider (FCM Web Push Simulation)",
  channel: NOTIFICATION_CHANNELS.PUSH,
  async send(notification) {
    return {
      success: true,
      providerRef: `MOCK-PUSH-${Date.now()}`,
      deliveredAt: new Date().toISOString(),
      notice: "DEVELOPMENT SIMULATION — Mock Web Push sent."
    };
  }
};

// Registered Provider Map
const PROVIDERS = {
  [NOTIFICATION_CHANNELS.EMAIL]: MockEmailProvider,
  [NOTIFICATION_CHANNELS.WHATSAPP]: MockWhatsAppProvider,
  [NOTIFICATION_CHANNELS.SMS]: MockSMSProvider,
  [NOTIFICATION_CHANNELS.IN_APP]: MockInAppProvider,
  [NOTIFICATION_CHANNELS.PUSH]: MockPushProvider
};

/**
 * Dispatches a notification through its configured provider.
 */
export async function executeProviderDelivery(notification) {
  const isMockMode = import.meta.env.VITE_NOTIFICATIONS_MOCK_MODE !== "false";
  const provider = PROVIDERS[notification.channel] || MockInAppProvider;

  if (isMockMode) {
    return provider.send(notification);
  }

  // Production API boundary — delegates execution to secure backend endpoint
  try {
    const response = await fetch("/api/notifications/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ notificationId: notification.notificationId })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.message || `HTTP error ${response.status}` };
    }

    const data = await response.json();
    return {
      success: true,
      providerRef: data.providerRef,
      deliveredAt: data.deliveredAt || new Date().toISOString()
    };
  } catch (err) {
    return { success: false, error: err.message || "Network error connecting to backend notification service." };
  }
}

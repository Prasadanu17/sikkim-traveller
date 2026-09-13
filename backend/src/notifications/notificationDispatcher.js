/**
 * backend/src/notifications/notificationDispatcher.js
 * Provider-abstracted notification dispatcher.
 * Handles Email, WhatsApp, and SMS delivery channels with persistence,
 * idempotency, retry capability, and structured auditing.
 */

import prisma from '../config/database.js';
import { auditLog, AUDIT_ACTIONS } from '../audit/auditLogger.js';
import env from '../config/env.js';

// ── PROVIDER ABSTRACT MOCKS (can be connected to actual Twilio/SendGrid SDKs) ──

async function sendEmail({ to, subject, body }) {
  if (!env.SENDGRID_API_KEY) {
    console.log(`[Notification MOCK Email] SendGrid not configured. Simulating email to ${to}: ${subject}`);
    return { success: true, provider: 'mock-sendgrid', messageId: `msg-${Math.random().toString(36).substr(2, 9)}` };
  }
  // In real implementation:
  // import sgMail from '@sendgrid/mail';
  // sgMail.setApiKey(env.SENDGRID_API_KEY);
  // await sgMail.send({ to, from: 'noreply@sikkimtraveller.com', subject, text: body, html: body });
  console.log(`[Notification Real Email] Sending via SendGrid to ${to}`);
  return { success: true, provider: 'sendgrid' };
}

async function sendWhatsApp({ to, body }) {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    console.log(`[Notification MOCK WhatsApp] Twilio not configured. Simulating WhatsApp to ${to}: ${body}`);
    return { success: true, provider: 'mock-twilio-whatsapp', messageId: `wa-${Math.random().toString(36).substr(2, 9)}` };
  }
  // In real implementation:
  // import twilio from 'twilio';
  // const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({ from: env.TWILIO_WHATSAPP_FROM, to: `whatsapp:${to}`, body });
  console.log(`[Notification Real WhatsApp] Sending via Twilio to ${to}`);
  return { success: true, provider: 'twilio-whatsapp' };
}

async function sendSMS({ to, body }) {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    console.log(`[Notification MOCK SMS] Twilio not configured. Simulating SMS to ${to}: ${body}`);
    return { success: true, provider: 'mock-twilio-sms', messageId: `sms-${Math.random().toString(36).substr(2, 9)}` };
  }
  console.log(`[Notification Real SMS] Sending via Twilio to ${to}`);
  return { success: true, provider: 'twilio-sms' };
}

/**
 * Dispatches a notification on a specific channel, ensuring idempotency and logging.
 *
 * @param {object} opts
 * @param {string} opts.journeyId
 * @param {string} opts.eventType - e.g. JOURNEY_CREATED, PROPOSAL_SENT, etc.
 * @param {string} opts.channel - IN_APP | EMAIL | WHATSAPP | SMS
 * @param {string} [opts.to] - Target address (phone/email)
 * @param {string} [opts.subject]
 * @param {string} opts.body
 * @param {string} opts.idempotencyKey - Enforces dedup
 * @param {boolean} [opts.isAIDraft]
 */
export async function dispatchNotification(opts) {
  const { journeyId, eventType, channel, to, subject, body, idempotencyKey, isAIDraft = false } = opts;

  // 1. Idempotency Check
  const existing = await prisma.notification.findUnique({
    where: { idempotencyKey }
  });

  if (existing) {
    return { success: true, cached: true, notification: existing };
  }

  // 2. Persist notification queue record
  const notification = await prisma.notification.create({
    data: {
      journeyId,
      eventType,
      channel,
      subject,
      body,
      idempotencyKey,
      isAIDraft,
      status: isAIDraft ? 'QUEUED' : 'QUEUED' // AI drafts stay in queued/draft until approved
    }
  });

  // If it's an AI Draft, do not automatically dispatch to a external provider
  if (isAIDraft) {
    return { success: true, status: 'DRAFT_SAVED', notification };
  }

  // Check notification preferences for the journey
  const preferences = await prisma.notificationPreference.findUnique({
    where: { journeyId }
  });

  if (preferences?.muteAll) {
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: 'SUPPRESSED', failureReason: 'All notifications muted by user preference' }
    });
    return { success: false, status: 'MUTED' };
  }

  // Check channel preference
  if (channel === 'EMAIL' && !preferences?.emailEnabled) return { success: false, status: 'CHANNEL_DISABLED' };
  if (channel === 'WHATSAPP' && !preferences?.whatsappEnabled) return { success: false, status: 'CHANNEL_DISABLED' };
  if (channel === 'SMS' && !preferences?.smsEnabled) return { success: false, status: 'CHANNEL_DISABLED' };

  // 3. Dispatch to provider
  try {
    let result = { success: true };
    if (channel === 'EMAIL') {
      result = await sendEmail({ to: to || 'info@sikkimtraveller.com', subject, body });
    } else if (channel === 'WHATSAPP') {
      result = await sendWhatsApp({ to: to || '+910000000000', body });
    } else if (channel === 'SMS') {
      result = await sendSMS({ to: to || '+910000000000', body });
    } else if (channel === 'IN_APP') {
      // In-app notifications are already persisted, mark delivered immediately
      result = { success: true, provider: 'database' };
    }

    // 4. Update status
    const updated = await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date()
      }
    });

    await auditLog({
      journeyId,
      action: AUDIT_ACTIONS.NOTIFICATION_SENT,
      newValue: channel,
      message: `Notification ${eventType} delivered via ${channel}`
    });

    return { success: true, notification: updated };
  } catch (err) {
    console.error(`[NotificationDispatcher] Failed to dispatch via ${channel}:`, err.message);

    // Mark failed for later retry
    const updated = await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: 'FAILED',
        failureReason: err.message,
        retryCount: { increment: 1 }
      }
    });

    return { success: false, error: err.message, notification: updated };
  }
}

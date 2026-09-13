/**
 * Notification Orchestrator Service — Module 13
 * Master entrypoint for the Sikkim Traveller Notifications & Communications architecture.
 * Links Event Emitters → Preferences → Templates → Deduplication → Queue → Delivery → Audit.
 */

import { buildNotification, NOTIFICATION_CHANNELS, NOTIFICATION_EVENTS, NOTIFICATION_STATUSES } from "./notificationContextService";
import { shouldDeliverNotification } from "./notificationPreferenceService";
import { renderNotificationTemplate } from "./notificationTemplateService";
import { generateIdempotencyKey, findDuplicateNotification, acquireIdempotencyLock, releaseIdempotencyLock } from "./notificationDeduplicationService";
import { enqueueNotification, getNotificationQueue } from "./notificationQueueService";
import { deliverNotification } from "./notificationDeliveryService";
import { initializeNotificationStoreIfNeeded } from "./notificationFallbackService";

// Ensure store is initialized on module load
initializeNotificationStoreIfNeeded();

/**
 * Master API function to dispatch a notification event.
 */
export async function dispatchNotificationEvent({
  eventType = NOTIFICATION_EVENTS.SYSTEM_ALERT,
  requestId = "GENERAL",
  customerId = "CUST-DEFAULT",
  recipient = {},
  channel = NOTIFICATION_CHANNELS.IN_APP,
  payload = {},
  customSubject = null,
  customBody = null,
  source = "SYSTEM",
  isAIDraft = false,
  qualifier = ""
}) {
  // 1. Generate & Check Idempotency Key
  const idempotencyKey = generateIdempotencyKey(requestId, eventType, qualifier || payload.version || payload.status || "");

  const existingQueue = getNotificationQueue();
  const duplicate = findDuplicateNotification(existingQueue, idempotencyKey);
  if (duplicate) {
    return {
      alreadyProcessed: true,
      duplicate: true,
      notification: duplicate,
      message: "Duplicate notification event suppressed by idempotency guard."
    };
  }

  // Acquire in-flight lock
  if (!acquireIdempotencyLock(idempotencyKey)) {
    return {
      alreadyProcessed: true,
      inFlightLock: true,
      message: "Notification event is already processing in flight."
    };
  }

  try {
    // 2. Customer Preference & Authorization Check
    const prefCheck = shouldDeliverNotification(customerId, channel, eventType);
    if (!prefCheck.deliver) {
      return {
        suppressedByPreference: true,
        reason: prefCheck.reason,
        notification: null
      };
    }

    // 3. Render Template
    const templateVars = {
      customerName: recipient.name || recipient.fullName || "Traveler",
      requestId,
      ...payload
    };

    let renderedContent;
    let templateId = `TPL_${eventType}`;
    let templateVersion = "1.0";

    if (customSubject || customBody) {
      renderedContent = {
        subject: customSubject || "Notification from Sikkim Traveller",
        body: customBody || ""
      };
      templateId = "CUSTOM_DIRECT_MESSAGE";
    } else {
      const rendered = renderNotificationTemplate(eventType, channel, templateVars);
      renderedContent = rendered.renderedContent;
      templateId = rendered.templateId;
      templateVersion = rendered.templateVersion;
    }

    // 4. Build Notification Record
    const notification = buildNotification({
      requestId,
      customerId,
      recipient,
      channel,
      templateId,
      templateVersion,
      eventType,
      payload,
      renderedContent,
      status: NOTIFICATION_STATUSES.QUEUED,
      idempotencyKey,
      source,
      isAIDraft
    });

    // 5. Enqueue Notification
    enqueueNotification(notification);

    // 6. Execute Provider Delivery
    const deliveryResult = await deliverNotification(notification);

    return {
      success: deliveryResult.success,
      notification: deliveryResult.notification || notification,
      error: deliveryResult.error
    };
  } finally {
    releaseIdempotencyLock(idempotencyKey);
  }
}

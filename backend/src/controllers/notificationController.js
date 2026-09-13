/**
 * backend/src/controllers/notificationController.js
 */

import prisma from '../config/database.js';

export async function getNotifications(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { journeyId: req.customer.journeyId, channel: 'IN_APP' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return res.json({ success: true, notifications });
  } catch (err) { next(err); }
}

export async function getPreferences(req, res, next) {
  try {
    const pref = await prisma.notificationPreference.findUnique({
      where: { journeyId: req.customer.journeyId }
    });
    return res.json({ success: true, preferences: pref });
  } catch (err) { next(err); }
}

export async function updatePreferences(req, res, next) {
  try {
    const { inAppEnabled, emailEnabled, whatsappEnabled, smsEnabled, muteAll } = req.body;
    const updated = await prisma.notificationPreference.upsert({
      where: { journeyId: req.customer.journeyId },
      create: {
        journeyId: req.customer.journeyId,
        inAppEnabled: inAppEnabled ?? true,
        emailEnabled: emailEnabled ?? true,
        whatsappEnabled: whatsappEnabled ?? true,
        smsEnabled: smsEnabled ?? false,
        muteAll: muteAll ?? false,
      },
      update: {
        ...(inAppEnabled !== undefined && { inAppEnabled }),
        ...(emailEnabled !== undefined && { emailEnabled }),
        ...(whatsappEnabled !== undefined && { whatsappEnabled }),
        ...(smsEnabled !== undefined && { smsEnabled }),
        ...(muteAll !== undefined && { muteAll }),
      }
    });
    return res.json({ success: true, preferences: updated });
  } catch (err) { next(err); }
}

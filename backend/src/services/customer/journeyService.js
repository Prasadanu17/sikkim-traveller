/**
 * backend/src/services/customer/journeyService.js
 * Core journey creation service — production replacement for customerJourneyCreationService.js mock.
 *
 * IDEMPOTENCY: Uses Idempotency-Key header to prevent duplicate journeys from retries.
 * TOKEN SECURITY: Raw tokens are never stored — only HMAC-SHA256 hash.
 */

import prisma from '../../config/database.js';
import { generateJourneyAccessPackage } from '../../security/tokenGenerator.js';
import { sanitizeText, sanitizeObject } from '../../security/sanitizer.js';
import { auditLog, AUDIT_ACTIONS } from '../../audit/auditLogger.js';
import env from '../../config/env.js';

// Permit-sensitive destination slugs — mirror Module 10 operationsContextService.js
const PERMIT_SENSITIVE = new Set([
  'lachung', 'lachen', 'yumthang', 'gurudongmar',
  'nathula', 'zuluk', 'silk-route', 'north-sikkim',
  'thangu', 'chopta-valley'
]);

/**
 * Creates a new customer journey from the AI Trip Planner.
 * Returns rawToken ONCE — it is never retrievable again after this call.
 *
 * @param {object} input
 * @param {object} input.plannerState - AI planner output
 * @param {object} input.travelerInfo - Customer traveler details
 * @param {object} [input.preferences]
 * @param {string} [input.idempotencyKey] - From Idempotency-Key header
 * @returns {{ success, requestId, rawToken, accessUrl, journey }}
 */
export async function createJourney({ plannerState, travelerInfo = {}, preferences = {}, idempotencyKey }) {
  if (!plannerState) {
    throw Object.assign(new Error('Missing planner state.'), { status: 400, code: 'VALIDATION_ERROR' });
  }

  // ── Idempotency check ────────────────────────────────────────
  if (idempotencyKey) {
    const existing = await prisma.customerJourney.findUnique({
      where: { idempotencyKey },
      include: { accessTokens: true }
    });
    if (existing) {
      // Return the existing journey — but raw token is gone, so we cannot re-return it.
      // Client should use verify-token flow with their saved token.
      return {
        success: true,
        requestId: existing.requestId,
        rawToken: null, // Raw token was only returned once at creation
        accessUrl: null,
        journey: existing,
        _idempotent: true,
        _note: 'Journey already exists. Use your original access token.'
      };
    }
  }

  // ── Normalize inputs ─────────────────────────────────────────
  const primaryName = sanitizeText(travelerInfo.fullName || travelerInfo.name || 'Traveler');
  const firstName   = primaryName.split(' ')[0];
  const email       = sanitizeText(travelerInfo.email || '');
  const phone       = sanitizeText(travelerInfo.phone || '');
  const city        = sanitizeText(travelerInfo.location || travelerInfo.city || 'India');
  const country     = sanitizeText(travelerInfo.country || 'India');

  const adults    = plannerState.travelers?.adults ?? 2;
  const children  = plannerState.travelers?.children ?? 0;
  const seniors   = plannerState.travelers?.seniors ?? 0;
  const duration  = plannerState.duration ?? 5;
  const startDate = plannerState.dates?.startDate || plannerState.startDate || null;
  const endDate   = plannerState.dates?.endDate || plannerState.endDate || null;

  const destSlugs = (plannerState.destinations?.selected || ['gangtok', 'lachung']).map(d => d.toLowerCase());
  const requiresPermit = destSlugs.some(s => PERMIT_SENSITIVE.has(s));

  // ── Generate secure token package ───────────────────────────
  const { requestId, rawToken, tokenHash, expiresAt, accessUrl } = generateJourneyAccessPackage();

  // ── Write to DB in a transaction ────────────────────────────
  const journey = await prisma.$transaction(async (tx) => {
    // 1. Create the journey record
    const j = await tx.customerJourney.create({
      data: {
        requestId,
        idempotencyKey: idempotencyKey || null,
        status: 'RECEIVED',
        priority: 'NORMAL',
      }
    });

    // 2. Store only the token hash
    await tx.journeyAccessToken.create({
      data: {
        tokenHash,
        journeyId: j.id,
        expiresAt,
      }
    });

    // 3. Traveler record
    await tx.traveler.create({
      data: {
        journeyId: j.id,
        fullName: primaryName,
        firstName,
        email: email || null,
        phone: phone || null,
        city,
        country,
        contactMethod: travelerInfo.contactPreference?.method || 'WHATSAPP',
        contactTime: travelerInfo.contactPreference?.timeOfDay || 'ANYTIME',
        adultCount: adults,
        childCount: children,
        seniorCount: seniors,
      }
    });

    // 4. Trip record
    const trip = await tx.trip.create({
      data: {
        journeyId: j.id,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        duration,
        dateMode: plannerState.dates?.mode || 'fixed',
        travelStyle: plannerState.travelStyle || 'balanced',
        budgetTier: plannerState.budget?.selectedTier || 'comfortable',
      }
    });

    // 5. Destinations
    if (destSlugs.length > 0) {
      await tx.destination.createMany({
        data: destSlugs.map((slug, i) => ({
          tripId: trip.id,
          slug,
          name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
          order: i,
        }))
      });
    }

    // 6. Itinerary (if already generated by AI planner)
    if (plannerState.itinerary?.days?.length > 0) {
      const itinerary = await tx.itinerary.create({
        data: {
          journeyId: j.id,
          version: plannerState.itinerary?.version || 'ST-v1',
          title: plannerState.itinerary?.title || 'Custom Sikkim Journey',
          summary: plannerState.itinerary?.summary || null,
        }
      });

      const dayRecords = plannerState.itinerary.days.map(day => ({
        itineraryId: itinerary.id,
        dayNumber: day.dayNumber || day.day || 1,
        title: day.title || `Day ${day.dayNumber}`,
        baseLocation: day.baseLocation || day.location || 'Gangtok',
        elevation: day.elevation || null,
        accommodation: day.accommodation || null,
        transport: day.transport || null,
        highlights: Array.isArray(day.highlights) ? day.highlights : [],
        activities: Array.isArray(day.activities) ? day.activities : [],
      }));

      await tx.itineraryDay.createMany({ data: dayRecords });
    }

    // 7. Notification preference (defaults)
    await tx.notificationPreference.create({
      data: { journeyId: j.id }
    });

    // 8. Permit records for sensitive destinations
    if (requiresPermit) {
      const permitDests = destSlugs.filter(s => PERMIT_SENSITIVE.has(s));
      await tx.permit.createMany({
        data: permitDests.map(dest => ({
          journeyId: j.id,
          permitType: dest === 'nathula' ? 'PAP' : 'ILP',
          destination: dest,
          status: 'REQUIRED',
        }))
      });
    }

    // 9. Initial audit log
    await tx.auditLog.create({
      data: {
        journeyId: j.id,
        action: AUDIT_ACTIONS.JOURNEY_CREATED,
        message: `Journey created for ${firstName}. Destinations: ${destSlugs.join(', ')}`,
      }
    });

    return j;
  });

  // 10. Create session for immediate dashboard access
  const sessionExpiresAt = new Date();
  sessionExpiresAt.setHours(sessionExpiresAt.getHours() + env.SESSION_EXPIRY_HOURS);

  const accessToken = await prisma.journeyAccessToken.findFirst({
    where: { tokenHash, journeyId: journey.id }
  });

  await prisma.customerSession.create({
    data: {
      journeyId: journey.id,
      tokenId: accessToken.id,
      expiresAt: sessionExpiresAt,
    }
  });

  return {
    success: true,
    requestId,
    rawToken,  // Returned ONCE — never stored — never retrievable again
    accessUrl,
    journey: { id: journey.id, requestId, status: 'RECEIVED' }
  };
}

/**
 * Builds the customer-safe journey model for API responses.
 * Strips all internal notes, supplier margins, driver PII, audit logs.
 * Mirrors buildCustomerSafeModel() from frontend customerPortalContextService.js.
 *
 * @param {string} journeyId - Resolved from authenticated session (NEVER from browser)
 * @returns {object} Customer-safe journey model
 */
export async function getCustomerSafeJourney(journeyId) {
  const raw = await prisma.customerJourney.findUnique({
    where: { id: journeyId },
    include: {
      traveler: true,
      trip: { include: { destinations: { orderBy: { order: 'asc' } } } },
      itinerary: { include: { days: { orderBy: { dayNumber: 'asc' } } } },
      permits: true,
      changeRequests: {
        where: { status: { not: 'DECLINED' } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      proposals: {
        include: { approval: true },
        orderBy: { version: 'asc' },
      },
      payments: { orderBy: { createdAt: 'desc' } },
      documents: { where: { status: 'READY' } },
      notifications: {
        where: { channel: 'IN_APP' },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      notificationPref: true,
      // Deliberately excluding: internalNotes, supplierMargin, auditLogs, assignedStaff
    }
  });

  if (!raw) return null;

  // ── Countdown calculation ────────────────────────────────────
  const now = new Date();
  const startDate = raw.trip?.startDate;
  const endDate = raw.trip?.endDate;
  let countdownText = 'Flexible Dates';
  let countdownDays = null;

  if (startDate) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const diffDays = Math.ceil((startDay - today) / 86400000);
    if (diffDays > 0) {
      countdownDays = diffDays;
      countdownText = `${diffDays} day${diffDays === 1 ? '' : 's'} until departure`;
    } else if (diffDays === 0) {
      countdownText = 'Departure is Today!';
    } else if (endDate && today <= endDate) {
      const activeDay = Math.floor((today - startDay) / 86400000) + 1;
      countdownText = `Day ${activeDay} of ${raw.trip.duration}`;
    } else {
      countdownText = 'Trip completed';
    }
  }

  // ── Latest proposal ──────────────────────────────────────────
  const latestProposal = raw.proposals?.length > 0
    ? raw.proposals[raw.proposals.length - 1]
    : null;

  const safeProposal = latestProposal ? {
    version: latestProposal.version,
    versionLabel: latestProposal.versionLabel,
    validUntil: latestProposal.validUntil?.toISOString(),
    price: latestProposal.quotes?.finalPrice ?? 0,
    currency: 'INR',
    inclusions: latestProposal.inclusions,
    exclusions: latestProposal.exclusions,
    summary: latestProposal.summary,
    updatedAt: latestProposal.updatedAt?.toISOString(),
  } : null;

  const latestApproval = latestProposal?.approval;
  const customerApproval = {
    accepted: latestApproval?.invalidatedAt == null && latestApproval != null,
    proposalVersion: latestApproval?.proposalVersion ?? null,
    acceptedAt: latestApproval?.acceptedAt?.toISOString() ?? null,
    customerName: latestApproval?.customerName ?? null,
  };

  // ── CUSTOMER-SAFE output ─────────────────────────────────────
  return {
    // Public identifiers
    trackingToken: raw.requestId,  // requestId is safe to show — it's not a secret
    publicRequestId: raw.requestId,
    requestId: raw.requestId,
    status: raw.status,
    priority: raw.priority,

    // Customer (firstName + count ONLY — no full name/email/phone to avoid PII exposure)
    customer: {
      firstName: raw.traveler?.firstName || 'Traveler',
      travelerCount: (raw.traveler?.adultCount || 1) + (raw.traveler?.childCount || 0)
    },

    // Trip
    trip: {
      startDate: raw.trip?.startDate?.toISOString().split('T')[0] || 'Flexible',
      endDate: raw.trip?.endDate?.toISOString().split('T')[0] || 'Flexible',
      duration: raw.trip?.duration || 5,
      destinations: raw.trip?.destinations?.map(d => d.name) || ['Gangtok'],
      travelStyle: raw.trip?.travelStyle || 'Scenic & Cultural',
    },

    // Itinerary
    itinerary: {
      version: raw.itinerary?.version || 1,
      title: raw.itinerary?.title || 'Custom Sikkim Himalayan Journey',
      days: raw.itinerary?.days?.map(d => ({
        dayNumber: d.dayNumber,
        title: d.title,
        baseLocation: d.baseLocation,
        elevation: d.elevation,
        accommodation: d.accommodation,
        transport: d.transport,
        highlights: d.highlights,
        activities: d.activities,
      })) || [],
    },

    // Budget (from proposal if exists)
    budget: {
      estimated: latestProposal ? null : 35000,
      currentProposal: safeProposal?.price ?? null,
      currency: 'INR',
    },

    // Accommodation status (no driver PII)
    accommodation: {
      status: raw.status === 'CONFIRMED' ? 'CONFIRMED' : 'PROVISIONAL',
      selectedOption: 'Premium Valley View Resorts & Chalets',
    },

    // Transportation (NO driver name/phone until CONFIRMED)
    transportation: {
      status: raw.status === 'CONFIRMED' ? 'CONFIRMED' : 'PROVISIONAL',
      summary: raw.status === 'CONFIRMED'
        ? 'Dedicated 4WD Mountain Vehicle — driver details in documents'
        : 'Private mountain vehicle allocated for all days',
    },

    // Permits
    permits: {
      status: raw.permits?.length > 0
        ? (raw.permits[0].status === 'APPROVED' ? 'APPROVED' : 'PROCESSING')
        : 'NOT_REQUIRED',
      customerRelevantIssues: raw.permits
        ?.filter(p => p.status === 'DOCUMENTS_PENDING')
        ?.map(p => `${p.permitType} required for ${p.destination}`) || [],
    },

    proposal: safeProposal,
    customerApproval,

    // Documents (metadata only — actual files served via signed URLs separately)
    documents: raw.documents?.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      status: d.status,
      date: d.issuedAt?.toISOString().split('T')[0] || d.createdAt.toISOString().split('T')[0],
      version: d.version,
      downloadUrl: `/api/customer/documents/${d.id}/download`, // signed URL on demand
    })) || [],

    // Notifications (in-app only in safe model)
    notifications: raw.notifications?.map(n => ({
      id: n.id,
      eventType: n.eventType,
      subject: n.subject,
      body: n.body,
      status: n.status,
      readAt: n.readAt?.toISOString(),
      createdAt: n.createdAt.toISOString(),
    })) || [],

    // Notification preferences
    notificationPreferences: raw.notificationPref ? {
      inAppEnabled: raw.notificationPref.inAppEnabled,
      emailEnabled: raw.notificationPref.emailEnabled,
      whatsappEnabled: raw.notificationPref.whatsappEnabled,
      smsEnabled: raw.notificationPref.smsEnabled,
      muteAll: raw.notificationPref.muteAll,
    } : null,

    hasPendingChangeRequest: raw.changeRequests?.some(cr => cr.status === 'SUBMITTED' || cr.status === 'UNDER_REVIEW') || false,

    countdownText,
    countdownDays,
    updatedAt: raw.updatedAt.toISOString(),
  };
}

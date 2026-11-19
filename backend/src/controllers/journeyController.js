/**
 * backend/src/controllers/journeyController.js
 * Journey lifecycle controller. Handles journey creation from both the AI Planner
 * and booking submit forms, as well as tracking token lookups and customer portal actions.
 */

import prisma from '../config/database.js';
import {
  createJourney as createJourneyService,
  getCustomerSafeJourney,
  resolveJourneyIdByTrackingToken,
  getJourneyByTrackingToken as getSafeJourneyByTrackingToken
} from '../services/customer/journeyService.js';
import * as documentService from '../services/customer/documentService.js';
import { approveProposal } from '../services/customer/proposalService.js';
import { getWeatherForJourney } from '../services/realtime/weatherService.js';
import { sanitizeText } from '../security/sanitizer.js';

export async function createJourney(req, res, next) {
  try {
    const idempotencyKey =
      req.headers['idempotency-key'] ||
      req.headers['x-idempotency-key'] ||
      req.body?.idempotencyKey ||
      null;

    let { plannerState, travelerInfo, preferences } = req.body || {};

    // Support payload directly from BookingJourney.jsx / bookingRequestService.js
    if (!plannerState && req.body && (req.body.destinations || req.body.itinerary || req.body.trip)) {
      plannerState = {
        destinations: {
          selected: Array.isArray(req.body.destinations)
            ? req.body.destinations
            : (req.body.trip?.destinations || ['gangtok'])
        },
        itinerary: req.body.itinerary || null,
        duration:
          req.body.trip?.duration ||
          (Array.isArray(req.body.itinerary) ? req.body.itinerary.length : 5),
        travelers: {
          adults: req.body.traveler?.adults ?? req.body.trip?.adults ?? 2,
          children: req.body.traveler?.children ?? req.body.trip?.children ?? 0,
          seniors: req.body.traveler?.seniors ?? req.body.trip?.seniors ?? 0,
        },
        dates: {
          startDate: req.body.trip?.startDate || null,
          endDate: req.body.trip?.endDate || null,
        },
        budget: req.body.budget,
        accommodation: req.body.accommodation,
        transportation: req.body.transportation,
      };

      travelerInfo = req.body.contact || req.body.traveler || {};
      preferences = {
        specialRequests: req.body.specialRequests,
        contactPreference: req.body.contactPreference,
        additionalTravelers: req.body.additionalTravelers,
        ...(req.body.preferences || {})
      };
    }

    const result = await createJourneyService({ plannerState, travelerInfo, preferences, idempotencyKey });

    return res.status(201).json({
      success: true,
      requestId: result.requestId,
      status: result.journey?.status || 'RECEIVED',
      submittedAt: result.journey?.createdAt || new Date().toISOString(),
      rawToken: result.rawToken,
      accessUrl: result.accessUrl,
      journey: result.journey,
      _idempotent: result._idempotent,
      _note: result._note
    });
  } catch (err) {
    next(err);
  }
}

export async function getJourney(req, res, next) {
  try {
    // IDOR: journeyId ALWAYS comes from req.customer (verified token), never from browser
    const journey = await getCustomerSafeJourney(req.customer.journeyId);
    if (!journey) return res.status(404).json({ authorized: false, message: 'Journey not found.' });
    return res.json({ success: true, authorized: true, journey });
  } catch (err) {
    next(err);
  }
}

export async function getJourneyByTrackingToken(req, res, next) {
  try {
    const { trackingToken } = req.params;
    const journey = await getSafeJourneyByTrackingToken(trackingToken);
    if (!journey) {
      return res.status(404).json({
        success: false,
        message: `No trip booking was found with tracking token "${trackingToken}".`
      });
    }
    return res.json(journey);
  } catch (err) {
    next(err);
  }
}

export async function getDocumentsByTrackingToken(req, res, next) {
  try {
    const { trackingToken } = req.params;
    const journeyId = await resolveJourneyIdByTrackingToken(trackingToken);
    if (!journeyId) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    const docs = await documentService.getDocuments(journeyId);
    return res.json(docs);
  } catch (err) {
    next(err);
  }
}

export async function getMessagesByTrackingToken(req, res, next) {
  try {
    const { trackingToken } = req.params;
    const journeyId = await resolveJourneyIdByTrackingToken(trackingToken);
    if (!journeyId) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    const notifications = await prisma.notification.findMany({
      where: { journeyId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return res.json(
      notifications.map((n) => ({
        id: n.id,
        text: n.body,
        senderName: n.eventType === 'CUSTOMER_MESSAGE' ? 'You' : 'Sikkim Operations Desk',
        sentAt: n.createdAt.toISOString(),
        read: n.status === 'READ'
      }))
    );
  } catch (err) {
    next(err);
  }
}

export async function sendMessageByTrackingToken(req, res, next) {
  try {
    const { trackingToken } = req.params;
    const journeyId = await resolveJourneyIdByTrackingToken(trackingToken);
    if (!journeyId) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const cleanText = sanitizeText(req.body.text || '');
    const cleanName = sanitizeText(req.body.senderName || 'Traveler');

    if (!cleanText || cleanText.length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide a message (at least 2 characters).' });
    }

    const notification = await prisma.notification.create({
      data: {
        journeyId,
        channel: 'IN_APP',
        eventType: 'CUSTOMER_MESSAGE',
        subject: `Message from ${cleanName}`,
        body: cleanText,
        status: 'UNREAD'
      }
    });

    const safeBooking = await getSafeJourneyByTrackingToken(trackingToken);

    return res.status(201).json({
      success: true,
      message: {
        id: notification.id,
        text: cleanText,
        senderName: cleanName,
        sentAt: notification.createdAt.toISOString()
      },
      booking: safeBooking
    });
  } catch (err) {
    next(err);
  }
}

export async function submitChangeRequestByTrackingToken(req, res, next) {
  try {
    const { trackingToken } = req.params;
    const journeyId = await resolveJourneyIdByTrackingToken(trackingToken);
    if (!journeyId) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const { category, title, description } = req.body;
    const cleanDesc = sanitizeText(description || '');
    const cleanTitle = sanitizeText(title || 'Change Request');

    if (!cleanDesc || cleanDesc.length < 5) {
      return res.status(400).json({ success: false, message: 'Please provide a description (at least 5 characters).' });
    }

    await prisma.changeRequest.create({
      data: {
        journeyId,
        category: category?.toUpperCase() || 'GENERAL',
        title: cleanTitle,
        description: cleanDesc,
        status: 'SUBMITTED'
      }
    });

    const safeBooking = await getSafeJourneyByTrackingToken(trackingToken);
    return res.json({
      success: true,
      message: 'Change request submitted successfully. Our operations desk is reviewing your adjustments.',
      booking: safeBooking
    });
  } catch (err) {
    next(err);
  }
}

export async function approveProposalByTrackingToken(req, res, next) {
  try {
    const { trackingToken, version } = req.params;
    const journeyId = await resolveJourneyIdByTrackingToken(trackingToken);
    if (!journeyId) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const numVersion = parseInt(version, 10);
    const agreements = req.body.agreements || {
      reviewedDetails: true,
      reviewedPrice: true,
      understoodAvailability: true,
      agreedToProceed: true
    };
    const customerName = sanitizeText(req.body.customerName || 'Traveler');

    await approveProposal(journeyId, null, numVersion, agreements, customerName, req.ip);
    const safeBooking = await getSafeJourneyByTrackingToken(trackingToken);

    return res.json({
      success: true,
      message: 'Proposal approved successfully.',
      booking: safeBooking
    });
  } catch (err) {
    next(err);
  }
}

export async function getRealtimeByTrackingToken(req, res, next) {
  try {
    const { trackingToken } = req.params;
    const journeyId = await resolveJourneyIdByTrackingToken(trackingToken);
    if (!journeyId) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const trip = await prisma.trip.findUnique({
      where: { journeyId },
      include: { destinations: { orderBy: { order: 'asc' } } }
    });

    const destSlugs = trip?.destinations?.map((d) => d.slug) || ['gangtok'];
    const weatherData = await getWeatherForJourney(destSlugs);

    const advisories = await prisma.travelAdvisory.findMany({
      where: { expiresAt: { gte: new Date() } },
      orderBy: { issuedAt: 'desc' }
    });

    return res.json({
      success: true,
      weather: weatherData,
      advisories: advisories.map((a) => ({
        id: a.id,
        region: a.region,
        title: a.title,
        description: a.description,
        riskLevel: a.riskLevel,
        issuedAt: a.issuedAt.toISOString()
      })),
      roadStatus: {
        lastUpdated: new Date().toISOString(),
        routes: [
          { route: 'Siliguri to Gangtok (NH10)', status: '🟢 OPEN', conditions: 'Clear, light traffic' },
          { route: 'Gangtok to Nathula Pass', status: '🟢 OPEN', conditions: 'Permits required, open until 4 PM' },
          { route: 'Gangtok to Lachen / Lachung', status: '🟢 OPEN', conditions: 'Watch for weather changes in evening' }
        ]
      }
    });
  } catch (err) {
    next(err);
  }
}

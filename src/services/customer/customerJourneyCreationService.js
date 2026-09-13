/**
 * Customer Journey Creation Service — Module 17
 * Converts planner state and traveler details into a persistent customer journey / booking request.
 * Generates a unique Journey ID (ST-REQ-YYYYMMDD-XXXX) and an unpredictable secure access token (ST-REQ-YYYYMMDD-XXXX-TK89F2A1).
 * Saves to Module 10 operations fallback store (st_ops_mock_bookings_v1) so Operations immediately sees status RECEIVED.
 * Triggers Module 13 notification and sets sessionStorage active session.
 */

import { buildOperationsRecord } from "../operations/operationsContextService";
import { loadMockBookings, saveMockBookings } from "../operations/operationsFallbackService";
import { generateCustomerJourneyToken, saveActiveJourneySession } from "./customerSecurityService";
import { dispatchNotificationEvent } from "../notifications/notificationOrchestrator";

// Short-term in-memory idempotency cache for journey creation to prevent duplicates on double-click/retry
const creationCache = new Map();
const IDEMPOTENCY_WINDOW_MS = 5000;

/**
 * Creates a persistent customer journey from planner state and traveler information.
 */
export function createCustomerJourney({ plannerState, travelerInfo = {}, preferences = {} }) {
  if (!plannerState) {
    return { success: false, error: "Missing planner state." };
  }

  // Idempotency guard: If request matches traveler Name, Date, Duration in last 5s, return cached result
  const primaryName = travelerInfo.fullName || travelerInfo.name || "Traveler";
  const startDate = plannerState.dates?.startDate || plannerState.startDate || "";
  const duration = plannerState.duration || 5;
  const idempotencyKey = `${primaryName}_${startDate}_${duration}`;

  const cached = creationCache.get(idempotencyKey);
  if (cached && (Date.now() - cached.timestamp < IDEMPOTENCY_WINDOW_MS)) {
    return cached.result;
  }

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  const requestId = `ST-REQ-${yyyy}${mm}${dd}-${rand}`;

  // Generate secure unpredictable access token
  const accessToken = generateCustomerJourneyToken(requestId);

  // Normalize traveler details
  const travelerObj = {
    fullName: primaryName,
    email: travelerInfo.email || "",
    phone: travelerInfo.phone || "",
    city: travelerInfo.location || travelerInfo.city || "India",
    country: travelerInfo.country || "India",
    contactMethod: travelerInfo.contactPreference?.method || "WHATSAPP",
    contactTime: travelerInfo.contactPreference?.timeOfDay || "ANYTIME",
    companions: travelerInfo.companions || []
  };

  // Construct booking context for Operations record
  const bookingContext = {
    trip: {
      startDate: plannerState.dates?.startDate || plannerState.startDate || now.toISOString().split("T")[0],
      endDate: plannerState.dates?.endDate || plannerState.endDate || null,
      duration: plannerState.duration || 5,
      mode: plannerState.dates?.mode || "fixed",
      interests: plannerState.interests || ["scenic"]
    },
    traveler: {
      type: (plannerState.travelers?.adults || 1) > 1 ? "group" : "solo",
      adults: plannerState.travelers?.adults || 2,
      children: plannerState.travelers?.children || 0,
      seniors: plannerState.travelers?.seniors || 0,
      total: (plannerState.travelers?.adults || 2) + (plannerState.travelers?.children || 0)
    },
    destinations: plannerState.destinations?.selected || ["gangtok", "lachung"],
    itinerary: plannerState.itinerary || {
      version: "ST-v1",
      title: "Sikkim Journey",
      summary: "AI-generated Himalayan journey",
      days: []
    },
    itineraryVersion: "ST-v1",
    budget: {
      level: plannerState.budget?.selectedTier || "comfortable",
      estimatedRange: plannerState.budgetIntelligence?.estimatedRange || { min: 25000, max: 35000 },
      breakdown: {}
    },
    accommodation: plannerState.accommodation || { mode: "recommend", comfort: "comfortable" },
    transportation: plannerState.transportation || { mode: "recommend", preferredModes: ["private-cab"] },
    preferences: {
      travelStyle: plannerState.travelStyle || "balanced",
      notes: preferences.specialNotes || []
    },
    realtimeSnapshot: {
      overallStatus: "🟢 Normal Road Conditions",
      riskLevel: "LOW",
      alerts: [],
      lastChecked: new Date().toLocaleTimeString()
    }
  };

  // Build Operations Record (Module 10 format)
  const record = buildOperationsRecord(bookingContext, travelerObj, {
    requestId,
    submittedAt: now.toISOString(),
    status: "RECEIVED"
  });

  record.accessToken = accessToken;
  record.createdAt = now.toISOString();
  record.updatedAt = now.toISOString();

  // Save to Operations Mock Store
  const existing = loadMockBookings();
  const updatedList = [record, ...existing];
  saveMockBookings(updatedList);

  // Set active session in sessionStorage
  saveActiveJourneySession(accessToken, requestId, primaryName);

  // Dispatch Journey Created Notification (Module 13)
  try {
    dispatchNotificationEvent({
      eventType: "JOURNEY_CREATED",
      customerId: record.customerId || "CUST-98765",
      title: "Your Sikkim Journey Has Been Created!",
      message: `Journey ID ${requestId} created successfully. You can return anytime using your private access link.`
    });
  } catch (_err) {
    // Ignore notification errors in dev mode
  }

  const accessUrl = `/trip-planner/dashboard?token=${encodeURIComponent(accessToken)}`;

  const result = {
    success: true,
    requestId,
    accessToken,
    accessUrl,
    journeyRecord: record
  };

  creationCache.set(idempotencyKey, {
    timestamp: Date.now(),
    result
  });

  return result;
}

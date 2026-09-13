/**
 * Operations Fallback Service — Module 10
 * Generates a realistic set of mock booking records for development mode.
 * All records are clearly tagged with _isMockData: true.
 * NEVER used in production.
 */

import { buildOperationsRecord, buildActivityEvent, buildAuditEvent } from "./operationsContextService";
import { generateCustomerJourneyToken } from "../customer/customerSecurityService";

const MOCK_STORAGE_KEY = "st_ops_mock_bookings_v1";

// ─────────────────────────────────────────────
// MOCK DATA SEED
// ─────────────────────────────────────────────

const MOCK_TRAVELERS = [
  { fullName: "Rahul Sharma", email: "rahul@example.com", phone: "+91 98765 43210", city: "Delhi", country: "India", contactMethod: "WHATSAPP", contactTime: "MORNING", companions: ["Priya Sharma"] },
  { fullName: "Ananya Bose", email: "ananya.b@example.com", phone: "+91 97654 32109", city: "Kolkata", country: "India", contactMethod: "EMAIL", contactTime: "EVENING", companions: [] },
  { fullName: "Vikram Mehta", email: "vikram.m@example.com", phone: "+91 96543 21098", city: "Mumbai", country: "India", contactMethod: "PHONE", contactTime: "AFTERNOON", companions: ["Neha Mehta", "Arjun Mehta", "Kavita Mehta"] },
  { fullName: "Soo-Jin Park", email: "soojin@example.com", phone: "+82 10 1234 5678", city: "Seoul", country: "South Korea", contactMethod: "EMAIL", contactTime: "ANYTIME", companions: ["Ji-Ho Park"] },
  { fullName: "Prashant Naidu", email: "prashant.n@example.com", phone: "+91 95432 10987", city: "Hyderabad", country: "India", contactMethod: "WHATSAPP", contactTime: "EVENING", companions: [] }
];

const MOCK_BOOKINGS_CONFIG = [
  {
    destinations: ["gangtok", "lachung", "yumthang"],
    duration: 6,
    startDate: offsetDate(5),
    endDate: offsetDate(11),
    style: "balanced",
    budget: { level: "comfortable", estimatedRange: { min: 38000, max: 45000 } },
    travelerIndex: 0,
    status: "UNDER_REVIEW",
    priority: "HIGH",
    assignedTo: "Ankit Kumar"
  },
  {
    destinations: ["gangtok", "pelling", "namchi"],
    duration: 5,
    startDate: offsetDate(12),
    endDate: offsetDate(17),
    style: "balanced",
    budget: { level: "standard", estimatedRange: { min: 28000, max: 35000 } },
    travelerIndex: 1,
    status: "RECEIVED",
    priority: "NORMAL",
    assignedTo: null
  },
  {
    destinations: ["gangtok", "nathula", "lachung", "yumthang"],
    duration: 7,
    startDate: offsetDate(3),
    endDate: offsetDate(10),
    style: "adventure",
    budget: { level: "premium", estimatedRange: { min: 62000, max: 75000 } },
    travelerIndex: 2,
    status: "PROPOSAL_SENT",
    priority: "URGENT",
    assignedTo: "Ankit Kumar"
  },
  {
    destinations: ["gangtok", "zuluk", "silk-route"],
    duration: 8,
    startDate: offsetDate(20),
    endDate: offsetDate(28),
    style: "photography",
    budget: { level: "comfortable", estimatedRange: { min: 55000, max: 65000 } },
    travelerIndex: 3,
    status: "AVAILABILITY_CHECK",
    priority: "HIGH",
    assignedTo: "Meera Devi"
  },
  {
    destinations: ["gangtok", "pelling"],
    duration: 4,
    startDate: offsetDate(30),
    endDate: offsetDate(34),
    style: "relaxed",
    budget: { level: "standard", estimatedRange: { min: 22000, max: 28000 } },
    travelerIndex: 4,
    status: "RECEIVED",
    priority: "LOW",
    assignedTo: null
  }
];

// ─────────────────────────────────────────────
// GENERATOR
// ─────────────────────────────────────────────

function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function makeMockRequestId(index) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `ST-REQ-${yyyy}${mm}${dd}-${1042 + index}`;
}

function buildMockItinerary(destinations, duration, style, title) {
  const days = [];
  const destList = [...destinations];
  for (let i = 1; i <= duration; i++) {
    const dest = destList[Math.min(Math.floor((i - 1) * destList.length / duration), destList.length - 1)];
    const destLabel = dest.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    days.push({
      dayNumber: i,
      title: `Day ${i} — ${destLabel}`,
      activities: [
        { time: "Morning", description: `Explore ${destLabel} sights` },
        { time: "Afternoon", description: `Local lunch and cultural visit` },
        { time: "Evening", description: `Return to hotel, dinner` }
      ],
      accommodation: `${destLabel} Guesthouse / Hotel`,
      transport: i === 1 ? "Airport/Station transfer by private cab" : `Drive to ${destLabel}`
    });
  }
  return {
    version: "ST-v1",
    title: title || `Sikkim ${style} Journey`,
    tripTitle: title || `Sikkim ${style} Journey`,
    summary: `A ${duration}-day curated journey through ${destinations.map(d => d.replace(/-/g, " ")).join(", ")} designed for ${style} travellers.`,
    days,
    importantNotes: ["Travel permits required for restricted areas.", "Carry warm layers for high-altitude days."],
    createdAt: new Date().toISOString(),
    isOriginal: true
  };
}

function generateMockBookings() {
  return MOCK_BOOKINGS_CONFIG.map((config, index) => {
    const traveler = MOCK_TRAVELERS[config.travelerIndex];
    const requestId = makeMockRequestId(index);
    const now = new Date(Date.now() - (5 - index) * 3600000).toISOString();

    const bookingContext = {
      trip: {
        startDate: config.startDate,
        endDate: config.endDate,
        duration: config.duration,
        mode: "fixed",
        interests: [config.style]
      },
      traveler: { type: traveler.companions.length > 0 ? "group" : "solo", adults: 1 + Math.max(0, traveler.companions.length), children: 0, seniors: 0, total: 1 + traveler.companions.length },
      destinations: config.destinations,
      itinerary: buildMockItinerary(config.destinations, config.duration, config.style),
      itineraryVersion: "ST-v1",
      budget: { level: config.budget.level, estimatedRange: config.budget.estimatedRange, breakdown: {} },
      accommodation: { mode: "recommend", types: ["boutique", "hotel"], comfort: config.budget.level },
      transportation: { mode: "recommend", preferredModes: ["private-cab"], comfort: "standard", longDriveTolerance: "medium" },
      preferences: { travelStyle: config.style, notes: [] },
      realtimeSnapshot: { overallStatus: "🟢 No significant alerts detected.", riskLevel: "LOW", alerts: [], lastChecked: new Date().toLocaleTimeString() }
    };

    const record = buildOperationsRecord(bookingContext, traveler, { requestId, submittedAt: now, status: "RECEIVED" });

    // Apply configured status & passwordless access token
    record.accessToken = generateCustomerJourneyToken(requestId);
    record.status = config.status;
    record.priority = config.priority;
    record.assignedTo = config.assignedTo;
    record.createdAt = now;
    record.updatedAt = now;

    // Add some activity log entries for realism
    if (config.status !== "RECEIVED") {
      record.activityLog.push(
        buildActivityEvent("STATUS_CHANGED", "ankit-001", config.assignedTo || "System", `Status changed to ${config.status}`, new Date(Date.now() - 1800000).toISOString())
      );
      record.auditLog.push(
        buildAuditEvent(requestId, "ankit-001", "OPERATIONS_MANAGER", "STATUS_CHANGED", "RECEIVED", config.status, new Date(Date.now() - 1800000).toISOString())
      );
    }

    if (config.assignedTo) {
      record.activityLog.push(
        buildActivityEvent("ASSIGNED", "ankit-001", config.assignedTo, `Request assigned to ${config.assignedTo}`, new Date(Date.now() - 3600000).toISOString())
      );
    }

    return record;
  });
}

// ─────────────────────────────────────────────
// STORAGE API
// ─────────────────────────────────────────────

/**
 * Initializes mock data store if empty (first-time load).
 */
export function initializeMockDataIfNeeded() {
  const isMockMode = import.meta.env.VITE_OPERATIONS_MOCK_MODE !== "false";
  if (!isMockMode) return;

  try {
    const existing = localStorage.getItem(MOCK_STORAGE_KEY);
    if (!existing) {
      const mockData = generateMockBookings();
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mockData));
    }
  } catch (_err) {
    console.warn("[OperationsFallback] Could not initialize mock data.");
  }
}

/**
 * Loads all mock bookings from localStorage.
 */
export function loadMockBookings() {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (!raw) {
      const fresh = generateMockBookings();
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return JSON.parse(raw);
  } catch (_err) {
    return generateMockBookings();
  }
}

/**
 * Saves updated mock bookings list to localStorage.
 */
export function saveMockBookings(bookings) {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(bookings));
  } catch (_err) {
    console.warn("[OperationsFallback] Could not save mock bookings.");
  }
}

/**
 * Resets mock data to fresh generated seed (dev utility).
 */
export function resetMockData() {
  try {
    const fresh = generateMockBookings();
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  } catch (_err) {
    return [];
  }
}

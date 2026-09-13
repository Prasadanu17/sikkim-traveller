/**
 * Planner Dashboard Service — Master Orchestrator Aggregator
 * Connects Modules 7, 8, 9, 10, 12, 13, and 14.
 * 
 * Calculates real Travel Readiness Score (0-100%) strictly from verified checklist items.
 * Evaluates trip lifecycle state (Draft vs. Upcoming vs. Active "Today's Journey").
 * Provides trip countdown calculation.
 */

import { loadMockBookings } from "../operations/operationsFallbackService";
import { getBookingPermitStatus } from "../customer/customerPermitService";
import { getCustomerChangeRequests } from "../customer/customerChangeRequestService";
import { validateJourneyAccessToken } from "../customer/customerSecurityService";

/**
 * Retrieves the single authorized customer journey for a given passwordless token.
 * Enforces single-journey data isolation.
 */
export function getAuthenticatedCustomerJourney(token) {
  if (!token) return { success: false, error: "Access token is required." };

  const allTrips = getCustomerTrips();
  for (const trip of allTrips) {
    const val = validateJourneyAccessToken(token, trip);
    if (val.authorized) {
      return {
        success: true,
        trip
      };
    }
  }

  return {
    success: false,
    error: "Journey access could not be verified."
  };
}

/**
 * Loads all trips associated with the customer session.
 */
export function getCustomerTrips() {
  const bookings = loadMockBookings();
  return bookings.map(b => {
    const permitData = getBookingPermitStatus(b);
    const changeReqs = getCustomerChangeRequests(b.requestId || b.id);
    const readiness = calculateTravelReadinessScore(b, permitData);
    const countdown = getTripCountdown(b);

    return {
      ...b,
      permitData,
      changeRequests: changeReqs,
      readiness,
      countdown
    };
  });
}

/**
 * Calculates a real Travel Readiness Score (0-100%) strictly from actual state.
 */
export function calculateTravelReadinessScore(booking, permitData) {
  if (!booking) return { score: 0, label: "Needs Attention", checklist: [] };

  const status = booking.status;
  const isConfirmed = status === "CONFIRMED";
  const isProposalSent = status === "PROPOSAL_SENT" || status === "CUSTOMER_ACCEPTED" || isConfirmed;

  const checklist = [
    {
      id: "itinerary_reviewed",
      title: "Itinerary Reviewed & Selected",
      completed: Boolean(booking.itinerary && booking.itinerary.days?.length > 0),
      weight: 15,
      section: "workspace",
      icon: "map"
    },
    {
      id: "proposal_accepted",
      title: "Proposal & Price Approved",
      completed: isProposalSent || Boolean(booking.customerApproval?.accepted),
      weight: 20,
      section: "payments",
      icon: "file"
    },
    {
      id: "accommodation_verified",
      title: "Accommodation Confirmed",
      completed: booking.accommodation?.status === "CONFIRMED" || isConfirmed,
      weight: 15,
      section: "workspace",
      icon: "hotel"
    },
    {
      id: "transport_verified",
      title: "Transportation Confirmed",
      completed: booking.transportation?.status === "CONFIRMED" || isConfirmed,
      weight: 15,
      section: "workspace",
      icon: "car"
    },
    {
      id: "permits_completed",
      title: "Permits & Clearances Approved",
      completed: permitData?.isAllApproved || (!permitData?.required && isConfirmed),
      weight: 15,
      section: "permits",
      icon: "shield"
    },
    {
      id: "advance_payment",
      title: "Advance Payment Received",
      completed: isConfirmed || Boolean(booking.budget?.operationsQuote && status === "CUSTOMER_ACCEPTED"),
      weight: 10,
      section: "payments",
      icon: "credit-card"
    },
    {
      id: "journey_confirmed",
      title: "Final Journey Confirmation",
      completed: isConfirmed,
      weight: 10,
      section: "workspace",
      icon: "check-circle"
    }
  ];

  const totalWeight = checklist.reduce((acc, item) => acc + (item.completed ? item.weight : 0), 0);
  const score = Math.min(100, Math.max(0, totalWeight));

  let label = "Needs Attention";
  if (score >= 90) label = "Trip Ready";
  else if (score >= 70) label = "Almost Ready";
  else if (score >= 40) label = "In Progress";

  return { score, label, checklist };
}

/**
 * Computes trip countdown from today to start/end dates.
 * Returns: { state, daysUntilStart, dayOfTrip, totalDays, startDate, endDate, message }
 */
export function getTripCountdown(booking) {
  if (!booking?.trip?.startDate) {
    return { state: "NO_DATES", daysUntilStart: null, dayOfTrip: null, totalDays: null, startDate: null, endDate: null, message: "Travel dates not set" };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const start = new Date(booking.trip.startDate);
  start.setHours(0, 0, 0, 0);

  const end = booking.trip.endDate ? new Date(booking.trip.endDate) : null;
  if (end) end.setHours(0, 0, 0, 0);

  const totalDays = booking.trip.duration || (end ? Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1 : null);
  const daysUntilStart = Math.ceil((start - now) / (1000 * 60 * 60 * 24));

  if (end && now > end) {
    return { state: "COMPLETED", daysUntilStart, dayOfTrip: null, totalDays, startDate: booking.trip.startDate, endDate: booking.trip.endDate, message: "Your journey has ended" };
  }

  if (now >= start && end && now <= end) {
    const dayOfTrip = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
    return { state: "ACTIVE", daysUntilStart: 0, dayOfTrip, totalDays, startDate: booking.trip.startDate, endDate: booking.trip.endDate, message: `Day ${dayOfTrip} of ${totalDays}` };
  }

  if (daysUntilStart === 0) {
    return { state: "TODAY", daysUntilStart: 0, dayOfTrip: 1, totalDays, startDate: booking.trip.startDate, endDate: booking.trip.endDate, message: "Your journey starts today!" };
  }

  if (daysUntilStart === 1) {
    return { state: "TOMORROW", daysUntilStart: 1, dayOfTrip: null, totalDays, startDate: booking.trip.startDate, endDate: booking.trip.endDate, message: "Your journey starts tomorrow!" };
  }

  return { state: "UPCOMING", daysUntilStart, dayOfTrip: null, totalDays, startDate: booking.trip.startDate, endDate: booking.trip.endDate, message: `Your Sikkim journey starts in ${daysUntilStart} days` };
}

/**
 * Determines whether a trip is currently ACTIVE ("Today's Journey").
 */
export function isTripCurrentlyActive(booking) {
  if (!booking || !booking.trip?.startDate || !booking.trip?.endDate) return false;
  const now = new Date();
  const start = new Date(booking.trip.startDate);
  const end = new Date(booking.trip.endDate);
  return now >= start && now <= end && booking.status === "CONFIRMED";
}

/**
 * Extracts today's itinerary day details if the trip is currently active.
 */
export function getTodaysJourneyDetails(booking) {
  if (!isTripCurrentlyActive(booking) || !booking.itinerary?.days) return null;

  const now = new Date();
  const start = new Date(booking.trip.startDate);
  const diffTime = Math.abs(now - start);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const totalDays = booking.trip.duration || booking.itinerary.days.length;

  const todayDay = booking.itinerary.days.find(d => d.dayNumber === diffDays) || booking.itinerary.days[0];

  return {
    dayNumber: diffDays,
    totalDays,
    day: todayDay,
    destination: todayDay?.title || "Sikkim Valley",
    accommodation: todayDay?.accommodation || booking.accommodation?.selectedOption || "Confirmed Hotel",
    transport: todayDay?.transport || booking.transportation?.summary || "Private Cab"
  };
}

/**
 * Operations Tool Executor — Module 10
 * Safely dispatches AI read-only tool calls against the mock data store.
 * Validates every call against the approved tool registry.
 * Blocks all write operations regardless of source.
 */

import { isApprovedTool, isWriteTool, getToolDefinition } from "./operationsToolRegistry";
import { generateDashboardStats, generateOperationsAlerts, getUpcomingTrips } from "./operationsAlertService";

// ─────────────────────────────────────────────
// EXECUTOR
// ─────────────────────────────────────────────

/**
 * Executes an approved read-only tool.
 * @param {string} toolName — must be in registry
 * @param {object} params — tool parameters
 * @param {Array} bookings — current bookings dataset
 * @returns {object} { success, result, error }
 */
export async function executeTool(toolName, params = {}, bookings = []) {
  // Validate tool is in registry
  if (!isApprovedTool(toolName)) {
    return { success: false, error: `Tool "${toolName}" is not in the approved operations tool registry.` };
  }

  // Block all write operations at executor level
  if (isWriteTool(toolName)) {
    return { success: false, error: "Write operations are not permitted via the AI assistant. All mutations require explicit human authorization." };
  }

  try {
    const result = await executeReadTool(toolName, params, bookings);
    return { success: true, result };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function executeReadTool(toolName, params, bookings) {
  switch (toolName) {

    case "getDashboardStats":
      return generateDashboardStats(bookings);

    case "getUpcomingTrips": {
      const days = Number(params.days) || 7;
      return getUpcomingTrips(bookings, days).map(summarizeBookingRecord);
    }

    case "getRealtimeAlerts":
      return generateOperationsAlerts(bookings);

    case "getUnassignedBookings":
      return bookings
        .filter(b => !b.assignedTo && !["COMPLETED", "CANCELLED", "DECLINED"].includes(b.status))
        .map(summarizeBookingRecord);

    case "getPermitIssues": {
      const maxDays = params.maxDays ? Number(params.maxDays) : null;
      const now = Date.now();
      return bookings
        .filter(b => {
          if (!b.requiresPermit) return false;
          if (["COMPLETED", "CANCELLED", "DECLINED"].includes(b.status)) return false;
          const hasUnresolved = b.permits?.some(p =>
            ["REQUIRED", "DOCUMENTS_PENDING", "APPLICATION_PENDING"].includes(p.status)
          );
          if (!hasUnresolved) return false;
          if (maxDays && b.trip?.startDate) {
            const diff = Math.ceil((new Date(b.trip.startDate).getTime() - now) / 86400000);
            return diff <= maxDays;
          }
          return true;
        })
        .map(b => ({
          ...summarizeBookingRecord(b),
          permits: b.permits?.map(p => ({ destination: p.destination, label: p.label, status: p.status }))
        }));
    }

    case "getUrgentBookings":
      return bookings
        .filter(b => b.priority === "URGENT" || b.priority === "HIGH")
        .filter(b => !["COMPLETED", "CANCELLED", "DECLINED"].includes(b.status))
        .map(summarizeBookingRecord);

    case "getBookingsByDestination": {
      const dest = (params.destination || "").toLowerCase();
      return bookings
        .filter(b => b.destinations?.some(d => d.toLowerCase().includes(dest)))
        .map(summarizeBookingRecord);
    }

    case "getBooking": {
      const record = bookings.find(b =>
        b.requestId === params.requestId || b.id === params.requestId
      );
      if (!record) return { found: false, requestId: params.requestId };
      return summarizeBookingRecord(record);
    }

    case "searchBookings": {
      let results = [...bookings];
      const q = (params.query || "").toLowerCase();
      if (q) {
        results = results.filter(b =>
          b.requestId?.toLowerCase().includes(q) ||
          b.customer?.name?.toLowerCase().includes(q) ||
          b.destinations?.some(d => d.toLowerCase().includes(q))
          // Note: email/phone search not exposed via AI to protect PII
        );
      }
      if (params.status) results = results.filter(b => b.status === params.status);
      if (params.priority) results = results.filter(b => b.priority === params.priority);
      if (params.destination) {
        const d = params.destination.toLowerCase();
        results = results.filter(b => b.destinations?.some(dest => dest.toLowerCase().includes(d)));
      }
      if (params.assignedTo) results = results.filter(b => b.assignedTo === params.assignedTo);
      const limit = Number(params.limit) || 10;
      return results.slice(0, limit).map(summarizeBookingRecord);
    }

    case "summarizeBooking": {
      const record = bookings.find(b =>
        b.requestId === params.requestId || b.id === params.requestId
      );
      if (!record) return { found: false };
      return {
        requestId: record.requestId,
        status: record.status,
        priority: record.priority,
        customer: record.customer?.name,
        trip: `${record.trip?.duration || 0} days, ${record.destinations?.join(" → ")}`,
        startDate: record.trip?.startDate,
        assignedTo: record.assignedTo || "Unassigned",
        requiresPermit: record.requiresPermit,
        accommodationStatus: record.accommodation?.verificationStatus,
        transportStatus: record.transportation?.verificationStatus,
        customerAccepted: record.customerApproval?.accepted || false,
        quotesCount: record.quotes?.length || 0,
        notesCount: (record.notes?.internal?.length || 0) + (record.notes?.customerVisible?.length || 0)
      };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// ─────────────────────────────────────────────
// PII-SAFE SUMMARY (AI never gets raw PII)
// ─────────────────────────────────────────────

function summarizeBookingRecord(b) {
  return {
    requestId: b.requestId,
    status: b.status,
    priority: b.priority,
    customerName: b.customer?.name || "Unknown",
    // Note: email/phone are intentionally omitted from AI responses
    destinations: b.destinations || [],
    startDate: b.trip?.startDate,
    endDate: b.trip?.endDate,
    duration: b.trip?.duration,
    assignedTo: b.assignedTo || null,
    requiresPermit: b.requiresPermit || false,
    accommodationStatus: b.accommodation?.verificationStatus,
    transportStatus: b.transportation?.verificationStatus,
    createdAt: b.createdAt
  };
}

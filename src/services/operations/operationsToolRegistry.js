/**
 * Operations Tool Registry — Module 10
 * Defines ALL approved read-only tools available to the AI Operations Assistant.
 * AI MUST only use tools defined here.
 * All tools are read-only (isWriteOperation: false).
 * No arbitrary SQL or database access is permitted.
 */

export const OPERATIONS_TOOLS = [
  {
    name: "searchBookings",
    description: "Search and filter bookings by status, priority, destination, customer name, or date range.",
    isWriteOperation: false,
    paramSchema: {
      query: { type: "string", optional: true },
      status: { type: "string", optional: true },
      priority: { type: "string", optional: true },
      destination: { type: "string", optional: true },
      dateFrom: { type: "string", optional: true },
      dateTo: { type: "string", optional: true },
      assignedTo: { type: "string", optional: true },
      limit: { type: "number", optional: true, default: 10 }
    }
  },
  {
    name: "getBooking",
    description: "Get details of a specific booking by its request ID.",
    isWriteOperation: false,
    paramSchema: {
      requestId: { type: "string", required: true }
    }
  },
  {
    name: "getUpcomingTrips",
    description: "Get a list of upcoming trips in the next N days.",
    isWriteOperation: false,
    paramSchema: {
      days: { type: "number", optional: true, default: 7 }
    }
  },
  {
    name: "getPermitIssues",
    description: "Get all bookings that have unresolved permit requirements.",
    isWriteOperation: false,
    paramSchema: {
      maxDays: { type: "number", optional: true, description: "Filter to trips within N days" }
    }
  },
  {
    name: "getUnassignedBookings",
    description: "Get all unassigned booking requests.",
    isWriteOperation: false,
    paramSchema: {}
  },
  {
    name: "getRealtimeAlerts",
    description: "Get current realtime travel alerts affecting bookings.",
    isWriteOperation: false,
    paramSchema: {}
  },
  {
    name: "summarizeBooking",
    description: "Generate a natural language summary of a specific booking record.",
    isWriteOperation: false,
    paramSchema: {
      requestId: { type: "string", required: true }
    }
  },
  {
    name: "getDashboardStats",
    description: "Get current dashboard KPI statistics — new requests, under review, upcoming trips, etc.",
    isWriteOperation: false,
    paramSchema: {}
  },
  {
    name: "getBookingsByDestination",
    description: "Get all bookings that include a specific destination.",
    isWriteOperation: false,
    paramSchema: {
      destination: { type: "string", required: true }
    }
  },
  {
    name: "getUrgentBookings",
    description: "Get all high-priority or urgent bookings requiring immediate attention.",
    isWriteOperation: false,
    paramSchema: {}
  }
];

/**
 * Returns a tool definition by name, or null if not in registry.
 */
export function getToolDefinition(toolName) {
  return OPERATIONS_TOOLS.find(t => t.name === toolName) || null;
}

/**
 * Checks if a tool name is in the approved registry.
 */
export function isApprovedTool(toolName) {
  return OPERATIONS_TOOLS.some(t => t.name === toolName);
}

/**
 * Checks if a tool is a write operation. All current tools are read-only.
 */
export function isWriteTool(toolName) {
  const tool = getToolDefinition(toolName);
  return tool ? tool.isWriteOperation : false;
}

/**
 * Booking Status Service.
 * Tracks and manages the status of submitted booking requests.
 * Supported States: DRAFT | READY | SUBMITTED | RECEIVED | UNDER_REVIEW | AWAITING_CONFIRMATION | CONFIRMED | DECLINED | CANCELLED
 */

const STATUS_KEY_PREFIX = "st_booking_status_";

/**
 * Saves or updates status info for a request.
 */
export function saveBookingStatus(requestId, statusDetails) {
  if (!requestId) return;
  try {
    const data = {
      requestId,
      status: statusDetails.status || "RECEIVED",
      history: statusDetails.history || [
        { status: "RECEIVED", timestamp: new Date().toISOString(), message: "Request successfully received by the system." }
      ],
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`${STATUS_KEY_PREFIX}${requestId}`, JSON.stringify(data));
  } catch (err) {
    console.error("[BookingStatusService] Failed to write status data:", err);
  }
}

/**
 * Retrieves the status of a specific booking request.
 */
export function getBookingStatus(requestId) {
  if (!requestId) return null;
  try {
    const raw = localStorage.getItem(`${STATUS_KEY_PREFIX}${requestId}`);
    if (!raw) {
      // Return a default initial state if not found (e.g. fallback)
      return {
        requestId,
        status: "RECEIVED",
        history: [
          { status: "RECEIVED", timestamp: new Date().toISOString(), message: "Request received." }
        ],
        updatedAt: new Date().toISOString()
      };
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn("[BookingStatusService] Failed to read status data:", err);
    return null;
  }
}

/**
 * Simulates workflow progress updates from travel operations.
 * Allows travelers to experience how the tracker responds to live status updates.
 */
export function simulateOperationsStatusUpdate(requestId) {
  const current = getBookingStatus(requestId);
  if (!current) return;

  const statusWorkflow = ["RECEIVED", "UNDER_REVIEW", "AWAITING_CONFIRMATION"];
  const currentIndex = statusWorkflow.indexOf(current.status);

  if (currentIndex === -1 || currentIndex === statusWorkflow.length - 1) {
    return; // Already at the end of frontend simulation or custom status
  }

  const nextStatus = statusWorkflow[currentIndex + 1];
  let msg = "";

  if (nextStatus === "UNDER_REVIEW") {
    msg = "Sikkim Traveller operations team is verifying stay availability and vehicle routes.";
  } else if (nextStatus === "AWAITING_CONFIRMATION") {
    msg = "Accommodation & permits pre-verified. Awaiting traveler final travel approval.";
  }

  const updatedHistory = [
    ...current.history,
    { status: nextStatus, timestamp: new Date().toISOString(), message: msg }
  ];

  const updated = {
    ...current,
    status: nextStatus,
    history: updatedHistory
  };

  saveBookingStatus(requestId, updated);
  return updated;
}

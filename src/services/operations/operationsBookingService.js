/**
 * Operations Booking Service — Module 10
 * CRUD operations for booking records with audit trail and status validation.
 * All mutations are validated by the status engine and recorded in the audit log.
 */

import { loadMockBookings, saveMockBookings } from "./operationsFallbackService";
import { isValidTransition } from "./operationsStatusService";
import { recordEvent, appendAuditEvent, AUDIT_ACTIONS } from "./operationsAuditService";
import { buildConfirmationSnapshot } from "./operationsContextService";

// ─────────────────────────────────────────────
// READ OPERATIONS
// ─────────────────────────────────────────────

/**
 * Returns all bookings from store, applying optional filters.
 */
export function getBookings(filters = {}) {
  const bookings = loadMockBookings();
  let results = [...bookings];

  // Status filter
  if (filters.status && filters.status !== "ALL") {
    results = results.filter(b => b.status === filters.status);
  }

  // Priority filter
  if (filters.priority && filters.priority !== "ALL") {
    results = results.filter(b => b.priority === filters.priority);
  }

  // Destination filter
  if (filters.destination) {
    const d = filters.destination.toLowerCase();
    results = results.filter(b => b.destinations?.some(dest => dest.toLowerCase().includes(d)));
  }

  // Date range filter (trip start date)
  if (filters.dateFrom) {
    results = results.filter(b => b.trip?.startDate >= filters.dateFrom);
  }
  if (filters.dateTo) {
    results = results.filter(b => b.trip?.startDate <= filters.dateTo);
  }

  // Assigned operator filter
  if (filters.assignedTo) {
    results = results.filter(b => b.assignedTo === filters.assignedTo);
  }

  // Permit required filter
  if (filters.requiresPermit === true || filters.requiresPermit === "true") {
    results = results.filter(b => b.requiresPermit === true);
  }

  // Priority urgent only
  if (filters.urgentOnly) {
    results = results.filter(b => b.priority === "URGENT" || b.priority === "HIGH");
  }

  // Unassigned only
  if (filters.unassignedOnly) {
    results = results.filter(b => !b.assignedTo);
  }

  // Search query (safe client-side search — no raw SQL)
  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(b =>
      b.requestId?.toLowerCase().includes(q) ||
      b.customer?.name?.toLowerCase().includes(q) ||
      b.customer?.email?.toLowerCase().includes(q) ||
      b.customer?.phone?.includes(q) ||
      b.destinations?.some(d => d.toLowerCase().includes(q))
    );
  }

  // Sort
  const sort = filters.sort || "newest";
  if (sort === "newest") results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  else if (sort === "oldest") results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  else if (sort === "tripDate") results.sort((a, b) => new Date(a.trip?.startDate || 0) - new Date(b.trip?.startDate || 0));
  else if (sort === "priority") {
    const order = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
    results.sort((a, b) => (order[a.priority] || 99) - (order[b.priority] || 99));
  }
  else if (sort === "budget") {
    results.sort((a, b) => (b.budget?.aiEstimate?.max || 0) - (a.budget?.aiEstimate?.max || 0));
  }

  return results;
}

/**
 * Gets a single booking by ID.
 */
export function getBookingById(id) {
  const bookings = loadMockBookings();
  return bookings.find(b => b.id === id || b.requestId === id) || null;
}

// ─────────────────────────────────────────────
// WRITE OPERATIONS (All require actorId + actorRole)
// ─────────────────────────────────────────────

/**
 * Generic update function. Validates version for optimistic concurrency.
 */
function updateAndSave(id, updaterFn, actor) {
  const bookings = loadMockBookings();
  const index = bookings.findIndex(b => b.id === id || b.requestId === id);
  if (index === -1) return { success: false, error: "Booking not found." };

  const current = bookings[index];

  // Optimistic concurrency check
  if (actor.expectedVersion !== undefined && current.version !== actor.expectedVersion) {
    return {
      success: false,
      error: "Booking was updated by another operator. Refresh before continuing.",
      conflict: true,
      currentVersion: current.version
    };
  }

  const updated = updaterFn(current);
  updated.version = (current.version || 1) + 1;
  updated.updatedAt = new Date().toISOString();

  bookings[index] = updated;
  saveMockBookings(bookings);
  return { success: true, booking: updated };
}

/**
 * Changes booking status. Validates transition is valid.
 */
export function changeStatus(id, newStatus, actorId, actorRole, actorName, expectedVersion) {
  return updateAndSave(id, (record) => {
    if (!isValidTransition(record.status, newStatus)) {
      throw new Error(`Invalid transition: ${record.status} → ${newStatus}`);
    }

    let updated = { ...record, status: newStatus };
    updated = recordEvent(updated, {
      actorId, actorRole, actorName,
      action: AUDIT_ACTIONS.STATUS_CHANGED,
      previousValue: record.status,
      newValue: newStatus,
      activityMessage: `Status changed from ${record.status} to ${newStatus} by ${actorName}.`
    });
    return updated;
  }, { expectedVersion });
}

/**
 * Assigns a booking to an operator.
 */
export function assignBooking(id, staffName, staffRole, actorId, actorRole, actorName) {
  return updateAndSave(id, (record) => {
    let updated = { ...record, assignedTo: staffName };
    updated = recordEvent(updated, {
      actorId, actorRole, actorName,
      action: AUDIT_ACTIONS.ASSIGNED,
      previousValue: record.assignedTo || "Unassigned",
      newValue: staffName,
      activityMessage: `Assigned to ${staffName} (${staffRole}) by ${actorName}.`
    });
    return updated;
  }, {});
}

/**
 * Updates accommodation verification status and optionally adds a verified option.
 */
export function updateAccommodation(id, verificationStatus, option, actorId, actorRole, actorName) {
  return updateAndSave(id, (record) => {
    const accommodation = {
      ...record.accommodation,
      verificationStatus,
      options: option
        ? [...(record.accommodation?.options || []), { ...option, addedAt: new Date().toISOString(), addedBy: actorId }]
        : (record.accommodation?.options || [])
    };
    let updated = { ...record, accommodation };
    updated = recordEvent(updated, {
      actorId, actorRole, actorName,
      action: AUDIT_ACTIONS.ACCOMMODATION_UPDATED,
      previousValue: record.accommodation?.verificationStatus,
      newValue: verificationStatus,
      activityMessage: option
        ? `Accommodation option "${option.propertyName}" added. Status: ${verificationStatus}.`
        : `Accommodation status updated to ${verificationStatus}.`
    });
    return updated;
  }, {});
}

/**
 * Updates transportation verification and optionally assigns driver.
 */
export function updateTransportation(id, verificationStatus, option, driver, actorId, actorRole, actorName) {
  return updateAndSave(id, (record) => {
    const transportation = {
      ...record.transportation,
      verificationStatus,
      options: option
        ? [...(record.transportation?.options || []), { ...option, addedAt: new Date().toISOString(), addedBy: actorId }]
        : (record.transportation?.options || []),
      driver: driver || record.transportation?.driver
    };
    let updated = { ...record, transportation };
    updated = recordEvent(updated, {
      actorId, actorRole, actorName,
      action: AUDIT_ACTIONS.TRANSPORT_UPDATED,
      previousValue: record.transportation?.verificationStatus,
      newValue: verificationStatus,
      activityMessage: `Transport status updated to ${verificationStatus}${driver ? `. Driver: ${driver.name}` : ""}.`
    });
    return updated;
  }, {});
}

/**
 * Updates a permit record status. Note: APPROVED requires backend verification.
 */
export function updatePermit(id, permitId, updates, actorId, actorRole, actorName) {
  return updateAndSave(id, (record) => {
    const permits = (record.permits || []).map(p =>
      p.id === permitId ? { ...p, ...updates, lastUpdatedBy: actorId, lastUpdatedAt: new Date().toISOString() } : p
    );
    let updated = { ...record, permits };
    updated = recordEvent(updated, {
      actorId, actorRole, actorName,
      action: AUDIT_ACTIONS.PERMIT_UPDATED,
      previousValue: null,
      newValue: updates.status,
      activityMessage: `Permit for ${updates.destination || permitId} updated to ${updates.status || "unknown"}.`
    });
    return updated;
  }, {});
}

/**
 * Adds an internal note (never customer-visible).
 */
export function addInternalNote(id, text, actorId, actorRole, actorName) {
  return updateAndSave(id, (record) => {
    const note = {
      id: `NOTE-${Date.now()}`,
      text,
      addedBy: actorId,
      addedByName: actorName,
      addedByRole: actorRole,
      addedAt: new Date().toISOString(),
      isInternal: true
    };
    let updated = {
      ...record,
      notes: { ...record.notes, internal: [...(record.notes?.internal || []), note] }
    };
    updated = recordEvent(updated, {
      actorId, actorRole, actorName,
      action: AUDIT_ACTIONS.NOTE_ADDED,
      previousValue: null,
      newValue: "INTERNAL_NOTE",
      activityMessage: `Internal note added by ${actorName}.`
    });
    return updated;
  }, {});
}

/**
 * Adds a customer-visible note. Separated from internal notes.
 */
export function addCustomerNote(id, text, actorId, actorRole, actorName) {
  return updateAndSave(id, (record) => {
    const note = {
      id: `CNOTE-${Date.now()}`,
      text,
      addedBy: actorId,
      addedByName: actorName,
      addedByRole: actorRole,
      addedAt: new Date().toISOString(),
      isInternal: false
    };
    let updated = {
      ...record,
      notes: { ...record.notes, customerVisible: [...(record.notes?.customerVisible || []), note] }
    };
    updated = recordEvent(updated, {
      actorId, actorRole, actorName,
      action: AUDIT_ACTIONS.NOTE_ADDED,
      previousValue: null,
      newValue: "CUSTOMER_NOTE",
      activityMessage: `Customer-visible note added by ${actorName}.`
    });
    return updated;
  }, {});
}

/**
 * Adds a new itinerary revision (never overwrites original).
 */
export function addItineraryRevision(id, revision, reason, actorId, actorRole, actorName) {
  return updateAndSave(id, (record) => {
    const versionCount = (record.itineraryVersions || []).length;
    const newRevision = {
      ...revision,
      version: `ST-v${versionCount + 1}`,
      reason,
      isOriginal: false,
      createdAt: new Date().toISOString(),
      createdBy: actorId
    };
    let updated = {
      ...record,
      itineraryVersions: [...(record.itineraryVersions || []), newRevision]
    };
    updated = recordEvent(updated, {
      actorId, actorRole, actorName,
      action: AUDIT_ACTIONS.ITINERARY_REVISED,
      previousValue: `ST-v${versionCount}`,
      newValue: newRevision.version,
      activityMessage: `Itinerary revision ${newRevision.version} added. Reason: ${reason}.`
    });
    return updated;
  }, {});
}

/**
 * Confirms a journey. Creates immutable confirmation snapshot.
 * Backend MUST re-verify all conditions before accepting this.
 */
export function confirmJourney(id, actorId, actorRole, actorName, expectedVersion) {
  return updateAndSave(id, (record) => {
    const snapshot = buildConfirmationSnapshot(record, actorId, actorRole);
    let updated = {
      ...record,
      status: "CONFIRMED",
      confirmation: snapshot
    };
    updated = recordEvent(updated, {
      actorId, actorRole, actorName,
      action: AUDIT_ACTIONS.CONFIRMED,
      previousValue: "READY_TO_CONFIRM",
      newValue: "CONFIRMED",
      activityMessage: `Journey confirmed by ${actorName}. Confirmation ID: ${snapshot.confirmationId}.`
    });
    return updated;
  }, { expectedVersion });
}

/**
 * Cancels a booking. Requires a reason.
 */
export function cancelBooking(id, reason, actorId, actorRole, actorName) {
  if (!reason?.trim()) return { success: false, error: "Cancellation reason is required." };
  return updateAndSave(id, (record) => {
    let updated = {
      ...record,
      status: "CANCELLED",
      cancellationReason: reason,
      cancelledBy: actorId,
      cancelledAt: new Date().toISOString()
    };
    updated = recordEvent(updated, {
      actorId, actorRole, actorName,
      action: AUDIT_ACTIONS.CANCELLED,
      previousValue: record.status,
      newValue: "CANCELLED",
      activityMessage: `Booking cancelled by ${actorName}. Reason: ${reason}.`
    });
    return updated;
  }, {});
}

/**
 * Declines a booking. Requires a reason.
 */
export function declineBooking(id, reason, actorId, actorRole, actorName) {
  if (!reason?.trim()) return { success: false, error: "Decline reason is required." };
  return updateAndSave(id, (record) => {
    let updated = {
      ...record,
      status: "DECLINED",
      declineReason: reason,
      declinedBy: actorId,
      declinedAt: new Date().toISOString()
    };
    updated = recordEvent(updated, {
      actorId, actorRole, actorName,
      action: AUDIT_ACTIONS.DECLINED,
      previousValue: record.status,
      newValue: "DECLINED",
      activityMessage: `Booking declined by ${actorName}. Reason: ${reason}.`
    });
    return updated;
  }, {});
}

/**
 * Updates realtime snapshot on a booking record.
 */
export function updateRealtimeSnapshot(id, snapshot, actorId, actorRole, actorName) {
  return updateAndSave(id, (record) => {
    let updated = { ...record, realtimeSnapshot: snapshot };
    updated = recordEvent(updated, {
      actorId, actorRole, actorName,
      action: AUDIT_ACTIONS.REALTIME_REFRESHED,
      previousValue: record.realtimeSnapshot?.lastChecked || null,
      newValue: snapshot.lastChecked || new Date().toISOString(),
      activityMessage: `Realtime intelligence refreshed by ${actorName}.`
    });
    return updated;
  }, {});
}

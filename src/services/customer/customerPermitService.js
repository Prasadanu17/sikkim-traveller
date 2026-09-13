/**
 * Customer Permit Service — Module 14
 * Manages destination-specific permit tracking (PAP / RAP) for restricted Sikkim destinations.
 * Provides document requirement checklists, approval status tracking, and warning badges.
 */

// Restricted destinations requiring Protected Area Permits (PAP) or Restricted Area Permits (RAP)
export const PERMIT_RESTRICTED_DESTINATIONS = {
  "nathula": { name: "Nathula Pass & Baba Mandir", type: "PAP", processingDays: 2, docsRequired: ["Passport / Voter ID / Aadhar", "Passport Size Photos (2)", "Vehicle Permit Form"] },
  "lachung": { name: "Lachung & Yumthang Valley", type: "PAP", processingDays: 2, docsRequired: ["Government Photo ID", "Passport Size Photos (2)"] },
  "yumthang": { name: "Yumthang Valley & Zero Point", type: "PAP", processingDays: 2, docsRequired: ["Government Photo ID", "Passport Size Photos (2)"] },
  "gurudongmar": { name: "Gurudongmar Lake & Lachen", type: "PAP", processingDays: 3, docsRequired: ["Government Photo ID", "Medical Self-Declaration", "Passport Photos (2)"] },
  "zuluk": { name: "Zuluk & Silk Route", type: "PAP", processingDays: 2, docsRequired: ["Government Photo ID", "Passport Photos (2)"] }
};

export const PERMIT_STATUSES = {
  NOT_REQUIRED: "NOT_REQUIRED",
  REQUIRED: "REQUIRED",
  DOCUMENTS_PENDING: "DOCUMENTS_PENDING",
  PROCESSING: "PROCESSING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
};

/**
 * Evaluates permit requirements for a booking based on itinerary destinations.
 */
export function getBookingPermitStatus(booking) {
  if (!booking) return { required: false, permits: [], warnings: [] };

  const destinations = booking.destinations || [];
  const permits = [];
  const warnings = [];

  destinations.forEach(destSlug => {
    const config = PERMIT_RESTRICTED_DESTINATIONS[destSlug.toLowerCase()];
    if (config) {
      // Find existing permit record if present in booking data
      const existing = (booking.permits || []).find(p => p.destinationSlug === destSlug.toLowerCase()) || {};
      
      const permitRecord = {
        permitId: existing.permitId || `PERMIT-${destSlug.toUpperCase()}-${booking.id || "REQ"}`,
        destinationSlug: destSlug,
        destinationName: config.name,
        permitType: config.type,
        status: existing.status || PERMIT_STATUSES.DOCUMENTS_PENDING,
        documentsSubmitted: existing.documentsSubmitted || false,
        docsRequired: config.docsRequired,
        issuedPassNumber: existing.issuedPassNumber || null,
        validUntil: existing.validUntil || null,
        rejectionReason: existing.rejectionReason || null,
        updatedAt: existing.updatedAt || new Date().toISOString()
      };

      permits.push(permitRecord);

      if (permitRecord.status === PERMIT_STATUSES.DOCUMENTS_PENDING) {
        warnings.push({
          type: "PERMIT_DOCS_NEEDED",
          severity: "IMPORTANT",
          message: `Documents required for ${config.name} (${config.type}) permit pass.`
        });
      } else if (permitRecord.status === PERMIT_STATUSES.PROCESSING) {
        warnings.push({
          type: "PERMIT_IN_PROGRESS",
          severity: "INFO",
          message: `Permit application for ${config.name} is currently under processing with District Collectorate.`
        });
      } else if (permitRecord.status === PERMIT_STATUSES.REJECTED) {
        warnings.push({
          type: "PERMIT_REJECTED",
          severity: "URGENT",
          message: `Permit application for ${config.name} was rejected: ${permitRecord.rejectionReason || "Check document eligibility."}`
        });
      }
    }
  });

  const isAllApproved = permits.length > 0 && permits.every(p => p.status === PERMIT_STATUSES.APPROVED);
  const hasPendingDocs = permits.some(p => p.status === PERMIT_STATUSES.DOCUMENTS_PENDING);

  return {
    required: permits.length > 0,
    isAllApproved,
    hasPendingDocs,
    permits,
    warnings
  };
}

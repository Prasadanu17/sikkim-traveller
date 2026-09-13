/**
 * Booking Fallback Service.
 * Leverages the existing verified contact channel (Web3Forms) to transmit booking requests
 * when the main backend booking API is unreachable.
 */

/**
 * Sends structured booking request data through Web3Forms as a fallback email channel.
 */
export async function sendWeb3FormsFallback(bookingContext, formData, draftRequestId = "") {
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
  
  if (!accessKey) {
    console.warn("[BookingFallbackService] Web3Forms access key not defined in env variables.");
    throw new Error("No contact fallback credentials configured.");
  }

  // Format a structured, human-readable summary for the operations team email
  const specialReqList = Object.entries(formData.specialRequirements || {})
    .filter(([key, val]) => val === true && key !== "otherDetails")
    .map(([key]) => key.replace(/([A-Z])/g, " $1").toLowerCase())
    .join(", ");

  const emailMessage = `
============================================================
SIKKIM TRAVELLER - BOOKING REQUEST (API FALLBACK)
============================================================
Draft ID: ${draftRequestId || "ST-DRAFT-FALLBACK"}
Timestamp: ${new Date().toISOString()}

PRIMARY TRAVELER:
------------------------------------------------------------
Name: ${formData.primaryTraveler?.fullName || "Not Provided"}
Email: ${formData.primaryTraveler?.email || "Not Provided"}
Phone: ${formData.primaryTraveler?.phone || "Not Provided"}
Location: ${formData.primaryTraveler?.location || "Not Provided"}
Preferred Contact: ${formData.contactPreference?.method} (${formData.contactPreference?.timeOfDay || "Anytime"})

TRIP SUMMARY:
------------------------------------------------------------
Route: ${(bookingContext.destinations || []).join(" → ") || "N/A"}
Dates: ${bookingContext.trip?.startDate || "Flexible"} to ${bookingContext.trip?.endDate || "Flexible"}
Duration: ${bookingContext.trip?.duration || 5} Days
Travelers: ${bookingContext.traveler?.total || 1} traveler(s) (${bookingContext.traveler?.type || "solo"})
  - Adults: ${bookingContext.traveler?.adults || 1}
  - Children: ${bookingContext.traveler?.children || 0}
  - Seniors: ${bookingContext.traveler?.seniors || 0}

PREFERENCES:
------------------------------------------------------------
Stay Comfort: ${bookingContext.accommodation?.comfort || "Standard"}
Stay Types: ${(bookingContext.accommodation?.types || []).join("/") || "Not specified"}
Transport Modes: ${(bookingContext.transportation?.preferredModes || []).join("/") || "Not specified"}
Budget Level: ${bookingContext.budget?.level || "comfortable"}
Estimated Budget Range: ₹${(bookingContext.budget?.estimatedRange?.min || 0).toLocaleString()} – ₹${(bookingContext.budget?.estimatedRange?.max || 0).toLocaleString()}

SPECIAL & ACCESSIBILITY REQUIREMENTS:
------------------------------------------------------------
Selected: ${specialReqList || "None"}
Details: ${formData.specialRequirements?.otherDetails || "None"}

REAL-TIME TRAVEL STATUS:
------------------------------------------------------------
Overall Status: ${bookingContext.realtimeSnapshot?.overallStatus || "Unknown"}
Risk Level: ${bookingContext.realtimeSnapshot?.riskLevel || "Unknown"}
Itinerary Version: ${bookingContext.itineraryVersion || "N/A"}
  `;

  const payload = {
    access_key: accessKey,
    subject: `⚠️ FALLBACK BOOKING REQUEST: ${formData.primaryTraveler?.fullName} - ${bookingContext.trip?.duration} Days`,
    from_name: "Sikkim Traveller Fallback System",
    name: formData.primaryTraveler?.fullName,
    email: formData.primaryTraveler?.email,
    phone: formData.primaryTraveler?.phone,
    message: emailMessage
  };

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || `HTTP Fallback submit failed: ${response.status}`);
  }

  return {
    success: true,
    requestId: draftRequestId || `ST-FALLBACK-${Date.now()}`,
    status: "RECEIVED",
    submittedAt: new Date().toISOString()
  };
}

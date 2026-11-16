/**
 * src/services/calendar/icsExportService.js
 * RFC 5545 compliant iCalendar (.ics) generator for Sikkim Traveller itineraries.
 * Works with Google Calendar, Apple Calendar, and Microsoft Outlook.
 */

/**
 * Escapes characters for iCalendar text values per RFC 5545 Section 3.3.11:
 * Backslash, semicolon, comma, and newline.
 */
export function escapeIcsText(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Folds lines longer than 75 octets according to RFC 5545 Section 3.1.
 */
export function foldIcsLine(line) {
  if (line.length <= 75) return line;

  const chunks = [];
  let remaining = line;

  // First chunk up to 75 chars
  chunks.push(remaining.substring(0, 75));
  remaining = remaining.substring(75);

  // Subsequent chunks up to 74 chars (plus leading space)
  while (remaining.length > 0) {
    chunks.push(" " + remaining.substring(0, 74));
    remaining = remaining.substring(74);
  }

  return chunks.join("\r\n");
}

/**
 * Formats a Date object to YYYYMMDD string for all-day events.
 */
export function formatDateToIcsDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * Formats a Date object to UTC timestamp string (YYYYMMDDTHHMMSSZ).
 */
export function formatDateToIcsTimestamp(date = new Date()) {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Generates an RFC 5545 compliant .ics string from an itinerary and optional base date.
 */
export function generateItineraryIcs(itinerary, options = {}) {
  if (!itinerary || !itinerary.days || !Array.isArray(itinerary.days) || itinerary.days.length === 0) {
    throw new Error("Cannot generate calendar: Itinerary has no scheduled days.");
  }

  // Determine starting date
  let startDate = null;
  if (options.startDate) {
    startDate = new Date(options.startDate);
  } else if (itinerary.dates?.start) {
    startDate = new Date(itinerary.dates.start);
  }

  // If no date is given, default to 14 days in the future
  if (!startDate || isNaN(startDate.getTime())) {
    startDate = new Date();
    startDate.setDate(startDate.getDate() + 14);
    startDate.setHours(0, 0, 0, 0);
  }

  const tripTitle = itinerary.tripTitle || "Sikkim Travel Itinerary";
  const nowStamp = formatDateToIcsTimestamp();

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sikkim Traveller//AI Trip Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(tripTitle)}`,
    "X-WR-TIMEZONE:Asia/Kolkata"
  ];

  itinerary.days.forEach((day, index) => {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + index);

    // End date for all-day events in RFC 5545 is non-inclusive (the next day)
    const nextDayDate = new Date(dayDate);
    nextDayDate.setDate(nextDayDate.getDate() + 1);

    const dtStart = formatDateToIcsDate(dayDate);
    const dtEnd = formatDateToIcsDate(nextDayDate);

    const location = day.baseLocation || "Sikkim, India";
    const summary = `Day ${day.dayNumber}: ${day.title || location}`;

    // Assemble detailed description
    const descParts = [];
    descParts.push(`Sikkim Traveller: Day ${day.dayNumber}`);
    descParts.push(`Base Location: ${location}`);

    if (day.morningActivities && day.morningActivities.length > 0) {
      descParts.push("\n[Morning Activities]");
      day.morningActivities.forEach((act) => {
        descParts.push(`• ${act.title}: ${act.description || ""}`);
      });
    }

    if (day.afternoonActivities && day.afternoonActivities.length > 0) {
      descParts.push("\n[Afternoon Activities]");
      day.afternoonActivities.forEach((act) => {
        descParts.push(`• ${act.title}: ${act.description || ""}`);
      });
    }

    if (day.eveningActivities && day.eveningActivities.length > 0) {
      descParts.push("\n[Evening Activities]");
      day.eveningActivities.forEach((act) => {
        descParts.push(`• ${act.title}: ${act.description || ""}`);
      });
    }

    if (day.travelSegments && day.travelSegments.length > 0) {
      descParts.push("\n[Road Transit]");
      day.travelSegments.forEach((seg) => {
        descParts.push(`• ${seg.from} → ${seg.to} (${seg.duration || "Mountain Drive"}, ${seg.mode || "SUV"})`);
      });
    }

    if (day.stay) {
      descParts.push(`\n[Accommodation]\n• ${day.stay.name || "Stay in " + location} (${day.stay.type || "Hotel"})`);
    }

    if (day.dayNotes && day.dayNotes.length > 0) {
      descParts.push("\n[Notes & Tips]");
      day.dayNotes.forEach((note) => descParts.push(`• ${note}`));
    }

    const rawDescription = descParts.join("\n");
    const escapedDesc = escapeIcsText(rawDescription);
    const escapedSummary = escapeIcsText(summary);
    const escapedLocation = escapeIcsText(location);

    const uid = `sikkim-day-${day.dayNumber}-${nowStamp}-${index}@sikkim-traveller.com`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
    lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
    lines.push(`SUMMARY:${escapedSummary}`);
    lines.push(`DESCRIPTION:${escapedDesc}`);
    lines.push(`LOCATION:${escapedLocation}`);
    lines.push("STATUS:CONFIRMED");
    lines.push("TRANSP:TRANSPARENT"); // Does not block out calendar busy time
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");

  // Apply RFC 5545 line folding and CRLF line terminators
  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}

/**
 * Browser-side download trigger for the generated .ics file.
 */
export function downloadItineraryIcs(itinerary, options = {}) {
  const icsContent = generateItineraryIcs(itinerary, options);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const filename = `${(itinerary.tripTitle || "sikkim-itinerary").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);

  return { success: true, filename };
}


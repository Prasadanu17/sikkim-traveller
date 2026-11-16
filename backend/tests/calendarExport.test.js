/**
 * backend/tests/calendarExport.test.js
 * Automated test suite for Submodule D.2: Calendar Export (.ics)
 * Covers:
 * 1. RFC 5545 valid calendar structure (headers, version, prodid)
 * 2. Multi-day event generation matching itinerary schedule
 * 3. Exact date calculation and non-inclusive DTEND for all-day events
 * 4. Special character escaping (\, ;, ,, \n)
 * 5. All-day event handling without inventing artificial times
 * 6. Line folding to ensure compliance with 75-octet limits
 * 7. Error handling for empty or invalid itineraries
 */

import { describe, it, expect } from "vitest";
import {
  generateItineraryIcs,
  escapeIcsText,
  foldIcsLine,
  formatDateToIcsDate
} from "../../src/services/calendar/icsExportService.js";

describe("Submodule D.2: Calendar Export (.ics)", () => {
  const sampleItinerary = {
    tripTitle: "Sikkim Himalayan Adventure, 2026; Special Edition",
    overview: { duration: 3 },
    dates: { start: "2026-10-15" },
    days: [
      {
        dayNumber: 1,
        title: "Arrive Gangtok & Explore MG Marg",
        baseLocation: "Gangtok",
        morningActivities: [
          { title: "Scenic drive from Bagdogra", description: "Scenic mountain road transfer via Teesta River." }
        ],
        afternoonActivities: [
          { title: "Check-in & Stroll", description: "Explore local cafes, bakeries, and curio shops." }
        ],
        eveningActivities: [
          { title: "MG Marg Promenade", description: "Dinner at local Sikkimese restaurant; try momos & thukpa." }
        ],
        stay: { name: "Netuk House", type: "Heritage Homestay" },
        dayNotes: ["Keep warm jackets ready for cool evening temperatures."]
      },
      {
        dayNumber: 2,
        title: "Excursion to Tsomgo Lake & Nathula Pass",
        baseLocation: "Tsomgo Lake",
        travelSegments: [
          { from: "Gangtok", to: "Tsomgo Lake", duration: "2 hours", mode: "Private SUV" }
        ],
        morningActivities: [
          { title: "Glacial Lake Visit", description: "Yak rides and frozen lake views at 3,753m altitude." }
        ],
        stay: { name: "Netuk House", type: "Heritage Homestay" },
        dayNotes: ["Carry original ID cards and passport photos for border permits."]
      },
      {
        dayNumber: 3,
        title: "Departure from Gangtok",
        baseLocation: "Gangtok",
        morningActivities: [
          { title: "Morning souvenir shopping", description: "Local tea and handicrafts." }
        ]
      }
    ]
  };

  it("1. Generates RFC 5545 valid calendar structure", () => {
    const ics = generateItineraryIcs(sampleItinerary);

    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.includes("VERSION:2.0\r\n")).toBe(true);
    expect(ics.includes("PRODID:-//Sikkim Traveller//AI Trip Planner//EN\r\n")).toBe(true);
    expect(ics.includes("CALSCALE:GREGORIAN\r\n")).toBe(true);
    expect(ics.includes("METHOD:PUBLISH\r\n")).toBe(true);
    expect(ics.includes("X-WR-TIMEZONE:Asia/Kolkata\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("2. Generates correct number of VEVENT blocks for multi-day itineraries", () => {
    const ics = generateItineraryIcs(sampleItinerary);

    const eventStarts = (ics.match(/BEGIN:VEVENT/g) || []).length;
    const eventEnds = (ics.match(/END:VEVENT/g) || []).length;

    expect(eventStarts).toBe(3);
    expect(eventEnds).toBe(3);
  });

  it("3. Calculates exact sequential dates matching itinerary start date", () => {
    const ics = generateItineraryIcs(sampleItinerary);

    // Day 1 starts 2026-10-15 and ends non-inclusively 2026-10-16
    expect(ics.includes("DTSTART;VALUE=DATE:20261015")).toBe(true);
    expect(ics.includes("DTEND;VALUE=DATE:20261016")).toBe(true);

    // Day 2: 2026-10-16 -> 2026-10-17
    expect(ics.includes("DTSTART;VALUE=DATE:20261016")).toBe(true);
    expect(ics.includes("DTEND;VALUE=DATE:20261017")).toBe(true);

    // Day 3: 2026-10-17 -> 2026-10-18
    expect(ics.includes("DTSTART;VALUE=DATE:20261017")).toBe(true);
    expect(ics.includes("DTEND;VALUE=DATE:20261018")).toBe(true);
  });

  it("4. Correctly escapes special characters per RFC 5545", () => {
    const testText = "Text with, comma; semicolon, and \\ backslash\nnew line.";
    const escaped = escapeIcsText(testText);

    expect(escaped).toContain("\\,");
    expect(escaped).toContain("\\;");
    expect(escaped).toContain("\\\\");
    expect(escaped).toContain("\\n");

    const ics = generateItineraryIcs(sampleItinerary);
    // Escaped title and notes
    expect(ics).toContain("Adventure\\, 2026\\; Special Edition");
  });

  it("5. Handles missing activity times using compliant all-day events", () => {
    const ics = generateItineraryIcs(sampleItinerary);

    // All-day format without artificial hours
    expect(ics).toContain("DTSTART;VALUE=DATE:");
    expect(ics).toContain("TRANSP:TRANSPARENT");
    expect(ics).toContain("STATUS:CONFIRMED");
  });

  it("6. Folds lines longer than 75 octets per RFC 5545 Section 3.1", () => {
    const longLine = "DESCRIPTION:" + "Very long description of mountain sightseeing and Tibetan monastery exploration across high altitude passes in North Sikkim. ".repeat(3);
    const folded = foldIcsLine(longLine);

    const splitLines = folded.split("\r\n");
    expect(splitLines.length).toBeGreaterThan(1);
    expect(splitLines[0].length).toBeLessThanOrEqual(75);
    // Continuation line starts with whitespace
    expect(splitLines[1].startsWith(" ")).toBe(true);
  });

  it("7. Handles missing start date with graceful upcoming default", () => {
    const noDateItinerary = {
      tripTitle: "Flexible Trip",
      days: [{ dayNumber: 1, title: "Day 1", baseLocation: "Gangtok" }]
    };

    const ics = generateItineraryIcs(noDateItinerary);
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART;VALUE=DATE:");
  });

  it("8. Rejects empty or invalid itineraries with clear errors", () => {
    expect(() => generateItineraryIcs(null)).toThrow("Itinerary has no scheduled days");
    expect(() => generateItineraryIcs({})).toThrow("Itinerary has no scheduled days");
    expect(() => generateItineraryIcs({ days: [] })).toThrow("Itinerary has no scheduled days");
  });
});


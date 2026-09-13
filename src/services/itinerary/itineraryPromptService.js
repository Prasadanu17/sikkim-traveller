/**
 * Prompt Builder Service for AI Itinerary Generation.
 * Enforces strict JSON output schema, zero hallucinations, and constraint adherence.
 */

export function buildItineraryPrompt(tripContext, regenerationPreference = null) {
  const {
    travelTiming,
    duration,
    interests,
    destinations,
    travelers,
    travelStyle,
    budget,
    accommodation,
    transportation
  } = tripContext;

  const destNames = destinations.map((d) => `${d.name} (${d.region})`).join(", ");
  const stayStr = accommodation.types.join(", ") || "Homestay / Hotel";
  const transportStr = transportation.preferredModes.join(", ") || "Private Cab";

  const systemInstruction = `You are an expert Sikkim Tourism Architect and travel planner.
Generate a realistic, day-by-day Sikkim trip itinerary based ONLY on the provided structured trip context.

STRICT CONSTRAINTS:
1. DO NOT invent fake hotel names (use generic descriptive stay types like "Comfortable boutique/homestay in Gangtok").
2. DO NOT invent fake restaurant names (use descriptive labels like "Local Sikkimese restaurant").
3. DO NOT invent non-existent destinations. Only use the provided destinations.
4. DO NOT claim that permits, taxis, or hotels are booked.
5. Travel time between regions MUST be treated as real travel time (e.g. Gangtok to Lachung takes 6 hours).
6. Return ONLY valid JSON matching the exact specified schema. No markdown wrapping or conversational commentary.`;

  let userPrompt = `Generate a ${duration}-day Sikkim trip itinerary with the following parameters:

DURATION: ${duration} Days
TRAVELERS: ${travelers.total} (${travelers.type}: ${travelers.adults} Adults, ${travelers.children} Children, ${travelers.seniors} Seniors)
TRAVEL STYLE / PACE: ${travelStyle.toUpperCase()}
DATES / SEASON: ${travelTiming.season} (${travelTiming.mode === "fixed" ? `${travelTiming.start} to ${travelTiming.end}` : "Flexible"})
SELECTED DESTINATIONS: ${destNames}
INTERESTS: ${interests.join(", ") || "Nature & Culture"}
TARGET BUDGET TIER: ${budget.level.toUpperCase()} (Est: ₹${budget.estimatedMin.toLocaleString("en-IN")} - ₹${budget.estimatedMax.toLocaleString("en-IN")})
PREFERRED ACCOMMODATION: ${stayStr} (Comfort: ${accommodation.comfort})
PREFERRED TRANSPORT: ${transportStr} (Comfort: ${transportation.comfort})`;

  if (regenerationPreference) {
    userPrompt += `\n\nSPECIAL REGENERATION INSTRUCTION: ${JSON.stringify(regenerationPreference)}. Adjust the activities, pacing, or focus accordingly while keeping total duration at ${duration} days.`;
  }

  userPrompt += `\n\nREQUIRED JSON OUTPUT SCHEMA:
{
  "tripTitle": "Short catchy title",
  "summary": "2-sentence trip summary",
  "overview": {
    "duration": ${duration},
    "travelers": ${travelers.total},
    "travelerType": "${travelers.type}",
    "travelStyle": "${travelStyle}",
    "route": [${destinations.map((d) => `"${d.name}"`).join(", ")}],
    "estimatedCost": { "min": ${budget.estimatedMin}, "max": ${budget.estimatedMax}, "currency": "INR" }
  },
  "whyThisTripWorks": [
    "Reason 1 matching season/interests",
    "Reason 2 matching travel pace",
    "Reason 3 matching transport/route efficiency"
  ],
  "days": [
    {
      "dayNumber": 1,
      "date": null,
      "title": "Day Title",
      "baseLocation": "Location Name",
      "morning": [{ "title": "Activity Title", "description": "Short description", "duration": "2 hours" }],
      "afternoon": [{ "title": "Activity Title", "description": "Short description", "duration": "2 hours" }],
      "evening": [{ "title": "Activity Title", "description": "Short description", "duration": "2 hours" }],
      "travel": [{ "from": "Origin", "to": "Destination", "duration": "Transit Time", "mode": "Transport Mode" }],
      "meals": ["Breakfast suggestion", "Lunch suggestion", "Dinner suggestion"],
      "overnight": { "location": "Location Name", "accommodationType": "Stay Type" },
      "estimatedCost": { "min": 5000, "max": 7000, "currency": "INR" },
      "notes": ["Important travel note"],
      "warnings": []
    }
  ],
  "budget": {
    "accommodation": { "min": 0, "max": 0 },
    "transportation": { "min": 0, "max": 0 },
    "food": { "min": 0, "max": 0 },
    "activities": { "min": 0, "max": 0 },
    "miscellaneous": { "min": 0, "max": 0 },
    "total": { "min": ${budget.estimatedMin}, "max": ${budget.estimatedMax} }
  },
  "importantNotes": ["Permit note if applicable", "Altitude note if applicable"],
  "warnings": []
}`;

  return { systemInstruction, userPrompt };
}

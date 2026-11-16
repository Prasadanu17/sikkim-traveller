/**
 * src/services/safety/altitudeSafetyService.js
 * Verified elevation classification, high-altitude safety guidelines, and acclimatization logic.
 * Follows medical travel medicine standards (UIAA & Himalayan Rescue Association guidelines).
 */

import { getDestinationGeoData } from "../../data/destinationCoordinates";

export const ALTITUDE_CATEGORIES = {
  LOW: {
    key: "LOW",
    label: "Low Altitude",
    range: "< 1,500m",
    color: "emerald",
    badgeClass: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
    riskLevel: "negligible",
    guidance: "Standard mountain comfort; negligible altitude sickness risk."
  },
  MODERATE: {
    key: "MODERATE",
    label: "Moderate Altitude",
    range: "1,500m – 2,400m",
    color: "teal",
    badgeClass: "bg-teal-500/10 text-teal-700 border-teal-500/30",
    riskLevel: "low",
    guidance: "Pleasant mountain air. Mild shortness of breath during brisk climbs may occur. Maintain normal hydration."
  },
  HIGH: {
    key: "HIGH",
    label: "High Altitude",
    range: "2,400m – 3,600m",
    color: "amber",
    badgeClass: "bg-amber-500/10 text-amber-700 border-amber-500/30",
    riskLevel: "moderate",
    guidance: "Acclimatization zone. Stay well hydrated, avoid rapid exertion, and sleep at intermediate hubs (such as Lachung or Lachen)."
  },
  VERY_HIGH: {
    key: "VERY_HIGH",
    label: "Very High / Extreme Altitude",
    range: "> 3,600m",
    color: "rose",
    badgeClass: "bg-rose-500/10 text-rose-700 border-rose-500/30",
    riskLevel: "high",
    guidance: "Acute Mountain Sickness (AMS) risk zone. Limit stay at pass/lake to 30–45 minutes, carry portable oxygen canisters, keep warm layers ready, and descend immediately if severe headache or nausea develops."
  }
};

/**
 * Returns the altitude category object for a given elevation in metres.
 */
export function getAltitudeCategory(elevationM) {
  const elev = Number(elevationM);
  if (isNaN(elev) || elev <= 0) return null;

  if (elev < 1500) return ALTITUDE_CATEGORIES.LOW;
  if (elev <= 2400) return ALTITUDE_CATEGORIES.MODERATE;
  if (elev <= 3600) return ALTITUDE_CATEGORIES.HIGH;
  return ALTITUDE_CATEGORIES.VERY_HIGH;
}

/**
 * Evaluates trip-wide altitude profile and generates safety advisories.
 */
export function buildTripAltitudeProfile(itinerary) {
  if (!itinerary || !itinerary.days || !Array.isArray(itinerary.days) || itinerary.days.length === 0) {
    return {
      isValid: false,
      maxElevationM: 0,
      highestDestination: null,
      dayProfiles: [],
      warnings: [],
      hasHighAltitude: false,
      hasVeryHighAltitude: false,
      medicalDisclaimer: "Elevation alone does not determine medical safety. Please follow advisories issued by local authorities and consult a qualified healthcare professional before travel."
    };
  }

  const dayProfiles = [];
  const warnings = [];
  let maxElevationM = 0;
  let highestDestination = null;
  let hasHighAltitude = false;
  let hasVeryHighAltitude = false;

  let prevElevation = 1650; // Starting baseline (approx Gangtok)

  itinerary.days.forEach((day) => {
    const loc = day.baseLocation;
    const geo = getDestinationGeoData(loc);

    let elevationM = geo ? geo.elevationM : null;

    // Check travel segments or title for high-altitude destinations (e.g. day trips to Gurudongmar / Nathula)
    let peakDayElevationM = elevationM;
    let peakLocationName = geo ? geo.name : loc;

    if (day.travelSegments) {
      day.travelSegments.forEach((seg) => {
        const segToGeo = getDestinationGeoData(seg.to);
        if (segToGeo && (!peakDayElevationM || segToGeo.elevationM > peakDayElevationM)) {
          peakDayElevationM = segToGeo.elevationM;
          peakLocationName = segToGeo.name;
        }
      });
    }

    if (day.title) {
      ["gurudongmar", "zero point", "nathula", "tsomgo", "yumthang"].forEach((sub) => {
        if (day.title.toLowerCase().includes(sub)) {
          const matched = getDestinationGeoData(sub);
          if (matched && (!peakDayElevationM || matched.elevationM > peakDayElevationM)) {
            peakDayElevationM = matched.elevationM;
            peakLocationName = matched.name;
          }
        }
      });
    }

    const category = peakDayElevationM ? getAltitudeCategory(peakDayElevationM) : null;

    if (peakDayElevationM) {
      if (peakDayElevationM > maxElevationM) {
        maxElevationM = peakDayElevationM;
        highestDestination = {
          name: peakLocationName,
          elevationM: peakDayElevationM,
          dayNumber: day.dayNumber
        };
      }

      if (peakDayElevationM > 2400) hasHighAltitude = true;
      if (peakDayElevationM > 3600) hasVeryHighAltitude = true;

      // Check single-day ascent jump (>1800m increase)
      const ascentJump = peakDayElevationM - prevElevation;
      if (ascentJump >= 1800) {
        warnings.push({
          type: "RAPID_ASCENT",
          dayNumber: day.dayNumber,
          destination: peakLocationName,
          elevationM: peakDayElevationM,
          message: `Rapid elevation gain on Day ${day.dayNumber} (+${ascentJump}m to ${peakLocationName}). Ensure overnight acclimatization prior to ascent.`
        });
      }

      prevElevation = peakDayElevationM;
    }

    dayProfiles.push({
      dayNumber: day.dayNumber,
      baseLocation: loc,
      peakLocationName,
      elevationM: peakDayElevationM,
      category,
      isHighAltitude: peakDayElevationM ? peakDayElevationM > 2400 : false,
      isExtremeAltitude: peakDayElevationM ? peakDayElevationM > 3600 : false
    });
  });

  // Global trip recommendations
  if (hasVeryHighAltitude) {
    warnings.push({
      type: "VERY_HIGH_ALTITUDE",
      message: `Your trip reaches ${maxElevationM}m at ${highestDestination?.name}. Limit time at highest point to 30–45 minutes, carry warm windproof layers, and keep portable oxygen canisters on hand.`
    });
  }

  return {
    isValid: true,
    maxElevationM,
    highestDestination,
    dayProfiles,
    warnings,
    hasHighAltitude,
    hasVeryHighAltitude,
    medicalDisclaimer: "Elevation alone does not determine individual medical response. High altitude can affect individuals regardless of physical fitness. Travelers with cardiovascular, pulmonary, or chronic health conditions, as well as pregnant women and elderly travellers, should consult a qualified healthcare professional and seek medical clearance prior to visiting altitudes above 3,000 metres. Road status and travel permits remain subject to weather conditions and local administration directives."
  };
}

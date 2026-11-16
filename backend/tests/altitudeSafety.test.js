/**
 * backend/tests/altitudeSafety.test.js
 * Automated test suite for Submodule D.3: Altitude and Road Safety Indicators
 * Covers:
 * 1. Elevation classification (Low, Moderate, High, Extreme)
 * 2. High-altitude warnings and extreme altitude (>3,600m) flagging
 * 3. Rapid ascent gain detection (>1,800m single day climb)
 * 4. Missing or unrecognized elevation handling
 * 5. Road transit details integration
 * 6. Dynamic updates when itinerary changes
 * 7. Verified medical disclaimer presence
 */

import { describe, it, expect } from "vitest";
import {
  getAltitudeCategory,
  buildTripAltitudeProfile
} from "../../src/services/safety/altitudeSafetyService.js";

describe("Submodule D.3: Altitude and Road Safety Indicators", () => {
  it("1. Correctly classifies elevation into medical altitude tiers", () => {
    // Low: <1,500m
    const low = getAltitudeCategory(1200);
    expect(low.key).toBe("LOW");
    expect(low.riskLevel).toBe("negligible");

    // Moderate: 1,500 - 2,400m (Gangtok 1,650m, Pelling 2,150m)
    const gangtok = getAltitudeCategory(1650);
    expect(gangtok.key).toBe("MODERATE");

    // High: 2,400 - 3,600m (Lachung 2,750m, Yumthang 3,564m)
    const lachung = getAltitudeCategory(2750);
    expect(lachung.key).toBe("HIGH");

    // Extreme: >3,600m (Tsomgo 3,753m, Nathula 4,310m, Gurudongmar 5,430m)
    const gurudongmar = getAltitudeCategory(5430);
    expect(gurudongmar.key).toBe("VERY_HIGH");
    expect(gurudongmar.riskLevel).toBe("high");
  });

  it("2. Accurately identifies peak trip elevation and triggers high-altitude warnings", () => {
    const northSikkimTrip = {
      overview: { duration: 4 },
      days: [
        { dayNumber: 1, baseLocation: "Gangtok" },
        { dayNumber: 2, baseLocation: "Lachen" },
        {
          dayNumber: 3,
          baseLocation: "Lachen",
          title: "Excursion to Gurudongmar Lake",
          travelSegments: [{ from: "Lachen", to: "Gurudongmar Lake", duration: "3.5 hours" }]
        },
        { dayNumber: 4, baseLocation: "Gangtok" }
      ]
    };

    const profile = buildTripAltitudeProfile(northSikkimTrip);

    expect(profile.isValid).toBe(true);
    expect(profile.maxElevationM).toBe(5430);
    expect(profile.highestDestination.name).toBe("Gurudongmar Lake");
    expect(profile.hasVeryHighAltitude).toBe(true);

    // Warning triggered for extreme altitude
    const veryHighWarn = profile.warnings.find((w) => w.type === "VERY_HIGH_ALTITUDE");
    expect(veryHighWarn).toBeDefined();
    expect(veryHighWarn.message).toContain("5430m");
  });

  it("3. Detects rapid ascent elevation gain (>1,800m single day climb)", () => {
    const rapidTrip = {
      days: [
        { dayNumber: 1, baseLocation: "Gangtok" }, // 1,650m
        {
          dayNumber: 2,
          baseLocation: "Gurudongmar Lake", // 5,430m (Jump of +3,780m in one day)
          title: "Direct climb to Gurudongmar Lake"
        }
      ]
    };

    const profile = buildTripAltitudeProfile(rapidTrip);
    const rapidAscentWarning = profile.warnings.find((w) => w.type === "RAPID_ASCENT");

    expect(rapidAscentWarning).toBeDefined();
    expect(rapidAscentWarning.dayNumber).toBe(2);
    expect(rapidAscentWarning.message).toContain("Rapid elevation gain");
  });

  it("4. Gracefully handles missing or unverified elevation without guessing", () => {
    expect(getAltitudeCategory(null)).toBeNull();
    expect(getAltitudeCategory(undefined)).toBeNull();
    expect(getAltitudeCategory("invalid")).toBeNull();

    const customTrip = {
      days: [{ dayNumber: 1, baseLocation: "Fictional Valley" }]
    };

    const profile = buildTripAltitudeProfile(customTrip);
    expect(profile.isValid).toBe(true);
    expect(profile.dayProfiles[0].elevationM).toBeNull();
    expect(profile.dayProfiles[0].category).toBeNull();
  });

  it("5. Updates dynamically when itinerary schedule or destinations change", () => {
    const trip1 = {
      days: [
        { dayNumber: 1, baseLocation: "Gangtok" },
        { dayNumber: 2, baseLocation: "Namchi" } // South Sikkim, 1,675m
      ]
    };

    const profile1 = buildTripAltitudeProfile(trip1);
    expect(profile1.hasHighAltitude).toBe(false);
    expect(profile1.hasVeryHighAltitude).toBe(false);

    // Mutate to include high-altitude North Sikkim (Day 3 Lachung 2,750m)
    const trip2 = {
      days: [
        ...trip1.days,
        { dayNumber: 3, baseLocation: "Lachung" }
      ]
    };

    const profile2 = buildTripAltitudeProfile(trip2);
    expect(profile2.hasHighAltitude).toBe(true);
    expect(profile2.maxElevationM).toBe(2750);
  });

  it("6. Strictly includes verified medical caution disclaimer", () => {
    const sampleTrip = {
      days: [{ dayNumber: 1, baseLocation: "Gangtok" }]
    };

    const profile = buildTripAltitudeProfile(sampleTrip);
    expect(profile.medicalDisclaimer).toBeDefined();
    expect(profile.medicalDisclaimer).toContain("Elevation alone does not determine individual medical response");
    expect(profile.medicalDisclaimer).toContain("consult a qualified healthcare professional");
  });
});

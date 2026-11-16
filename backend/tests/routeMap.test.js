/**
 * backend/tests/routeMap.test.js
 * Automated test suite for Submodule D.1: Interactive Sikkim Route Map
 * Covers:
 * 1. Extraction of destination markers with verified coordinates and elevations
 * 2. Route ordering according to sequential itinerary days
 * 3. Calculation of transit legs, distance, and road travel time
 * 4. Automatic adaptation when itinerary changes
 * 5. Handling of missing coordinates (never inventing coordinates)
 * 6. Handling of invalid or empty route data
 * 7. Multi-circuit coverage (North, East, West/South Sikkim)
 */

import { describe, it, expect } from "vitest";
import { buildItineraryRouteModel } from "../../src/services/map/routeMapService.js";
import { getDestinationGeoData } from "../../src/data/destinationCoordinates.js";

describe("Submodule D.1: Interactive Sikkim Route Map", () => {
  const sampleItinerary = {
    tripTitle: "Sikkim Explorer 5 Days",
    overview: {
      duration: 5,
      route: ["Gangtok", "Lachung", "Yumthang Valley", "Gangtok"]
    },
    days: [
      {
        dayNumber: 1,
        title: "Arrive Gangtok",
        baseLocation: "Gangtok",
        stay: { name: "Pine Ridge Homestay", location: "Gangtok" }
      },
      {
        dayNumber: 2,
        title: "Drive to Lachung",
        baseLocation: "Lachung",
        travelSegments: [{ from: "Gangtok", to: "Lachung", duration: "6 hours" }],
        stay: { name: "Lachung Heritage", location: "Lachung" }
      },
      {
        dayNumber: 3,
        title: "Yumthang Valley Excursion",
        baseLocation: "Yumthang Valley",
        travelSegments: [{ from: "Lachung", to: "Yumthang Valley", duration: "1.5 hours" }],
        stay: { name: "Lachung Heritage", location: "Lachung" }
      },
      {
        dayNumber: 4,
        title: "Return to Gangtok",
        baseLocation: "Gangtok",
        travelSegments: [{ from: "Lachung", to: "Gangtok", duration: "6 hours" }],
        stay: { name: "Pine Ridge Homestay", location: "Gangtok" }
      },
      {
        dayNumber: 5,
        title: "Departure",
        baseLocation: "Gangtok"
      }
    ]
  };

  it("1. Accurately extracts verified destination markers with elevations", () => {
    const route = buildItineraryRouteModel(sampleItinerary);

    expect(route.isValid).toBe(true);
    expect(route.stops.length).toBe(3); // Gangtok, Lachung, Yumthang Valley

    const gangtok = route.stops.find((s) => s.slug === "gangtok");
    expect(gangtok).toBeDefined();
    expect(gangtok.lat).toBe(27.3389);
    expect(gangtok.lng).toBe(88.6065);
    expect(gangtok.elevationM).toBe(1650);
    expect(gangtok.circuit).toBe("East Sikkim");

    const lachung = route.stops.find((s) => s.slug === "lachung");
    expect(lachung).toBeDefined();
    expect(lachung.elevationM).toBe(2750);
    expect(lachung.circuit).toBe("North Sikkim");
  });

  it("2. Preserves itinerary day visit order across stops", () => {
    const route = buildItineraryRouteModel(sampleItinerary);

    const gangtok = route.stops.find((s) => s.slug === "gangtok");
    // Visited on Day 1, Day 4, and Day 5
    expect(gangtok.days).toEqual([1, 4, 5]);

    const lachung = route.stops.find((s) => s.slug === "lachung");
    expect(lachung.days).toEqual([2]);
  });

  it("3. Calculates sequential transit legs with distances and driving times", () => {
    const route = buildItineraryRouteModel(sampleItinerary);

    expect(route.legs.length).toBeGreaterThan(0);

    const leg1 = route.legs.find((l) => l.from.slug === "gangtok" && l.to.slug === "lachung");
    expect(leg1).toBeDefined();
    expect(leg1.estimatedHours).toBe("6 hours");
    expect(leg1.distanceKm).toBe(118);
    expect(leg1.transitNote).toContain("Mountain switchbacks");

    const leg2 = route.legs.find((l) => l.from.slug === "lachung" && l.to.slug === "yumthang-valley");
    expect(leg2).toBeDefined();
    expect(leg2.distanceKm).toBe(25);
  });

  it("4. Adapts automatically when itinerary changes (destination added)", () => {
    // Add Pelling on Day 4
    const modifiedItinerary = {
      ...sampleItinerary,
      days: [
        ...sampleItinerary.days.slice(0, 3),
        {
          dayNumber: 4,
          title: "Drive to Pelling",
          baseLocation: "Pelling",
          stay: { name: "Pelling Resort", location: "Pelling" }
        },
        {
          dayNumber: 5,
          title: "Departure from Pelling",
          baseLocation: "Pelling"
        }
      ]
    };

    const route = buildItineraryRouteModel(modifiedItinerary);
    expect(route.stops.some((s) => s.slug === "pelling")).toBe(true);
    expect(route.circuits).toContain("West Sikkim");

    const pelling = route.stops.find((s) => s.slug === "pelling");
    expect(pelling.elevationM).toBe(2150);
  });

  it("5. Handles missing or unrecognized coordinates without inventing locations", () => {
    const customItinerary = {
      days: [
        { dayNumber: 1, baseLocation: "Gangtok" },
        { dayNumber: 2, baseLocation: "Unknown Secret Meadow" }
      ]
    };

    const route = buildItineraryRouteModel(customItinerary);
    expect(route.isValid).toBe(true);
    expect(route.stops.length).toBe(1); // Only Gangtok mapped
    expect(route.unmappedStops).toContain("Unknown Secret Meadow");

    // GeoData function returns null for unknown locations
    const unknown = getDestinationGeoData("Atlantis Of Sikkim");
    expect(unknown).toBeNull();
  });

  it("6. Handles empty or completely invalid itinerary data safely", () => {
    const emptyResult = buildItineraryRouteModel(null);
    expect(emptyResult.isValid).toBe(false);
    expect(emptyResult.error).toBeDefined();

    const noDaysResult = buildItineraryRouteModel({ days: [] });
    expect(noDaysResult.isValid).toBe(false);

    const unmappedAll = buildItineraryRouteModel({
      days: [{ dayNumber: 1, baseLocation: "Nowhere" }]
    });
    expect(unmappedAll.isValid).toBe(false);
    expect(unmappedAll.error).toContain("None of the itinerary locations have verified geographic coordinates");
  });

  it("7. Correctly calculates geographic bounding box for map viewport", () => {
    const route = buildItineraryRouteModel(sampleItinerary);

    expect(route.bounds).toBeDefined();
    expect(route.bounds.minLat).toBeLessThan(route.bounds.maxLat);
    expect(route.bounds.minLng).toBeLessThan(route.bounds.maxLng);
    expect(route.bounds.center[0]).toBeGreaterThan(27.0);
    expect(route.bounds.center[1]).toBeGreaterThan(88.0);
  });
});

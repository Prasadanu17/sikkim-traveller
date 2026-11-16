/**
 * src/services/map/routeMapService.js
 * Generates verified sequential map route models, transit metrics, and circuit boundaries.
 * Preserves actual travel sequence and avoids inventing coordinates.
 */

import { getDestinationGeoData } from "../../data/destinationCoordinates";
import { getTransitDetails } from "../itinerary/routePreparationService";

/**
 * Extracts ordered itinerary stops and road connection legs from an itinerary object.
 */
export function buildItineraryRouteModel(itinerary) {
  if (!itinerary || !itinerary.days || !Array.isArray(itinerary.days) || itinerary.days.length === 0) {
    return {
      isValid: false,
      error: "Itinerary has no scheduled days to plot.",
      stops: [],
      legs: [],
      circuits: [],
      bounds: null,
      unmappedStops: []
    };
  }

  const stops = [];
  const unmappedStops = [];
  const seenSlugs = new Set();
  const circuits = new Set();

  // Extract sequential stops across days
  itinerary.days.forEach((day) => {
    const locationName = day.baseLocation || (day.travelSegments && day.travelSegments[0]?.to) || null;
    if (!locationName) return;

    const geoData = getDestinationGeoData(locationName);
    if (!geoData) {
      if (!unmappedStops.includes(locationName)) {
        unmappedStops.push(locationName);
      }
      return;
    }

    circuits.add(geoData.circuit);

    // Track stop occurrences
    const existing = stops.find((s) => s.slug === geoData.slug);
    if (existing) {
      existing.days.push(day.dayNumber);
      existing.titles.push(day.title);
    } else {
      stops.push({
        id: `stop-${geoData.slug}`,
        slug: geoData.slug,
        name: geoData.name,
        lat: geoData.lat,
        lng: geoData.lng,
        elevationM: geoData.elevationM,
        district: geoData.district,
        circuit: geoData.circuit,
        days: [day.dayNumber],
        titles: [day.title],
        isOvernight: day.stay ? true : false,
        stayInfo: day.stay || null,
        stopSequenceIndex: stops.length + 1
      });
      seenSlugs.add(geoData.slug);
    }
  });

  if (stops.length === 0) {
    return {
      isValid: false,
      error: "None of the itinerary locations have verified geographic coordinates.",
      stops: [],
      legs: [],
      circuits: [],
      bounds: null,
      unmappedStops
    };
  }

  // Calculate day-to-day sequential transit legs
  const legs = [];
  for (let i = 0; i < itinerary.days.length - 1; i++) {
    const fromLoc = itinerary.days[i].baseLocation;
    const toLoc = itinerary.days[i + 1].baseLocation;

    if (!fromLoc || !toLoc) continue;

    const fromGeo = getDestinationGeoData(fromLoc);
    const toGeo = getDestinationGeoData(toLoc);

    if (fromGeo && toGeo && fromGeo.slug !== toGeo.slug) {
      const transit = getTransitDetails(fromGeo.name, toGeo.name);
      legs.push({
        id: `leg-${fromGeo.slug}-${toGeo.slug}-${i}`,
        from: {
          slug: fromGeo.slug,
          name: fromGeo.name,
          lat: fromGeo.lat,
          lng: fromGeo.lng
        },
        to: {
          slug: toGeo.slug,
          name: toGeo.name,
          lat: toGeo.lat,
          lng: toGeo.lng
        },
        fromDay: itinerary.days[i].dayNumber,
        toDay: itinerary.days[i + 1].dayNumber,
        estimatedHours: transit.hours,
        distanceKm: transit.distanceKm,
        travelMode: transit.mode,
        transitNote: transit.note,
        isMountainPass: transit.note.toLowerCase().includes("mountain") || transit.note.toLowerCase().includes("switchback")
      });
    }
  }

  // Compute bounding box for map fitting
  const lats = stops.map((s) => s.lat);
  const lngs = stops.map((s) => s.lng);
  const bounds = {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
    center: [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2
    ]
  };

  return {
    isValid: true,
    error: null,
    stops,
    legs,
    circuits: Array.from(circuits),
    bounds,
    unmappedStops,
    disclaimer: "Route lines indicate travel sequence between scheduled destinations. Road travel follows mountain passes and state highways with driving durations as noted."
  };
}

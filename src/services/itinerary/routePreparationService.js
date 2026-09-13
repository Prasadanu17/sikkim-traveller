/**
 * Prepares a logical day-by-day route blueprint from structured trip context.
 * Distinguishes overnight hubs from day-trips, computes transit times,
 * and sets activity capacity based on travel pace.
 */

// Transit time matrix (hours) between key Sikkim regions/hubs
const TRANSIT_MATRIX = {
  "Gangtok->Lachung": { hours: "6 hours", distanceKm: 118, mode: "Private SUV / Shared Sumo", note: "Mountain switchbacks & permit check" },
  "Lachung->Gangtok": { hours: "6 hours", distanceKm: 118, mode: "Private SUV / Shared Sumo", note: "Return descent to Gangtok" },
  "Gangtok->Lachen": { hours: "6 hours", distanceKm: 120, mode: "Private SUV", note: "High altitude ascent" },
  "Lachen->Gangtok": { hours: "6 hours", distanceKm: 120, mode: "Private SUV", note: "Return descent to Gangtok" },
  "Lachung->Yumthang Valley": { hours: "1.5 hours", distanceKm: 25, mode: "Private SUV", note: "Alpine valley drive" },
  "Yumthang Valley->Zero Point": { hours: "1.5 hours", distanceKm: 28, mode: "Private SUV", note: "Snow road ascent" },
  "Lachen->Gurudongmar Lake": { hours: "3.5 hours", distanceKm: 66, mode: "4WD SUV", note: "Early 4:00 AM start, high-altitude" },
  "Gangtok->Pelling": { hours: "4.5 hours", distanceKm: 115, mode: "Private SUV / Cab", note: "Scenic West Sikkim highway" },
  "Pelling->Gangtok": { hours: "4.5 hours", distanceKm: 115, mode: "Private SUV / Cab", note: "Return drive to Gangtok" },
  "Gangtok->Ravangla": { hours: "3 hours", distanceKm: 68, mode: "Private Cab", note: "South Sikkim highway" },
  "Ravangla->Pelling": { hours: "2 hours", distanceKm: 48, mode: "Private Cab", note: "West Sikkim link" },
  "Gangtok->Tsomgo Lake": { hours: "2 hours", distanceKm: 40, mode: "Private SUV / Shared Cab", note: "Nathula Highway ascent" },
  "Tsomgo Lake->Nathula": { hours: "1 hour", distanceKm: 16, mode: "Private SUV", note: "Indo-China border road" },
  "Gangtok->Zuluk": { hours: "3.5 hours", distanceKm: 90, mode: "Private SUV", note: "Silk Route winding hairpins" },
  "Airport->Gangtok": { hours: "4 hours", distanceKm: 124, mode: "Private SUV / Cab", note: "Bagdogra/Pakyong to Gangtok transfer" },
  "Gangtok->Airport": { hours: "4 hours", distanceKm: 124, mode: "Private SUV / Cab", note: "Departure transfer" }
};

export function getTransitDetails(from, to) {
  const key = `${from}->${to}`;
  if (TRANSIT_MATRIX[key]) return TRANSIT_MATRIX[key];
  
  // Generic fallback if not in matrix
  return {
    hours: "2.5–3.5 hours",
    distanceKm: 60,
    mode: "Private Cab",
    note: "Mountain road transfer"
  };
}

/**
 * Generates day-by-day destination sequence allocations.
 */
export function prepareRouteBlueprint(tripContext) {
  const { duration, destinations, travelStyle } = tripContext;

  const overnightDests = destinations.filter((d) => d.overnight);
  const dayTripDests = destinations.filter((d) => !d.overnight);

  // Maximum activities per day based on travel pace
  const paceLimits = {
    relaxed: { maxActivities: 2, maxTravelHours: 4 },
    balanced: { maxActivities: 3, maxTravelHours: 6 },
    packed: { maxActivities: 4, maxTravelHours: 8 }
  };

  const currentPace = paceLimits[travelStyle] || paceLimits.balanced;

  // Build day schedule blueprint array
  const dayBlueprints = [];

  // Default hub is always Gangtok
  const gangtokDest = destinations.find((d) => d.slug === "gangtok") || {
    name: "Gangtok",
    slug: "gangtok",
    region: "East Sikkim",
    overnight: true
  };

  const hasNorth = destinations.some((d) => d.region === "North Sikkim");
  const hasWest = destinations.some((d) => d.region === "West Sikkim");
  const hasSouth = destinations.some((d) => d.region === "South Sikkim");

  if (hasNorth && duration >= 4) {
    // ─── NORTH SIKKIM ROUTE PATTERN ───
    // Day 1: Arrive Gangtok
    dayBlueprints.push({
      dayNumber: 1,
      title: "Arrival in Gangtok",
      baseLocation: "Gangtok",
      overnightLocation: "Gangtok",
      transit: getTransitDetails("Airport", "Gangtok"),
      dayType: "arrival",
      primaryActivities: ["Hotel check-in & rest", "Evening MG Marg stroll"],
      isLongTravelDay: true
    });

    if (duration >= 5) {
      // Day 2: Gangtok local sightseeing / acclimatization
      dayBlueprints.push({
        dayNumber: 2,
        title: "Explore Gangtok & Monasteries",
        baseLocation: "Gangtok",
        overnightLocation: "Gangtok",
        transit: null,
        dayType: "sightseeing",
        primaryActivities: ["Rumtek Monastery", "Ganesh Tok viewpoint", "Local market & tea cafe"],
        isLongTravelDay: false
      });
    }

    // Day 3 (or 2): Transfer Gangtok → Lachung (6 hrs mountain drive)
    // PERMIT: Inner Line Permit (ILP) for North Sikkim must be arranged through a registered tour operator
    //         from Gangtok — typically processed the evening before departure.
    // ADVISORY: Sikkim Tourism recommends a minimum 3 days / 2 nights itinerary for Lachung/North Sikkim.
    const lachungDay = dayBlueprints.length + 1;
    dayBlueprints.push({
      dayNumber: lachungDay,
      title: "Gangtok to Lachung Valley",
      baseLocation: "Lachung",
      overnightLocation: "Lachung",
      transit: getTransitDetails("Gangtok", "Lachung"),
      dayType: "transfer-scenic",
      primaryActivities: ["Seven Sisters Waterfall en-route", "Chungthang confluence", "Lachung village stroll"],
      permitNote: "Inner Line Permit (ILP) for North Sikkim required — arrange through registered Sikkim tour operator the day prior in Gangtok.",
      isLongTravelDay: true
    });

    // Day 4: Yumthang Valley & Zero Point excursion (base: overnight in Lachung)
    const yumthangDay = dayBlueprints.length + 1;
    dayBlueprints.push({
      dayNumber: yumthangDay,
      title: "Yumthang Valley & Zero Point Excursion",
      baseLocation: "Lachung",
      overnightLocation: "Lachung",
      transit: getTransitDetails("Lachung", "Yumthang Valley"),
      dayType: "excursion",
      primaryActivities: ["Shingba Rhododendron Sanctuary", "Yumthang Hot Springs", "Zero Point snow experience (seasonal — not guaranteed)"],
      permitNote: "Inner Line Permit (ILP) required — obtain through registered Sikkim tour operator prior to departure from Gangtok.",
      weatherNote: "Snow at Zero Point is seasonal (best: Jan–Apr, Nov). Availability is weather-dependent and not guaranteed.",
      isLongTravelDay: false
    });

    // Remaining days: Return to Gangtok, then optional East Day Trip or Departure
    const remainingDays = duration - dayBlueprints.length;

    if (remainingDays >= 2) {
      dayBlueprints.push({
        dayNumber: dayBlueprints.length + 1,
        title: "Lachung to Gangtok",
        baseLocation: "Gangtok",
        overnightLocation: "Gangtok",
        transit: getTransitDetails("Lachung", "Gangtok"),
        dayType: "transfer-return",
        primaryActivities: ["Naga Waterfalls view", "Gangtok evening leisure"],
        isLongTravelDay: true
      });

      const dayTripSelected = dayTripDests.find((d) => d.slug === "tsomgo-lake" || d.slug === "nathula");
      if (dayTripSelected) {
        dayBlueprints.push({
          dayNumber: dayBlueprints.length + 1,
          title: "Tsomgo Lake & Nathula Pass",
          baseLocation: "Gangtok",
          overnightLocation: "Gangtok",
          transit: getTransitDetails("Gangtok", "Tsomgo Lake"),
          dayType: "excursion",
          primaryActivities: ["Tsomgo Glacial Lake", "Nathula Pass Indo-China border gate", "Baba Mandir"],
          isLongTravelDay: false
        });
      }
    }

    // Fill remaining days up to duration
    while (dayBlueprints.length < duration) {
      const dNum = dayBlueprints.length + 1;
      if (dNum === duration) {
        dayBlueprints.push({
          dayNumber: dNum,
          title: "Farewell Sikkim & Departure",
          baseLocation: "Gangtok",
          overnightLocation: "Home",
          transit: getTransitDetails("Gangtok", "Airport"),
          dayType: "departure",
          primaryActivities: ["Souvenir shopping at MG Marg", "Transfer to Bagdogra / Pakyong airport"],
          isLongTravelDay: true
        });
      } else {
        dayBlueprints.push({
          dayNumber: dNum,
          title: "Gangtok Leisure & Culture",
          baseLocation: "Gangtok",
          overnightLocation: "Gangtok",
          transit: null,
          dayType: "leisure",
          primaryActivities: ["Namgyal Institute of Tibetology", "Do Drul Chorten Stupa", "Local Sikkimese tasting dinner"],
          isLongTravelDay: false
        });
      }
    }
  } else if (hasWest || hasSouth) {
    // ─── WEST & SOUTH SIKKIM ROUTE PATTERN ───
    dayBlueprints.push({
      dayNumber: 1,
      title: "Arrival in Gangtok",
      baseLocation: "Gangtok",
      overnightLocation: "Gangtok",
      transit: getTransitDetails("Airport", "Gangtok"),
      dayType: "arrival",
      primaryActivities: ["Hotel check-in & rest", "Evening MG Marg stroll"],
      isLongTravelDay: true
    });

    if (duration >= 3) {
      dayBlueprints.push({
        dayNumber: 2,
        title: "Gangtok to Pelling via Ravangla",
        baseLocation: "Pelling",
        overnightLocation: "Pelling",
        transit: getTransitDetails("Gangtok", "Pelling"),
        dayType: "transfer-scenic",
        primaryActivities: ["Buddha Park in Ravangla", "Temi Tea Garden view", "Pelling hotel check-in"],
        isLongTravelDay: true
      });
    }

    if (duration >= 4) {
      dayBlueprints.push({
        dayNumber: 3,
        title: "Pelling Sightseeing & Kanchenjunga Views",
        baseLocation: "Pelling",
        overnightLocation: "Pelling",
        transit: null,
        dayType: "sightseeing",
        primaryActivities: ["Pelling Glass Skywalk", "Pemayangtse Monastery", "Rabdentse Ruins walk"],
        isLongTravelDay: false
      });
    }

    while (dayBlueprints.length < duration) {
      const dNum = dayBlueprints.length + 1;
      if (dNum === duration) {
        dayBlueprints.push({
          dayNumber: dNum,
          title: "Departure & Return Journey",
          baseLocation: "Gangtok",
          overnightLocation: "Home",
          transit: getTransitDetails("Pelling", "Gangtok"),
          dayType: "departure",
          primaryActivities: ["Morning Kanchenjunga sunrise", "Airport departure transfer"],
          isLongTravelDay: true
        });
      } else {
        dayBlueprints.push({
          dayNumber: dNum,
          title: "Return to Gangtok & East Circuit",
          baseLocation: "Gangtok",
          overnightLocation: "Gangtok",
          transit: getTransitDetails("Pelling", "Gangtok"),
          dayType: "transfer-return",
          primaryActivities: ["Drive back to Gangtok", "Handicrafts & local tea shopping"],
          isLongTravelDay: false
        });
      }
    }
  } else {
    // ─── EAST SIKKIM / STANDARD GANGTOK CIRCUIT ───
    dayBlueprints.push({
      dayNumber: 1,
      title: "Arrival in Gangtok",
      baseLocation: "Gangtok",
      overnightLocation: "Gangtok",
      transit: getTransitDetails("Airport", "Gangtok"),
      dayType: "arrival",
      primaryActivities: ["Airport transfer to Gangtok", "Evening walk on MG Marg"],
      isLongTravelDay: true
    });

    for (let d = 2; d <= duration; d++) {
      if (d === 2) {
        dayBlueprints.push({
          dayNumber: 2,
          title: "Excursion to Tsomgo Lake & Nathula",
          baseLocation: "Gangtok",
          overnightLocation: "Gangtok",
          transit: getTransitDetails("Gangtok", "Tsomgo Lake"),
          dayType: "excursion",
          primaryActivities: ["Tsomgo Glacial Lake yak ride", "Nathula Pass border gate", "Baba Mandir"],
          isLongTravelDay: false
        });
      } else if (d === duration) {
        dayBlueprints.push({
          dayNumber: d,
          title: "Souvenir Shopping & Departure",
          baseLocation: "Gangtok",
          overnightLocation: "Home",
          transit: getTransitDetails("Gangtok", "Airport"),
          dayType: "departure",
          primaryActivities: ["Morning view from hotel", "Airport departure transfer"],
          isLongTravelDay: true
        });
      } else {
        dayBlueprints.push({
          dayNumber: d,
          title: `Gangtok Culture & Scenery (Day ${d})`,
          baseLocation: "Gangtok",
          overnightLocation: "Gangtok",
          transit: null,
          dayType: "sightseeing",
          primaryActivities: ["Rumtek Monastery", "Ban Jhakri Waterfalls", "Local cafe tasting"],
          isLongTravelDay: false
        });
      }
    }
  }

  return {
    dayBlueprints,
    paceLimits: currentPace,
    totalOvernightStops: overnightDests.length
  };
}

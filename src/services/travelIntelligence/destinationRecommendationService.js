import { destinations } from "../../data/destinations";

/**
 * Calculates a compatibility score (0-100) for a destination based on user profile.
 */
export function calculateDestinationScore(dest, { interests = [], recommendedSeason = "Autumn" }) {
  // 1. Interest Match (40% weight)
  let interestScore = 80; // default fallback
  if (interests.length > 0) {
    const overlapping = dest.interests.filter((i) => interests.includes(i));
    interestScore = Math.round((overlapping.length / interests.length) * 100);
    // Add small bonus for specific keyword matches
    if (interests.includes("snow") && dest.interests.includes("snow")) interestScore += 5;
    if (interests.includes("mountains") && dest.interests.includes("mountains")) interestScore += 5;
  }

  // 2. Seasonal Suitability (60% weight)
  const seasonKey = recommendedSeason.toLowerCase();
  const seasonScore = dest.seasons[seasonKey] !== undefined ? dest.seasons[seasonKey] : 70;

  // Weighted sum capped at 100
  let finalScore = Math.round(interestScore * 0.4 + seasonScore * 0.6);
  return Math.min(100, Math.max(0, finalScore));
}

/**
 * Recommends a list of destinations matching user timing, duration, and interests.
 */
export function getRecommendedDestinations({ duration, interests = [], travelIntelligence }) {
  const recommendedSeason = travelIntelligence?.recommendedSeason || "Autumn";
  
  // Calculate scores for all destinations
  const scored = destinations.map((dest) => {
    const score = calculateDestinationScore(dest, { interests, recommendedSeason });
    
    // Generate personalized reasons
    const reasons = [];
    
    // Interest match reason
    const matchedInterests = dest.interests.filter((i) => interests.includes(i));
    if (matchedInterests.length > 0) {
      if (matchedInterests.includes("mountains")) {
        reasons.push("Outstanding mountain view vantage point");
      } else if (matchedInterests.includes("photography")) {
        reasons.push("Ideal lighting and visual landscapes");
      } else if (matchedInterests.includes("nature")) {
        reasons.push("Vibrant local vegetation and flowers");
      } else {
        reasons.push("Strong match for your selected experiences");
      }
    }
    
    // Seasonal fit reason
    const seasonKey = recommendedSeason.toLowerCase();
    if (dest.seasons[seasonKey] >= 90) {
      reasons.push(`Excellent visibility during ${recommendedSeason}`);
    }
    
    // Route/Transit duration fit reason
    if (duration <= 4 && !dest.overnight) {
      reasons.push("Convenient day trip from Gangtok, saving overnight transfers");
    } else if (duration >= 6 && dest.overnight) {
      reasons.push(`Allows a relaxed overnight stay (${dest.recommendedDuration.ideal} days recommended)`);
    }

    if (reasons.length === 0) {
      reasons.push("Complements the regional tourist circuit well");
    }

    return {
      ...dest,
      score,
      reasons: reasons.slice(0, 2),
      recommendedDays: duration <= 3 ? dest.recommendedDuration.min : dest.recommendedDuration.ideal
    };
  });

  // Sort by score descending
  const sorted = [...scored].sort((a, b) => b.score - a.score);

  // Group by region and select a geographically compact sequence depending on duration
  // For short durations (<= 3 days): focus on Gangtok + Day Trips (Tsomgo, Nathula)
  // For medium (4-5 days): focus on one overnight loop (either North loop, or South/West loop)
  // For long (6+ days): allow multiple regions
  let recommendedSlugs = [];
  
  if (duration <= 3) {
    // Focus East: Gangtok + top non-overnight East Sikkim day trips matching user interests
    const primaryHub = "gangtok";
    const topEastDayTrips = sorted
      .filter((d) => d.region === "East Sikkim" && !d.overnight && d.slug !== primaryHub)
      .slice(0, Math.min(2, Math.max(1, duration - 1)))
      .map((d) => d.slug);
    recommendedSlugs = [primaryHub, ...topEastDayTrips];
  } else if (duration <= 5) {
    // Medium duration: Pick the highest scoring overnight region loop
    // Check whether North overnight (Lachung/Lachen) or West overnight (Pelling/Yuksom) has higher average score
    const northScored = sorted.filter((d) => d.region === "North Sikkim" && d.overnight);
    const westScored = sorted.filter((d) => d.region === "West Sikkim" && d.overnight);
    
    const northAvg = northScored.length > 0 ? northScored.reduce((acc, d) => acc + d.score, 0) / northScored.length : 0;
    const westAvg = westScored.length > 0 ? westScored.reduce((acc, d) => acc + d.score, 0) / westScored.length : 0;
    
    if (northAvg >= westAvg) {
      // Recommends North Sikkim loop: Gangtok (transit hub) + Lachung + Yumthang Valley
      recommendedSlugs = ["gangtok", "lachung", "yumthang-valley"];
    } else {
      // Recommends West/South loop: Gangtok + Pelling + Ravangla
      recommendedSlugs = ["gangtok", "pelling", "ravangla"];
    }
  } else {
    // 6+ days: Prefer a dominant region circuit, not a scatter across all regions.
    // Mixing North Sikkim (Lachung/Lachen) with West Sikkim (Pelling) creates 12+ hrs of backtracking.
    // Strategy: Evaluate North loop vs West+South loop scores, choose winner, then add East day-trips.
    const primaryHub = "gangtok";

    const northOvernight = sorted.filter((d) => d.region === "North Sikkim" && d.overnight);
    const westSouthOvernight = sorted.filter(
      (d) => (d.region === "West Sikkim" || d.region === "South Sikkim") && d.overnight
    );

    const northAvg =
      northOvernight.length > 0
        ? northOvernight.reduce((acc, d) => acc + d.score, 0) / northOvernight.length
        : 0;
    const westSouthAvg =
      westSouthOvernight.length > 0
        ? westSouthOvernight.reduce((acc, d) => acc + d.score, 0) / westSouthOvernight.length
        : 0;

    // East Sikkim day-trips (Tsomgo, Nathula) are compatible with any base
    const eastDayTrips = sorted
      .filter((d) => d.region === "East Sikkim" && !d.overnight && d.slug !== primaryHub)
      .slice(0, 2);

    if (northAvg >= westSouthAvg) {
      // North circuit: Gangtok (hub) + Lachung + Yumthang Valley + Zero Point (if 7+ days)
      // Optionally add Lachen for 8+ day trips only (Gurudongmar requires a separate overnight)
      const northDests = ["lachung", "yumthang-valley"];
      if (duration >= 8 && northOvernight.some((d) => d.slug === "lachen")) {
        northDests.push("lachen");
      }
      // Add East day-trips for remaining days
      const eastSlugs = eastDayTrips.map((d) => d.slug).slice(0, Math.max(0, duration - 3 - northDests.length));
      recommendedSlugs = [primaryHub, ...northDests, ...eastSlugs];
    } else {
      // West+South circuit: Gangtok + Pelling + Ravangla + optional South additions
      const westSouthDests = westSouthOvernight.slice(0, duration >= 8 ? 3 : 2).map((d) => d.slug);
      // Only append East day-trips if duration >= 7 to avoid over-packing short West circuits
      const eastSlugs = duration >= 7
        ? eastDayTrips.map((d) => d.slug).slice(0, Math.max(0, duration - 2 - westSouthDests.length))
        : [];
      recommendedSlugs = [primaryHub, ...westSouthDests, ...eastSlugs];
    }

    // Safety: trim to duration + 1 max destinations
    recommendedSlugs = recommendedSlugs.slice(0, duration + 1);
  }

  // Filter scored list to match the recommended slugs
  const recommendations = recommendedSlugs
    .map((slug) => sorted.find((d) => d.slug === slug))
    .filter(Boolean);

  return recommendations;
}

/**
 * Validates a selected list of destinations against duration and route spreadsheet rules.
 */
export function validateDestinationCombination({ selectedSlugs, duration }) {
  const selectedDests = selectedSlugs
    .map((slug) => destinations.find((d) => d.slug === slug))
    .filter(Boolean);

  if (selectedDests.length === 0) {
    return {
      isValid: true,
      score: 100,
      warnings: []
    };
  }

  const warnings = [];
  let routeScore = 100;

  // 1. Overnight Stops count check
  const overnightDests = selectedDests.filter((d) => d.overnight);
  const overnightCount = overnightDests.length;
  
  if (overnightCount > Math.ceil(duration / 1.5)) {
    routeScore -= 25;
    warnings.push(
      `Too many overnight stops: You have selected ${overnightCount} overnight stops for a ${duration}-day trip. Changing hotels daily involves tedious travel and leaves very little time to enjoy each place.`
    );
  }

  // 2. Wide Geographical Spread Check
  const regions = new Set(selectedDests.map((d) => d.region));
  const hasNorth = regions.has("North Sikkim");
  const hasWest = regions.has("West Sikkim");
  const hasSouth = regions.has("South Sikkim");
  const hasEastSilk = selectedDests.some((d) => d.slug === "zuluk");
  
  // Driving from North to West/South requires backtracking through Gangtok (6-8 hours transfer)
  const isScattered = hasNorth && (hasWest || hasSouth || hasEastSilk);

  if (isScattered && duration < 8) {
    routeScore -= 35;
    warnings.push(
      `Wide geographical spread: Travel between North Sikkim (Lachen/Lachung) and West/South Sikkim (Pelling/Ravangla) requires backtracking and involves 6-8 hours of driving. We recommend focusing on a single loop for a ${duration}-day trip.`
    );
  }

  // 3. North Sikkim minimum days enforcement
  // Lachung and/or Lachen require at minimum 4 trip days for a realistic circuit:
  //   Day 1: Arrive Gangtok, Day 2: Gangtok acclimatize, Day 3: Transfer to North Sikkim,
  //   Day 4: Excursion + return to Gangtok
  const hasNorthOvernight = selectedDests.some(
    (d) => d.overnight && d.region === "North Sikkim" && (d.slug === "lachung" || d.slug === "lachen")
  );
  if (hasNorthOvernight && duration < 4) {
    routeScore -= 30;
    warnings.push(
      `North Sikkim circuit requires at least 4 trip days: Lachung/Lachen needs 1 day for transit in, 1 night in the valley, and 1 day for transit back to Gangtok. A ${duration}-day trip does not leave enough time for this loop.`
    );
  }

  // 4. Absolute day cap warning
  if (selectedDests.length > duration + 1) {
    routeScore -= 20;
    warnings.push(
      `Highly rushed itinerary: You have selected ${selectedDests.length} destinations for a ${duration}-day trip. This leaves less than a day per destination, resulting in an exhausting schedule.`
    );
  }

  return {
    isValid: warnings.length === 0,
    score: Math.max(0, routeScore),
    warnings
  };
}

/**
 * Optimizes the route by trimming geographical conflicts and recommending a compact loop.
 */
export function optimizeDestinationRoute({ selectedSlugs, duration, interests = [], travelIntelligence }) {
  const selectedDests = selectedSlugs
    .map((slug) => destinations.find((d) => d.slug === slug))
    .filter(Boolean);

  if (selectedDests.length === 0) {
    return {
      optimizedSlugs: [],
      reason: "No destinations selected to optimize."
    };
  }

  // Group selections by region
  const regionCounts = {};
  selectedDests.forEach((d) => {
    regionCounts[d.region] = (regionCounts[d.region] || 0) + 1;
  });

  // Find the primary region of interest (exclude East/Gangtok since it's the central transit hub)
  let primaryRegion = "East Sikkim";
  let maxCount = 0;

  Object.keys(regionCounts).forEach((reg) => {
    if (reg !== "East Sikkim" && regionCounts[reg] > maxCount) {
      maxCount = regionCounts[reg];
      primaryRegion = reg;
    }
  });

  // If they selected a scattered route, focus the optimized list on their primary overnight region + Gangtok
  let optimizedSlugs = [];
  let reasonText = "";

  if (primaryRegion === "North Sikkim") {
    // Focus North Loop: Gangtok (hub) + Lachen / Lachung + Yumthang / Gurudongmar
    optimizedSlugs = ["gangtok", "lachung", "yumthang-valley"];
    if (selectedSlugs.includes("lachen") || selectedSlugs.includes("gurudongmar-lake")) {
      optimizedSlugs.push("lachen");
    }
    reasonText = "We optimized your route to focus entirely on the North Sikkim loop (Gangtok, Lachung, Yumthang), removing West/South destinations to avoid 7+ hours of winding transfers.";
  } else if (primaryRegion === "West Sikkim" || primaryRegion === "South Sikkim") {
    // Focus West/South Loop: Gangtok + Pelling + Ravangla / Namchi
    optimizedSlugs = ["gangtok", "pelling", "ravangla"];
    if (selectedSlugs.includes("namchi") || selectedSlugs.includes("temi")) {
      optimizedSlugs.push("namchi");
    }
    reasonText = "We optimized your route to focus on the scenic West & South Sikkim loop (Gangtok, Pelling, Ravangla), removing high-altitude North destinations to eliminate backtracking.";
  } else {
    // Focus East: Gangtok + Tsomgo + Nathula
    optimizedSlugs = ["gangtok", "tsomgo-lake", "nathula"];
    reasonText = "We optimized your route to focus on the East Sikkim circuit (Gangtok, Tsomgo Lake, Nathula Pass) to match your compact trip duration.";
  }

  // Filter down to fit the duration limits
  const maxAllowedDestinations = Math.max(3, duration + 1);
  optimizedSlugs = optimizedSlugs.slice(0, maxAllowedDestinations);

  return {
    optimizedSlugs,
    reason: reasonText
  };
}

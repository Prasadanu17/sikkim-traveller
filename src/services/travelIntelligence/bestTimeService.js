import { seasonsData } from "../../data/seasons";

const INTEREST_MAPPINGS = {
  mountains: { sightseeing: 0.5, photography: 0.5 },
  snow: { snow: 1.0 },
  nature: { nature: 1.0 },
  photography: { photography: 1.0 },
  trekking: { trekking: 1.0 },
  relaxation: { sightseeing: 0.6, nature: 0.4 },
  culture: { culture: 1.0 },
  food: { culture: 0.5, sightseeing: 0.5 },
  roadtrip: { roadTrip: 1.0 },
  offbeat: { roadTrip: 0.5, nature: 0.5 },
  honeymoon: { sightseeing: 0.5, nature: 0.3, photography: 0.2 },
  family: { sightseeing: 0.7, roadTrip: 0.3 }
};

/**
 * Calculates a suitability score and related metadata for a single month.
 */
export function calculateMonthScore(monthData, { interests = [], destinations = [] }) {
  let score = 0;

  if (interests.length === 0) {
    const keys = Object.keys(monthData.suitability);
    const sum = keys.reduce((acc, k) => acc + monthData.suitability[k], 0);
    score = sum / keys.length;
  } else {
    let totalWeight = 0;
    let weightedSum = 0;

    interests.forEach((interest) => {
      const mapping = INTEREST_MAPPINGS[interest];
      if (mapping) {
        Object.keys(mapping).forEach((metric) => {
          const weight = mapping[metric];
          weightedSum += monthData.suitability[metric] * weight;
          totalWeight += weight;
        });
      }
    });

    score = totalWeight > 0 ? weightedSum / totalWeight : 70;
  }

  // Destination-specific penalties (e.g. North Sikkim / Mangan and old Silk Route / Pakyong switchbacks)
  const isHighAltitudeSelected = destinations.some((d) => {
    if (!d) return false;
    const dest = d.toLowerCase();
    return (
      dest.includes("mangan") ||
      dest.includes("pakyong") ||
      dest.includes("lachung") ||
      dest.includes("lachen") ||
      dest.includes("zuluk") ||
      dest.includes("north") ||
      dest.includes("silk") ||
      dest.includes("yumthang") ||
      dest.includes("gurudongmar") ||
      dest.includes("nathula")
    );
  });

  const considerations = [...monthData.considerations];
  const reasons = [];

  if (isHighAltitudeSelected) {
    const isWinter = [12, 1, 2].includes(monthData.month);
    const isMonsoon = [6, 7, 8].includes(monthData.month);

    if (isWinter) {
      score -= 15;
      if (!considerations.some((c) => c.includes("winter blocks"))) {
        considerations.push(
          "High altitude winter blocks: Roads to Gurudongmar Lake, Yumthang Valley, and Nathula Pass can be temporarily blocked by heavy winter snow."
        );
      }
    } else if (isMonsoon) {
      score -= 30;
      if (!considerations.some((c) => c.includes("Monsoon landslips"))) {
        considerations.push(
          "Monsoon landslips: High rainfall makes travel to North Sikkim (Mangan) and the old Silk Route (Zuluk) highly prone to landslides and road blockages."
        );
      }
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  // Generate reason tags based on matching selected interests and suitability
  if (interests.includes("snow") && monthData.suitability.snow >= 80) {
    reasons.push("Peak winter snow conditions");
  }
  if (interests.includes("nature") && monthData.suitability.nature >= 85) {
    reasons.push("Lush nature & flower blooms");
  }
  if (interests.includes("photography") && monthData.suitability.photography >= 85) {
    reasons.push("Crisp air & mountain clarity");
  }
  if (interests.includes("trekking") && monthData.suitability.trekking >= 85) {
    reasons.push("Excellent trail conditions");
  }
  if (interests.includes("roadtrip") && monthData.suitability.roadTrip >= 85) {
    reasons.push("Dry & safe highway driving conditions");
  }
  if (interests.includes("culture") && monthData.suitability.culture >= 80) {
    reasons.push("Vibrant local festival activities");
  }

  // Fallback reasons if no specific ones apply
  if (reasons.length === 0) {
    if (score >= 90) {
      reasons.push("Ideal overall climate for your selected activities");
    } else if (score >= 75) {
      reasons.push("Comfortable travel weather and good visibility");
    } else {
      reasons.push("Feasible conditions, with standard seasonal dynamics");
    }
  }

  // Combine highlights and custom reason tags for the final response
  return {
    score,
    reasons: reasons.slice(0, 3), // max 3 reasons
    considerations,
    highlights: monthData.highlights
  };
}

/**
 * Main service endpoint for calculating travel timing insights.
 */
export function getBestTravelWindow({ dates, duration, destinations = [], interests = [] }) {
  if (!dates || !dates.mode) {
    return {
      recommendedMonths: [],
      recommendedSeason: "",
      score: 0,
      rating: "Unknown",
      reasons: [],
      considerations: [],
      seasonalHighlights: []
    };
  }

  if (dates.mode === "fixed") {
    // FIXED DATE MODE ANALYSIS
    const startDate = new Date(dates.start);
    const endDate = new Date(dates.end);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return {
        score: 0,
        rating: "Invalid Dates",
        reasons: ["Please enter valid travel dates."],
        considerations: []
      };
    }

    // Determine overlapping months
    const startMonth = startDate.getMonth() + 1; // 1-12
    const endMonth = endDate.getMonth() + 1; // 1-12
    
    let overlappingMonthIndexes = [];
    if (startMonth === endMonth) {
      overlappingMonthIndexes = [startMonth];
    } else {
      // Handles spanning across consecutive months (or multiple)
      let current = startMonth;
      while (current !== endMonth) {
        overlappingMonthIndexes.push(current);
        current = current === 12 ? 1 : current + 1;
      }
      overlappingMonthIndexes.push(endMonth);
    }

    // Get average score across overlapping months
    let totalScore = 0;
    let allReasons = new Set();
    let allConsiderations = new Set();
    let allHighlights = new Set();

    overlappingMonthIndexes.forEach((mIndex) => {
      const monthData = seasonsData.find((s) => s.month === mIndex);
      if (monthData) {
        const res = calculateMonthScore(monthData, { interests, destinations });
        totalScore += res.score;
        res.reasons.forEach((r) => allReasons.add(r));
        res.considerations.forEach((c) => allConsiderations.add(c));
        res.highlights.forEach((h) => allHighlights.add(h));
      }
    });

    const averageScore = Math.round(totalScore / overlappingMonthIndexes.length);

    // Rating text mapping
    let rating = "Fair Match";
    if (averageScore >= 90) rating = "Excellent Match";
    else if (averageScore >= 75) rating = "Good Match";
    else if (averageScore < 60) rating = "Challenging Period";

    return {
      mode: "fixed",
      score: averageScore,
      rating,
      reasons: Array.from(allReasons).slice(0, 3),
      considerations: Array.from(allConsiderations),
      seasonalHighlights: Array.from(allHighlights).slice(0, 3)
    };
  } else {
    // FLEXIBLE DATE MODE ANALYSIS
    // Calculate for all 12 months
    const scoredMonths = seasonsData.map((monthData) => {
      const res = calculateMonthScore(monthData, { interests, destinations });
      return {
        month: monthData.month,
        name: monthData.name,
        season: monthData.season,
        score: res.score,
        reasons: res.reasons,
        considerations: res.considerations,
        highlights: res.highlights
      };
    });

    // Sort by score descending
    const rankedMonths = [...scoredMonths].sort((a, b) => b.score - a.score);

    // Top month will define the recommendedSeason
    const topMonth = rankedMonths[0];
    
    // Group adjacent highly scored months for windows (e.g. October - November)
    const bestMonths = rankedMonths.slice(0, 3);

    return {
      mode: "flexible",
      score: topMonth.score,
      recommendedSeason: topMonth.season,
      recommendedMonths: bestMonths.map((m) => m.name),
      rankedOptions: bestMonths.map((m) => ({
        name: m.name,
        season: m.season,
        score: m.score,
        reasons: m.reasons,
        considerations: m.considerations,
        highlights: m.highlights
      })),
      reasons: topMonth.reasons,
      considerations: topMonth.considerations,
      seasonalHighlights: topMonth.highlights.slice(0, 3)
    };
  }
}

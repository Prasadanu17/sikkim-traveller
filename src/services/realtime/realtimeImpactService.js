/**
 * Itinerary Real-Time Impact & Exposure Analyzer.
 * Maps current weather, road advisories, and permit rules against the user's generated itinerary.
 */

export function analyzeRealtimeImpact(itinerary, realtimeData) {
  if (!itinerary || !Array.isArray(itinerary.days) || !realtimeData) {
    return {
      overallStatus: "⚪ CURRENT DATA UNAVAILABLE",
      statusColor: "neutral",
      riskLevel: "UNKNOWN",
      exposurePercentage: 0,
      affectedDays: [],
      alerts: [],
      recommendations: []
    };
  }

  const { weather = {}, advisories = [], permits = [], statuses = {} } = realtimeData;
  const days = itinerary.days;
  const totalDays = days.length;
  const affectedDaySet = new Set();
  const alerts = [];
  const recommendations = [];

  days.forEach((day) => {
    const slug = day.baseLocation?.toLowerCase().replace(/\s+/g, "-") || "";
    const dayNum = day.dayNumber;

    // 1. Weather Impact Check
    const dayWeather = weather[slug];
    if (dayWeather && dayWeather.precipitationProbability >= 50) {
      affectedDaySet.add(dayNum);
      alerts.push({
        dayNumber: dayNum,
        type: "weather",
        title: `Precipitation Alert for Day ${dayNum} (${day.baseLocation})`,
        message: `${dayWeather.condition} (${dayWeather.precipitationProbability}% rain chance) forecast during your ${day.baseLocation} stay.`,
        severity: "NOTICE",
        sourceName: dayWeather.source?.name || "Weather Station",
        actionableRefinement: {
          label: `Ask AI to Adapt Day ${dayNum} for Weather`,
          instruction: `Make Day ${dayNum} weather-adaptive with more indoor & flexible activities.`
        }
      });
    }

    // 2. Road Advisory Impact Check
    const matchingAdvisories = advisories.filter((adv) =>
      adv.affectedDestinations?.includes(slug)
    );

    matchingAdvisories.forEach((adv) => {
      affectedDaySet.add(dayNum);
      alerts.push({
        dayNumber: dayNum,
        type: "advisory",
        title: adv.title,
        message: adv.message,
        severity: adv.severity || "NOTICE",
        sourceName: adv.sourceName,
        sourceUrl: adv.sourceUrl,
        actionableRefinement: {
          label: `Ask AI to Adjust Day ${dayNum} Route`,
          instruction: `Adjust Day ${dayNum} route to avoid travel advisories.`
        }
      });
    });

    // 3. Permit Check
    if (slug === "lachung" || slug === "lachen" || slug === "tsomgo-lake" || slug === "nathula") {
      alerts.push({
        dayNumber: dayNum,
        type: "permit",
        title: `Protected Area Permit Required for Day ${dayNum}`,
        message: `Day ${dayNum} visits ${day.baseLocation} which requires a valid Protected Area Permit (PAP). Ensure 24-hour lead time.`,
        severity: "INFO",
        sourceName: "Tourism & Civil Aviation Department",
        sourceUrl: "https://sikkimtourism.gov.in/Permits"
      });
    }
  });

  const affectedDaysArray = Array.from(affectedDaySet).sort((a, b) => a - b);
  const exposurePercentage = Math.round((affectedDaysArray.length / Math.max(1, totalDays)) * 100);

  // Determine overall trip status
  let overallStatus = "🟢 TRIP LOOKS GOOD";
  let statusColor = "emerald";
  let riskLevel = "LOW";

  const hasHighWarning = alerts.some((a) => a.severity === "HIGH" || a.severity === "WARNING");
  const hasNotice = alerts.some((a) => a.severity === "NOTICE");

  if (hasHighWarning) {
    overallStatus = "🔴 SIGNIFICANT TRAVEL ATTENTION";
    statusColor = "rose";
    riskLevel = "HIGH";
  } else if (hasNotice || exposurePercentage > 0) {
    overallStatus = "🟡 SOME THINGS TO WATCH";
    statusColor = "amber";
    riskLevel = "MODERATE";
  }

  return {
    overallStatus,
    statusColor,
    riskLevel,
    exposurePercentage,
    affectedDays: affectedDaysArray,
    alerts,
    recommendations,
    lastChecked: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  };
}

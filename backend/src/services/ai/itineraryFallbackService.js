/**
 * backend/src/services/ai/itineraryFallbackService.js
 * Deterministic Sikkim Travel Intelligence Fallback Generator.
 * Provides high-accuracy, geographically coherent Himalayan itineraries
 * when Gemini is unconfigured, rate-limited, or unavailable.
 */

const SIKKIM_DESTINATIONS = {
  gangtok: { name: "Gangtok", district: "East Sikkim", altitude: 1650, highlights: ["MG Marg", "Rumtek Monastery", "Tashi Viewpoint"] },
  lachung: { name: "Lachung", district: "North Sikkim", altitude: 2750, highlights: ["Yumthang Valley", "Zero Point", "Lachung Monastery"] },
  lachen: { name: "Lachen", district: "North Sikkim", altitude: 2750, highlights: ["Gurudongmar Lake", "Chopta Valley", "Lachen Monastery"] },
  pelling: { name: "Pelling", district: "West Sikkim", altitude: 2150, highlights: ["Pemayangtse Monastery", "Skywalk Chenrezig", "Rabdentse Ruins"] },
  ravangla: { name: "Ravangla", district: "South Sikkim", altitude: 2100, highlights: ["Buddha Park", "Ralang Monastery", "Temi Tea Garden"] },
  namchi: { name: "Namchi", district: "South Sikkim", altitude: 1675, highlights: ["Char Dham", "Samdruptse Hill", "Namchi Ropeway"] },
  "tsomgo-lake": { name: "Tsomgo Lake", district: "East Sikkim", altitude: 3753, highlights: ["Tsomgo Lake Yak Ride", "Baba Mandir", "Nathula Pass"] },
  yuksom: { name: "Yuksom", district: "West Sikkim", altitude: 1780, highlights: ["Dubdi Monastery", "Coronation Throne of Norbugang", "Trek Base"] },
  zuluk: { name: "Zuluk", district: "East Sikkim", altitude: 2865, highlights: ["Silk Route Zig-Zag Road", "Thambi Viewpoint", "Lungthung"] }
};

export function generateBackendFallbackItinerary(tripContext, regenerationPreference = null) {
  const duration = Number(tripContext?.duration) || 5;
  const travelers = tripContext?.travelers || { total: 2, type: "couple", adults: 2, children: 0, seniors: 0 };
  const travelStyle = tripContext?.travelStyle || "balanced";
  const budget = tripContext?.budget || { level: "comfortable", estimatedMin: 30000, estimatedMax: 50000 };
  const rawDestinations = tripContext?.destinations || [];

  // Resolve selected destination objects
  const destinations = rawDestinations.map(d => {
    if (typeof d === "string") return SIKKIM_DESTINATIONS[d.toLowerCase()] || { name: d, district: "Sikkim", highlights: ["Scenic View"] };
    return d;
  });

  const destNames = destinations.map(d => d.name || "Gangtok");
  const hasNorth = destinations.some(d => (d.district || "").includes("North") || ["lachung", "lachen"].includes(d.slug));
  const hasHighPass = destinations.some(d => ["tsomgo-lake", "lachung", "lachen", "nathula", "gurudongmar"].some(k => (d.slug || d.name || "").toLowerCase().includes(k)));
  const lang = tripContext?.language || "en";

  const days = [];
  const totalMinCost = budget.estimatedMin || 32000;
  const totalMaxCost = budget.estimatedMax || 48000;
  const dailyCostMin = Math.round(totalMinCost / duration);
  const dailyCostMax = Math.round(totalMaxCost / duration);

  for (let i = 1; i <= duration; i++) {
    let baseLocation = "Gangtok";
    let title = lang === "hi"
      ? `दिन ${i}: गंगटोक भ्रमण एवं दर्शनीय स्थल`
      : lang === "ne"
      ? `दिन ${i}: गान्तोक भ्रमण तथा रमणीय दृश्य`
      : `Day ${i}: Arrival & Gangtok Exploration`;
    let transit = null;

    if (i === 1) {
      baseLocation = "Gangtok";
      title = lang === "hi"
        ? "दिन 1: गंगटोक आगमन एवं अनुकूलन"
        : lang === "ne"
        ? "दिन 1: गान्तोक आगमन तथा अनुकूलन"
        : "Day 1: Arrival & Acclimatization in Gangtok";
      transit = [{ from: "Bagdogra Airport (IXB) / Siliguri", to: "Gangtok", duration: "4.5 hours", mode: "Private SUV / Cab" }];
    } else if (i === duration) {
      baseLocation = "Gangtok";
      title = lang === "hi"
        ? `दिन ${duration}: स्मृति चिन्ह खरीदारी एवं प्रस्थान`
        : lang === "ne"
        ? `दिन ${duration}: चिनो किनमेल तथा बिदाइ`
        : `Day ${duration}: Souvenir Shopping & Departure`;
      transit = [{ from: "Gangtok", to: "Bagdogra Airport (IXB) / NJP Railway", duration: "4.5 hours", mode: "Private SUV / Cab" }];
    } else if (hasNorth && i >= 2 && i <= 3) {
      baseLocation = "Lachung";
      title = lang === "hi"
        ? (i === 2 ? "दिन 2: सुरम्य लाचुंग यात्रा एवं झरना दर्शन" : "दिन 3: युमथांग फूलों की घाटी एवं जीरो प्वाइंट")
        : lang === "ne"
        ? (i === 2 ? "दिन 2: रमणीय लाचुङ यात्रा तथा झरना अवलोकन" : "दिन 3: युमथाङ उपत्यका तथा जिरो पोइन्ट")
        : (i === 2 ? "Day 2: Scenic Mountain Drive to North Sikkim (Lachung)" : "Day 3: Yumthang Valley & Zero Point Exploration");
      transit = i === 2 ? [{ from: "Gangtok", to: "Lachung", duration: "6 hours", mode: "Registered Mountain Cab" }] : null;
    } else if (destNames.some(n => n.includes("Pelling")) && i >= 3) {
      baseLocation = "Pelling";
      title = lang === "hi"
        ? `दिन ${i}: पश्चिमी सिक्किम विरासत एवं पेमायांगत्से मठ`
        : lang === "ne"
        ? `दिन ${i}: पश्चिम सिक्किम सम्पदा तथा पेमायाङत्से गुम्बा`
        : `Day ${i}: West Sikkim Heritage & Pemayangtse Monastery`;
      transit = [{ from: "Gangtok", to: "Pelling", duration: "4 hours", mode: "Private SUV" }];
    } else {
      baseLocation = "Gangtok";
      title = lang === "hi"
        ? `दिन ${i}: त्सोमगो झील एवं बाबा मंदिर दर्शन`
        : lang === "ne"
        ? `दिन ${i}: छोङ्गो ताल तथा बाबा मन्दिर दर्शन`
        : `Day ${i}: Tsomgo Lake & Baba Mandir Excursion`;
      transit = [{ from: "Gangtok", to: "Tsomgo Lake", duration: "2 hours", mode: "Protected Route Cab" }];
    }

    const morningActs = [
      { title: `Morning sight in ${baseLocation}`, description: `Explore scenic viewpoints and local culture in ${baseLocation}.`, duration: "2.5 hours" }
    ];
    const afternoonActs = [
      { title: `Afternoon tour in ${baseLocation}`, description: `Visit key historic landmarks and monasteries in ${baseLocation}.`, duration: "2 hours" }
    ];
    const eveningActs = [
      { title: `Evening at ${baseLocation}`, description: "Stroll through local markets and enjoy authentic Sikkimese delicacies.", duration: "1.5 hours" }
    ];

    const dayNotes = [];
    const dayWarnings = [];

    if (baseLocation === "Lachung") {
      dayNotes.push("Inner Line Permit (ILP) required. High altitude area (2,750m+); carry thermal layers.");
    }
    if (title.includes("Tsomgo")) {
      dayNotes.push("Protected Area Permit (PAP) required. Verify weather before departure.");
    }

    days.push({
      dayNumber: i,
      date: null,
      title,
      baseLocation,
      morning: morningActs,
      afternoon: travelStyle === "relaxed" && transit ? [] : afternoonActs,
      evening: eveningActs,
      travel: transit || [],
      meals: ["Fresh buffet breakfast at stay", "Traditional Sikkimese lunch", "Cozy dinner"],
      overnight: { location: baseLocation, accommodationType: "Comfortable Mountain Hotel / Homestay" },
      estimatedCost: { min: dailyCostMin, max: dailyCostMax, currency: "INR" },
      notes: dayNotes,
      warnings: dayWarnings
    });
  }

  return {
    tripTitle: `${duration}-Day Scenic Sikkim Exploration`,
    summary: `A carefully paced ${duration}-day journey covering ${destNames.slice(0, 3).join(", ")}, designed for a ${travelStyle} travel experience.`,
    overview: {
      duration,
      travelers: travelers.total,
      travelerType: travelers.type,
      travelStyle,
      route: destNames,
      estimatedCost: { min: totalMinCost, max: totalMaxCost, currency: "INR" }
    },
    whyThisTripWorks: [
      "Optimized to minimize backtracking along rugged Himalayan mountain highways.",
      "Gradual altitude ascent to allow safe acclimatization.",
      "Balances iconic high-pass natural spectacles with cultural heritage stops."
    ],
    days,
    budget: {
      accommodation: { min: Math.round(totalMinCost * 0.42), max: Math.round(totalMaxCost * 0.42) },
      transportation: { min: Math.round(totalMinCost * 0.35), max: Math.round(totalMaxCost * 0.35) },
      food: { min: Math.round(totalMinCost * 0.13), max: Math.round(totalMaxCost * 0.13) },
      activities: { min: Math.round(totalMinCost * 0.06), max: Math.round(totalMaxCost * 0.06) },
      miscellaneous: { min: Math.round(totalMinCost * 0.04), max: Math.round(totalMaxCost * 0.04) },
      total: { min: totalMinCost, max: totalMaxCost }
    },
    importantNotes: [
      "All restricted area permits (Nathula, Tsomgo, North Sikkim) are arranged through licensed tour operators.",
      "Travel times in the mountains depend significantly on road clearance and weather."
    ],
    warnings: hasHighPass ? ["High altitude areas present; carry warm windproof jackets and emergency medication."] : []
  };
}


/**
 * Road & Travel Advisory Provider.
 * Provides official regional travel advisories, high mountain pass conditions, and road status alerts.
 */

const REGIONAL_ADVISORIES = {
  "North Sikkim": [
    {
      id: "adv-north-1",
      severity: "NOTICE",
      title: "North Sikkim High Mountain Pass Clearance",
      message: "Chungthang to Lachung highway open for 4WD & commercial SUV permits. Flex travel recommended during afternoon hours.",
      affectedDestinations: ["lachung", "yumthang-valley", "zero-point"],
      sourceName: "Sikkim State Disaster Management Authority / Traffic Police",
      sourceUrl: "https://sikkim.gov.in/",
      updatedAt: new Date().toISOString()
    }
  ],
  "East Sikkim": [
    {
      id: "adv-east-1",
      severity: "INFO",
      title: "Jawaharlal Nehru Road (Nathula Pass) Operational",
      message: "Tsomgo Lake & Nathula Pass road operating normally under valid PAP permits.",
      affectedDestinations: ["tsomgo-lake", "nathula"],
      sourceName: "Sikkim Tourism Advisory Cell",
      sourceUrl: "https://sikkimtourism.gov.in/",
      updatedAt: new Date().toISOString()
    }
  ],
  "West Sikkim": [],
  "South Sikkim": []
};

export async function fetchRegionalAdvisories(regions = []) {
  const isMockMode = import.meta.env?.VITE_REALTIME_MOCK_MODE !== "false";

  if (isMockMode) {
    const activeAdvisories = [];
    regions.forEach((reg) => {
      if (REGIONAL_ADVISORIES[reg]) {
        activeAdvisories.push(...REGIONAL_ADVISORIES[reg]);
      }
    });

    return {
      advisories: activeAdvisories,
      confidence: "HIGH",
      source: {
        type: "official",
        name: "Sikkim State Tourism & SDMA Travel Portal",
        url: "https://sikkimtourism.gov.in/",
        retrievedAt: new Date().toISOString(),
        isCurrent: true,
        isDevMock: true
      }
    };
  }

  try {
    const endpoint = `${import.meta.env.VITE_REALTIME_API_ENDPOINT || "/api/realtime"}/advisories`;
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    return {
      advisories: [],
      status: "unavailable",
      source: null
    };
  }
}

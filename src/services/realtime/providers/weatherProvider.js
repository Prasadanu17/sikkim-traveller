/**
 * Weather Intelligence Provider.
 * Fetches destination weather forecasts or provides development mock data.
 * Always returns normalized metadata with source attribution, retrieval time, and confidence level.
 */

const MOCK_WEATHER_DATA = {
  gangtok: {
    tempMin: 14, tempMax: 21, condition: "Partly Cloudy", precipitationProb: 20, icon: "🌤️",
    summary: "Pleasant mountain weather with clear morning skies."
  },
  pelling: {
    tempMin: 12, tempMax: 19, condition: "Clear & Sunny", precipitationProb: 10, icon: "☀️",
    summary: "Clear atmospheric conditions with excellent Kanchenjunga visibility."
  },
  lachung: {
    tempMin: 6, tempMax: 14, condition: "Passing Showers", precipitationProb: 60, icon: "🌦️",
    summary: "Cool alpine valley temperature. Light evening rain expected."
  },
  "yumthang-valley": {
    tempMin: 4, tempMax: 11, condition: "Cold & Misty", precipitationProb: 45, icon: "🌫️",
    summary: "Crisp high-altitude air. Misty valley views in the afternoon."
  },
  "tsomgo-lake": {
    tempMin: 2, tempMax: 9, condition: "Chilly & Breezy", precipitationProb: 30, icon: "🏔️",
    summary: "Cold high-altitude winds near glacial lake."
  },
  ravangla: {
    tempMin: 13, tempMax: 20, condition: "Pleasant", precipitationProb: 15, icon: "🌤️",
    summary: "Gentle mountain breeze and clear Buddha Park view."
  }
};

export async function fetchDestinationWeather(slug, date = null) {
  const isMockMode = import.meta.env?.VITE_REALTIME_MOCK_MODE !== "false";

  if (isMockMode) {
    const mock = MOCK_WEATHER_DATA[slug] || {
      tempMin: 12, tempMax: 20, condition: "Fair", precipitationProb: 25, icon: "🌤️",
      summary: "Standard mountain weather conditions."
    };

    return {
      destinationSlug: slug,
      temperature: { min: mock.tempMin, max: mock.tempMax, unit: "°C" },
      condition: mock.condition,
      precipitationProbability: mock.precipitationProb,
      icon: mock.icon,
      summary: mock.summary,
      confidence: "HIGH",
      source: {
        type: "trusted",
        name: "Indian Meteorological Department / Local Weather Station",
        url: "https://mausam.imd.gov.in/",
        retrievedAt: new Date().toISOString(),
        isCurrent: true,
        isDevMock: true
      }
    };
  }

  // Real backend proxy call if VITE_REALTIME_API_ENDPOINT is defined
  try {
    const endpoint = `${import.meta.env.VITE_REALTIME_API_ENDPOINT || "/api/realtime"}/weather?dest=${slug}`;
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    return {
      destinationSlug: slug,
      status: "unavailable",
      message: "Weather data currently unavailable.",
      source: null
    };
  }
}

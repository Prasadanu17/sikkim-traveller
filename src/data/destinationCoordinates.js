/**
 * src/data/destinationCoordinates.js
 * Verified geographic coordinates and elevations for Sikkim destinations.
 * Data verified from Survey of India, Sikkim Tourism Development Corp, and OpenStreetMap.
 */

export const DESTINATION_COORDINATES = {
  gangtok: {
    name: "Gangtok",
    slug: "gangtok",
    lat: 27.3389,
    lng: 88.6065,
    elevationM: 1650,
    district: "Gangtok",
    circuit: "East Sikkim"
  },
  pelling: {
    name: "Pelling",
    slug: "pelling",
    lat: 27.3175,
    lng: 88.2396,
    elevationM: 2150,
    district: "Gyalshing",
    circuit: "West Sikkim"
  },
  lachung: {
    name: "Lachung",
    slug: "lachung",
    lat: 27.6891,
    lng: 88.7430,
    elevationM: 2750,
    district: "Mangan",
    circuit: "North Sikkim"
  },
  "yumthang-valley": {
    name: "Yumthang Valley",
    slug: "yumthang-valley",
    lat: 27.8268,
    lng: 88.6958,
    elevationM: 3564,
    district: "Mangan",
    circuit: "North Sikkim"
  },
  nathula: {
    name: "Nathula Pass",
    slug: "nathula",
    lat: 27.3865,
    lng: 88.8309,
    elevationM: 4310,
    district: "Pakyong",
    circuit: "East Sikkim"
  },
  "tsomgo-lake": {
    name: "Tsomgo Lake",
    slug: "tsomgo-lake",
    lat: 27.3742,
    lng: 88.7619,
    elevationM: 3753,
    district: "Pakyong",
    circuit: "East Sikkim"
  },
  ravangla: {
    name: "Ravangla",
    slug: "ravangla",
    lat: 27.3072,
    lng: 88.3630,
    elevationM: 2100,
    district: "Namchi",
    circuit: "South Sikkim"
  },
  zuluk: {
    name: "Zuluk",
    slug: "zuluk",
    lat: 27.2514,
    lng: 88.7778,
    elevationM: 2900,
    district: "Pakyong",
    circuit: "East Sikkim"
  },
  lachen: {
    name: "Lachen",
    slug: "lachen",
    lat: 27.7167,
    lng: 88.5577,
    elevationM: 2750,
    district: "Mangan",
    circuit: "North Sikkim"
  },
  "gurudongmar-lake": {
    name: "Gurudongmar Lake",
    slug: "gurudongmar-lake",
    lat: 28.0258,
    lng: 88.7099,
    elevationM: 5430,
    district: "Mangan",
    circuit: "North Sikkim"
  },
  "zero-point": {
    name: "Zero Point",
    slug: "zero-point",
    lat: 27.8928,
    lng: 88.7302,
    elevationM: 4724,
    district: "Mangan",
    circuit: "North Sikkim"
  },
  yuksom: {
    name: "Yuksom",
    slug: "yuksom",
    lat: 27.3719,
    lng: 88.2215,
    elevationM: 1780,
    district: "Gyalshing",
    circuit: "West Sikkim"
  },
  khecheopalri: {
    name: "Khecheopalri Lake",
    slug: "khecheopalri",
    lat: 27.3524,
    lng: 88.1994,
    elevationM: 1700,
    district: "Gyalshing",
    circuit: "West Sikkim"
  },
  namchi: {
    name: "Namchi",
    slug: "namchi",
    lat: 27.1654,
    lng: 88.3644,
    elevationM: 1675,
    district: "Namchi",
    circuit: "South Sikkim"
  },
  temi: {
    name: "Temi Tea Garden",
    slug: "temi",
    lat: 27.2369,
    lng: 88.4214,
    elevationM: 1750,
    district: "Namchi",
    circuit: "South Sikkim"
  }
};

/**
 * Normalizes input string to look up verified coordinates.
 * Handles slug, name, or partial name matches.
 * Returns null if no verified coordinates exist (never invents coordinates).
 */
export function getDestinationGeoData(slugOrName) {
  if (!slugOrName || typeof slugOrName !== "string") return null;

  const clean = slugOrName.trim().toLowerCase().replace(/[\s_]+/g, "-");

  // Direct slug lookup
  if (DESTINATION_COORDINATES[clean]) {
    return DESTINATION_COORDINATES[clean];
  }

  // Name match
  const entry = Object.values(DESTINATION_COORDINATES).find(
    (item) => item.name.toLowerCase() === slugOrName.trim().toLowerCase() ||
              item.slug.toLowerCase() === clean
  );
  if (entry) return entry;

  // Fuzzy partial match
  const partial = Object.values(DESTINATION_COORDINATES).find(
    (item) => slugOrName.toLowerCase().includes(item.slug) ||
              item.name.toLowerCase().includes(slugOrName.toLowerCase())
  );

  return partial || null;
}

/**
 * backend/src/services/realtime/weatherService.js
 * Open-Meteo weather proxy with caching.
 *
 * Weather API keys never exposed to the browser.
 * Caches results to reduce API calls.
 * Falls back gracefully on network errors.
 */

import prisma from '../../config/database.js';
import env from '../../config/env.js';

// In-memory cache: slug → { data, fetchedAt }
const cache = new Map();

// Destination coordinates for Open-Meteo
const DESTINATION_COORDS = {
  gangtok:       { lat: 27.3389, lon: 88.6065, name: 'Gangtok' },
  pelling:       { lat: 27.2956, lon: 88.2339, name: 'Pelling' },
  lachung:       { lat: 27.6920, lon: 88.7450, name: 'Lachung' },
  lachen:        { lat: 27.7271, lon: 88.5612, name: 'Lachen' },
  yumthang:      { lat: 27.8240, lon: 88.7187, name: 'Yumthang Valley' },
  nathula:       { lat: 27.3869, lon: 88.8387, name: 'Nathula Pass' },
  tsomgo:        { lat: 27.3724, lon: 88.7729, name: 'Tsomgo Lake' },
  ravangla:      { lat: 27.3015, lon: 88.3626, name: 'Ravangla' },
  namchi:        { lat: 27.1661, lon: 88.3601, name: 'Namchi' },
  zuluk:         { lat: 27.2278, lon: 88.7741, name: 'Zuluk' },
  gurudongmar:   { lat: 27.8833, lon: 88.7028, name: 'Gurudongmar Lake' },
  'north-sikkim': { lat: 27.6920, lon: 88.7450, name: 'North Sikkim' },
  default:       { lat: 27.3389, lon: 88.6065, name: 'Sikkim' },
};

function weatherCodeToCondition(code) {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 49) return 'Foggy / Misty';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowfall';
  if (code <= 82) return 'Showers';
  if (code <= 86) return 'Heavy snow showers';
  return 'Thunderstorm';
}

function riskLevel(precipProb, windSpeed, weatherCode) {
  if (precipProb > 70 || windSpeed > 40 || weatherCode >= 80) return 'HIGH';
  if (precipProb > 40 || windSpeed > 25 || weatherCode >= 61) return 'MEDIUM';
  return 'LOW';
}

/**
 * Fetches current weather for a destination slug.
 * Uses Open-Meteo (no API key required).
 * @param {string} slug - Destination slug
 * @returns {object} Normalized weather data
 */
export async function getWeatherForDestination(slug) {
  const normalizedSlug = (slug || 'gangtok').toLowerCase().trim();
  const cacheTTL = env.WEATHER_CACHE_TTL_MINUTES * 60 * 1000;
  const cached = cache.get(normalizedSlug);

  if (cached && Date.now() - cached.fetchedAt < cacheTTL) {
    return { ...cached.data, _fromCache: true };
  }

  const coords = DESTINATION_COORDS[normalizedSlug] || DESTINATION_COORDS.default;
  const baseUrl = env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com/v1';
  const url = `${baseUrl}/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,apparent_temperature,precipitation_probability,wind_speed_10m,weather_code&forecast_days=1&timezone=Asia%2FKolkata`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`Open-Meteo returned ${response.status}`);

    const json = await response.json();
    const current = json.current;

    const weatherCode = current.weather_code ?? 0;
    const precipProb = current.precipitation_probability ?? 0;
    const windSpeed = current.wind_speed_10m ?? 0;
    const temp = Math.round(current.temperature_2m ?? 15);
    const feelsLike = Math.round(current.apparent_temperature ?? temp);
    const condition = weatherCodeToCondition(weatherCode);
    const risk = riskLevel(precipProb, windSpeed, weatherCode);

    const data = {
      destination: coords.name,
      slug: normalizedSlug,
      temperature: temp,
      feelsLike,
      condition,
      precipitationProbability: precipProb,
      windSpeed,
      weatherCode,
      riskLevel: risk,
      overallStatus: risk === 'HIGH'
        ? '🔴 Adverse Weather Conditions'
        : risk === 'MEDIUM'
          ? '🟡 Variable Conditions'
          : '🟢 Normal Road Conditions',
      source: 'Open-Meteo',
      lastCheckedAt: new Date().toLocaleTimeString('en-IN'),
      fetchedAt: new Date().toISOString(),
    };

    cache.set(normalizedSlug, { data, fetchedAt: Date.now() });

    // Persist snapshot to DB (non-blocking)
    prisma.weatherSnapshot.create({
      data: {
        destinationSlug: normalizedSlug,
        temp: `${temp}°C`,
        condition,
        precipProb,
        windSpeed,
        source: 'open-meteo',
      }
    }).catch(() => {});

    return data;
  } catch (err) {
    console.warn(`[WeatherService] Fetch failed for ${normalizedSlug}:`, err.message);

    // Return fallback with stale indicator
    if (cached) {
      return { ...cached.data, _stale: true, _fromCache: true };
    }

    return {
      destination: coords.name,
      slug: normalizedSlug,
      temperature: 15,
      condition: 'Data unavailable',
      precipitationProbability: 0,
      windSpeed: 0,
      riskLevel: 'LOW',
      overallStatus: '⚪ Weather data temporarily unavailable',
      source: 'fallback',
      _fallback: true,
      lastCheckedAt: new Date().toLocaleTimeString('en-IN'),
      fetchedAt: new Date().toISOString(),
    };
  }
}

/**
 * Gets weather for multiple destinations in a journey.
 * @param {string[]} slugs
 */
export async function getWeatherForJourney(slugs = []) {
  const targets = slugs.length > 0 ? slugs : ['gangtok'];
  const results = await Promise.allSettled(targets.map(slug => getWeatherForDestination(slug)));

  return results.map((r, i) =>
    r.status === 'fulfilled' ? r.value : {
      destination: targets[i],
      condition: 'Unavailable',
      riskLevel: 'LOW',
      _error: true,
    }
  );
}

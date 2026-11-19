/**
 * src/config/apiConfig.js
 * Centralized API configuration and URL resolution for all frontend network requests.
 * Supports both same-origin reverse proxy deployments (relative /api paths)
 * and cross-origin separate backend deployments via VITE_API_URL.
 */

const RAW_BASE = (import.meta.env?.VITE_API_URL || '').trim();
export const API_BASE_URL = RAW_BASE.endsWith('/') ? RAW_BASE.slice(0, -1) : RAW_BASE;

// Warn in production if separate domain hosting is used but VITE_API_URL is unset
if (import.meta.env?.PROD && !API_BASE_URL && typeof window !== 'undefined') {
  // If not on localhost, log an operational advisory
  if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    console.info('[apiConfig] VITE_API_URL is not set; falling back to same-origin relative endpoints (/api/*).');
  }
}

/**
 * Builds a fully qualified or relative API URL.
 * @param {string} path - e.g. "/api/generate-itinerary"
 * @returns {string} - e.g. "https://api-staging.sikkim-traveller.com/api/generate-itinerary" or "/api/generate-itinerary"
 */
export function buildApiUrl(path) {
  if (!path) return API_BASE_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

function resolveEndpoint(envOverride, defaultPath) {
  if (envOverride) {
    if (envOverride.startsWith('http://') || envOverride.startsWith('https://')) {
      return envOverride;
    }
    return buildApiUrl(envOverride);
  }
  return buildApiUrl(defaultPath);
}

export const API_ENDPOINTS = {
  GENERATE_ITINERARY: resolveEndpoint(import.meta.env?.VITE_ITINERARY_API_ENDPOINT, '/api/generate-itinerary'),
  REFINE_ITINERARY: resolveEndpoint(import.meta.env?.VITE_REFINEMENT_API_ENDPOINT, '/api/refine-itinerary'),
  COPILOT: resolveEndpoint(import.meta.env?.VITE_COPILOT_API_ENDPOINT, '/api/copilot'),
  COPILOT_STREAM: resolveEndpoint(import.meta.env?.VITE_COPILOT_STREAM_ENDPOINT, '/api/copilot/stream'),
  BOOKING_REQUEST: buildApiUrl('/api/booking-request'),
  CUSTOMER_BASE: resolveEndpoint(import.meta.env?.VITE_CUSTOMER_API_BASE_URL, '/api/customer'),
};

export default {
  API_BASE_URL,
  buildApiUrl,
  API_ENDPOINTS
};

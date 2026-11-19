import { describe, it, expect } from 'vitest';

describe('Phase 1 & Phase 7: Frontend API Configuration Resolution', () => {
  function createApiConfig(viteApiUrl = '', overrides = {}) {
    const rawBase = viteApiUrl.trim();
    const apiBaseUrl = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

    function buildApiUrl(path) {
      if (!path) return apiBaseUrl;
      if (path.startsWith('http://') || path.startsWith('https://')) return path;
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `${apiBaseUrl}${cleanPath}`;
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

    return {
      API_BASE_URL: apiBaseUrl,
      buildApiUrl,
      API_ENDPOINTS: {
        GENERATE_ITINERARY: resolveEndpoint(overrides.VITE_ITINERARY_API_ENDPOINT, '/api/generate-itinerary'),
        REFINE_ITINERARY: resolveEndpoint(overrides.VITE_REFINEMENT_API_ENDPOINT, '/api/refine-itinerary'),
        COPILOT: resolveEndpoint(overrides.VITE_COPILOT_API_ENDPOINT, '/api/copilot'),
        COPILOT_STREAM: resolveEndpoint(overrides.VITE_COPILOT_STREAM_ENDPOINT, '/api/copilot/stream'),
        BOOKING_REQUEST: buildApiUrl('/api/booking-request'),
        CUSTOMER_BASE: resolveEndpoint(overrides.VITE_CUSTOMER_API_BASE_URL, '/api/customer')
      }
    };
  }

  it('correctly uses relative paths when VITE_API_URL is empty (same-origin proxy mode)', () => {
    const config = createApiConfig('');
    expect(config.API_BASE_URL).toBe('');
    expect(config.buildApiUrl('/api/generate-itinerary')).toBe('/api/generate-itinerary');
    expect(config.API_ENDPOINTS.GENERATE_ITINERARY).toBe('/api/generate-itinerary');
    expect(config.API_ENDPOINTS.COPILOT_STREAM).toBe('/api/copilot/stream');
  });

  it('resolves cross-origin staging backend when VITE_API_URL is configured', () => {
    const config = createApiConfig('https://api-staging.sikkim-traveller.com');
    expect(config.API_BASE_URL).toBe('https://api-staging.sikkim-traveller.com');
    expect(config.buildApiUrl('/api/generate-itinerary')).toBe('https://api-staging.sikkim-traveller.com/api/generate-itinerary');
    expect(config.API_ENDPOINTS.GENERATE_ITINERARY).toBe('https://api-staging.sikkim-traveller.com/api/generate-itinerary');
    expect(config.API_ENDPOINTS.COPILOT_STREAM).toBe('https://api-staging.sikkim-traveller.com/api/copilot/stream');
    expect(config.API_ENDPOINTS.REFINE_ITINERARY).toBe('https://api-staging.sikkim-traveller.com/api/refine-itinerary');
    expect(config.API_ENDPOINTS.BOOKING_REQUEST).toBe('https://api-staging.sikkim-traveller.com/api/booking-request');
    expect(config.API_ENDPOINTS.CUSTOMER_BASE).toBe('https://api-staging.sikkim-traveller.com/api/customer');
  });

  it('safely strips trailing slash from VITE_API_URL', () => {
    const config = createApiConfig('https://api-staging.sikkim-traveller.com/');
    expect(config.API_BASE_URL).toBe('https://api-staging.sikkim-traveller.com');
    expect(config.buildApiUrl('/api/customer')).toBe('https://api-staging.sikkim-traveller.com/api/customer');
  });

  it('preserves absolute URLs passed to buildApiUrl', () => {
    const config = createApiConfig('https://api-staging.sikkim-traveller.com');
    expect(config.buildApiUrl('https://custom-service.com/api/test')).toBe('https://custom-service.com/api/test');
  });

  it('handles relative override while correctly prepending VITE_API_URL', () => {
    const config = createApiConfig('https://api-staging.sikkim-traveller.com', {
      VITE_COPILOT_STREAM_ENDPOINT: '/custom/v2/stream'
    });
    expect(config.API_ENDPOINTS.COPILOT_STREAM).toBe('https://api-staging.sikkim-traveller.com/custom/v2/stream');
  });
});

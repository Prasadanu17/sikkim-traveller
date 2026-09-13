/**
 * In-Memory TTL Cache & Request Deduplication Manager.
 * Prevents redundant external fetches, tracks freshness state, and deduplicates in-flight requests.
 */

const cacheStore = new Map();
const inFlightRequests = new Map();

// Default TTLs in milliseconds
const TTL_WEATHER = 10 * 60 * 1000;  // 10 mins
const TTL_ADVISORY = 30 * 60 * 1000; // 30 mins

export function getFreshnessState(timestamp) {
  if (!timestamp) return "UNKNOWN";
  const ageMs = Date.now() - new Date(timestamp).getTime();
  if (ageMs < 5 * 60 * 1000) return "FRESH";
  if (ageMs < 15 * 60 * 1000) return "RECENT";
  if (ageMs < 30 * 60 * 1000) return "STALE";
  return "EXPIRED";
}

export function getCached(key) {
  const cached = cacheStore.get(key);
  if (!cached) return null;

  const freshness = getFreshnessState(cached.timestamp);
  if (freshness === "EXPIRED") {
    cacheStore.delete(key);
    return null;
  }

  return {
    data: cached.data,
    freshness,
    timestamp: cached.timestamp
  };
}

export function setCached(key, data, ttl = TTL_WEATHER) {
  cacheStore.set(key, {
    data,
    timestamp: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ttl).toISOString()
  });
}

/**
 * Deduplicates in-flight async requests for the same cache key.
 */
export async function deduplicateRequest(key, fetchFn) {
  const cached = getCached(key);
  if (cached && cached.freshness !== "STALE") {
    return cached.data;
  }

  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }

  const promise = fetchFn()
    .then((result) => {
      setCached(key, result);
      inFlightRequests.delete(key);
      return result;
    })
    .catch((err) => {
      inFlightRequests.delete(key);
      throw err;
    });

  inFlightRequests.set(key, promise);
  return promise;
}

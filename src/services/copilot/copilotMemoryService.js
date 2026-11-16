/**
 * src/services/copilot/copilotMemoryService.js
 * Persistent Copilot Session Memory & Active Travel Constraints Manager.
 *
 * Persistence Policy:
 * - Survives Browser Refresh: Yes (backed by sessionStorage scoped to current tab).
 * - Survives Tab Closure: No (cleanly discarded by browser sessionStorage lifecycle).
 * - Survives Browser Restart: No (cleanly discarded to avoid stale constraints).
 *
 * Guarantees:
 * - Session Isolation: Separate session IDs prevent cross-tab or cross-journey memory sharing.
 * - Deduplication: Prevents duplicate messages upon rehydration or rapid re-renders.
 * - Non-Destructive Reset: Resetting memory never deletes planner state or user journey drafts.
 * - Safe Fallback: Operates in-memory if sessionStorage is unavailable or quota is exceeded.
 */

const STORAGE_PREFIX = "st_copilot_sess_";
const ACTIVE_SESSION_KEY = "st_copilot_active_session_id";
const MAX_HISTORY_LENGTH = 20;

export const DEFAULT_CONSTRAINTS = {
  budgetCap: null,
  budgetTier: null,
  avoidLongDrives: false,
  keepNorthSikkim: false,
  preferredTransport: null,
  preferredStay: null,
  pacePreference: null,
  preferredDestinations: [],
  excludedDestinations: [],
  appliedRefinements: [],
  preferredLanguage: 'en'
};

let memoryStore = {
  sessionId: null,
  constraints: { ...DEFAULT_CONSTRAINTS },
  history: [],
  createdAt: null,
  updatedAt: null
};

// Safe storage accessors
function getStorage() {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      return window.sessionStorage;
    }
  } catch (_) {}
  return null;
}

function generateNewSessionId() {
  const rand = Math.random().toString(36).substring(2, 9);
  return `sess_${Date.now()}_${rand}`;
}

function persistToStorage() {
  const storage = getStorage();
  if (!storage || !memoryStore.sessionId) return;

  try {
    const payload = JSON.stringify({
      sessionId: memoryStore.sessionId,
      constraints: memoryStore.constraints,
      history: memoryStore.history,
      createdAt: memoryStore.createdAt,
      updatedAt: new Date().toISOString()
    });

    storage.setItem(`${STORAGE_PREFIX}${memoryStore.sessionId}`, payload);
    storage.setItem(ACTIVE_SESSION_KEY, memoryStore.sessionId);
  } catch (err) {
    console.warn("[CopilotMemory] Failed to persist to sessionStorage:", err.message);
  }
}

function rehydrateFromStorage() {
  const storage = getStorage();
  if (!storage) {
    if (!memoryStore.sessionId) {
      memoryStore.sessionId = generateNewSessionId();
      memoryStore.createdAt = new Date().toISOString();
      memoryStore.updatedAt = memoryStore.createdAt;
    }
    return;
  }

  try {
    const activeId = storage.getItem(ACTIVE_SESSION_KEY);
    if (!activeId) {
      // First time in this tab: start fresh session
      initNewSession();
      return;
    }

    const rawData = storage.getItem(`${STORAGE_PREFIX}${activeId}`);
    if (!rawData) {
      initNewSession();
      return;
    }

    const parsed = JSON.parse(rawData);
    if (parsed && typeof parsed === "object" && parsed.sessionId) {
      memoryStore.sessionId = parsed.sessionId;
      memoryStore.constraints = { ...DEFAULT_CONSTRAINTS, ...(parsed.constraints || {}) };
      memoryStore.history = Array.isArray(parsed.history) ? parsed.history : [];
      memoryStore.createdAt = parsed.createdAt || new Date().toISOString();
      memoryStore.updatedAt = parsed.updatedAt || new Date().toISOString();
    } else {
      initNewSession();
    }
  } catch (err) {
    console.warn("[CopilotMemory] Corrupted storage detected, resetting session:", err.message);
    initNewSession();
  }
}

function initNewSession() {
  const newId = generateNewSessionId();
  const now = new Date().toISOString();
  memoryStore = {
    sessionId: newId,
    constraints: { ...DEFAULT_CONSTRAINTS },
    history: [],
    createdAt: now,
    updatedAt: now
  };
  persistToStorage();
}

// Immediately rehydrate on module load
rehydrateFromStorage();

/**
 * Get active session ID
 */
export function getCurrentSessionId() {
  if (!memoryStore.sessionId) {
    rehydrateFromStorage();
  }
  return memoryStore.sessionId;
}

/**
 * Get snapshot of active travel constraints
 */
export function getSessionConstraints() {
  if (!memoryStore.sessionId) {
    rehydrateFromStorage();
  }
  return { ...memoryStore.constraints };
}

/**
 * Update constraints: newly provided values cleanly overwrite older values
 */
export function updateSessionConstraints(updates = {}) {
  if (!updates || typeof updates !== "object") return getSessionConstraints();

  memoryStore.constraints = {
    ...memoryStore.constraints,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  persistToStorage();
  return getSessionConstraints();
}

/**
 * Get active user language preference ('en', 'hi', 'ne')
 */
export function getPreferredLanguage() {
  if (!memoryStore.sessionId) {
    rehydrateFromStorage();
  }
  return memoryStore.constraints?.preferredLanguage || 'en';
}

/**
 * Set and persist active user language preference
 */
export function setPreferredLanguage(lang) {
  if (!['en', 'hi', 'ne'].includes(lang)) return getPreferredLanguage();
  updateSessionConstraints({ preferredLanguage: lang });
  return lang;
}

/**
 * Append a preferred destination to constraints without duplicates
 */
export function addPreferredDestination(destSlug) {
  if (!destSlug) return;
  const current = memoryStore.constraints.preferredDestinations || [];
  if (!current.includes(destSlug)) {
    updateSessionConstraints({
      preferredDestinations: [...current, destSlug],
      excludedDestinations: (memoryStore.constraints.excludedDestinations || []).filter((s) => s !== destSlug)
    });
  }
}

/**
 * Append an excluded destination to constraints without duplicates
 */
export function addExcludedDestination(destSlug) {
  if (!destSlug) return;
  const current = memoryStore.constraints.excludedDestinations || [];
  if (!current.includes(destSlug)) {
    updateSessionConstraints({
      excludedDestinations: [...current, destSlug],
      preferredDestinations: (memoryStore.constraints.preferredDestinations || []).filter((s) => s !== destSlug)
    });
  }
}

/**
 * Track an applied itinerary refinement in session memory
 */
export function recordAppliedRefinement(instruction) {
  if (!instruction) return;
  const record = {
    instruction,
    appliedAt: new Date().toISOString()
  };

  const history = memoryStore.constraints.appliedRefinements || [];
  updateSessionConstraints({
    appliedRefinements: [...history, record]
  });
}

/**
 * Get conversation history for current session
 */
export function getConversationHistory() {
  if (!memoryStore.sessionId) {
    rehydrateFromStorage();
  }
  return [...memoryStore.history];
}

/**
 * Add a message with deduplication protection
 */
export function addMessageToHistory(role, content, metadata = {}) {
  if (!content) return null;

  // Deduplication check: if latest message in history has identical role and content, skip
  const latest = memoryStore.history[memoryStore.history.length - 1];
  if (latest && latest.role === role && latest.content === content) {
    return latest;
  }

  const msg = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    role, // 'user' | 'assistant'
    content,
    metadata,
    timestamp: new Date().toISOString()
  };

  memoryStore.history.push(msg);

  // Maintain max window for token efficiency
  if (memoryStore.history.length > MAX_HISTORY_LENGTH) {
    memoryStore.history = memoryStore.history.slice(memoryStore.history.length - MAX_HISTORY_LENGTH);
  }

  persistToStorage();
  return msg;
}

/**
 * Reset Copilot conversation:
 * - Purges the current session from storage
 * - Clears in-memory messages and constraints
 * - Generates a fresh unique sessionId
 * - Initializes clean session storage
 */
export function clearCopilotMemory() {
  const storage = getStorage();
  if (storage && memoryStore.sessionId) {
    try {
      storage.removeItem(`${STORAGE_PREFIX}${memoryStore.sessionId}`);
    } catch (_) {}
  }

  initNewSession();
  return {
    sessionId: memoryStore.sessionId,
    message: "Conversation reset successfully with new session ID."
  };
}

/**
 * Copilot Session Memory & Active Constraints Manager.
 * Preserves user constraints (e.g. avoidLongDrives, keepNorthSikkim) and conversation state.
 * Scoped strictly to current session — stores zero sensitive personal data.
 */

let activeSessionConstraints = {
  avoidLongDrives: false,
  keepNorthSikkim: false,
  preferredTransport: null,
  preferredStay: null
};

let conversationHistory = [];

export function getSessionConstraints() {
  return { ...activeSessionConstraints };
}

export function updateSessionConstraints(updates) {
  activeSessionConstraints = {
    ...activeSessionConstraints,
    ...updates
  };
  return getSessionConstraints();
}

export function getConversationHistory() {
  return [...conversationHistory];
}

export function addMessageToHistory(role, content, metadata = {}) {
  const msg = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    role, // 'user' | 'assistant'
    content,
    metadata,
    timestamp: new Date().toISOString()
  };

  conversationHistory.push(msg);

  // Keep last 15 messages max for token efficiency
  if (conversationHistory.length > 15) {
    conversationHistory = conversationHistory.slice(conversationHistory.length - 15);
  }

  return msg;
}

export function clearCopilotMemory() {
  activeSessionConstraints = {
    avoidLongDrives: false,
    keepNorthSikkim: false,
    preferredTransport: null,
    preferredStay: null
  };
  conversationHistory = [];
}

/**
 * Multi-Source Conflict Resolution Service.
 * Evaluates overlapping information from multiple providers and applies Source Authority Hierarchy:
 * Official Government (1) > Tourism Authority (2) > Trusted Weather Service (3) > Secondary (4).
 */

const SOURCE_PRIORITY = {
  official: 1,
  trusted: 2,
  secondary: 3,
  ai: 4
};

export function resolveSourceConflicts(items = []) {
  if (!Array.isArray(items) || items.length <= 1) {
    return { resolvedItem: items[0] || null, hasConflict: false };
  }

  // Sort by authority priority ascending (1 highest)
  const sorted = [...items].sort((a, b) => {
    const priorityA = SOURCE_PRIORITY[a?.source?.type] || 99;
    const priorityB = SOURCE_PRIORITY[b?.source?.type] || 99;
    return priorityA - priorityB;
  });

  const highestAuthority = sorted[0];
  const hasDisagreement = items.some(
    (item) => item.status !== highestAuthority.status || item.condition !== highestAuthority.condition
  );

  return {
    resolvedItem: highestAuthority,
    hasConflict: hasDisagreement,
    conflictingSources: hasDisagreement ? items.map((i) => i.source?.name).filter(Boolean) : []
  };
}

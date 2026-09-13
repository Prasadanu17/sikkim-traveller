/**
 * travelPreferenceService.js
 * MODULE 4: Analyzes the full planner state to surface compatibility notices,
 * traveler-aware recommendations, and destination-aware transport notes.
 * Pure functions — no side effects, no API calls.
 */

/** Slugs that indicate North Sikkim high-altitude destinations */
const NORTH_SIKKIM_SLUGS = ["lachung", "lachen", "yumthang", "gurudongmar-lake", "zero-point", "mangan"];
/** Slugs that indicate Silk Route / East remote destinations */
const SILK_ROUTE_SLUGS = ["zuluk", "pakyong", "silk-route"];
/** Slugs broadly considered remote or high-altitude */
const REMOTE_SLUGS = [...NORTH_SIKKIM_SLUGS, ...SILK_ROUTE_SLUGS, "dzongri", "goecha-la"];

/**
 * Generates traveler-aware accommodation and transport recommendations
 * based on traveler profile, pace, budget, and destinations.
 */
export function getTravelPreferenceRecommendations({
  travelers,
  travelStyle,
  budget,
  destinations = [],
  accommodation = {},
  transportation = {}
}) {
  const notes = [];
  const accommodationSuggestions = [];
  const transportSuggestions = [];

  const { type, adults, children, seniors, total } = travelers;
  const budgetLevel = budget?.level || "comfortable";
  const hasChildren = children > 0;
  const hasSeniors = seniors > 0;
  const hasNorth = destinations.some((d) =>
    NORTH_SIKKIM_SLUGS.some((slug) => d.toLowerCase().includes(slug))
  );
  const hasSilk = destinations.some((d) =>
    SILK_ROUTE_SLUGS.some((slug) => d.toLowerCase().includes(slug))
  );
  const hasRemote = destinations.some((d) =>
    REMOTE_SLUGS.some((slug) => d.toLowerCase().includes(slug))
  );

  // ─── TRAVELER-TYPE TRANSPORT RECOMMENDATIONS ──────────────────────────────
  if (type === "solo" && budgetLevel === "budget") {
    transportSuggestions.push("Shared Sumo transport is cost-efficient for solo travelers on a budget route.");
  }
  if (type === "couple" || type === "friends") {
    transportSuggestions.push("Private transport offers flexibility for couples and small groups on Sikkim's mountain roads.");
  }
  if (type === "family" && hasChildren) {
    transportSuggestions.push("Private transport is strongly recommended for families with children — shared Sumos can be cramped on long mountain routes.");
  }
  if (hasSeniors) {
    transportSuggestions.push("For senior travelers, private transport with flexible stop options provides greater comfort on winding mountain roads.");
  }
  if (total > 6) {
    transportSuggestions.push(`Your group of ${total} may need more than one vehicle. We'll account for this in the planning estimate.`);
  }

  // ─── TRAVELER-TYPE ACCOMMODATION RECOMMENDATIONS ─────────────────────────
  if (type === "solo") {
    accommodationSuggestions.push("Homestays and guesthouses are ideal for solo travelers — cost-efficient and culturally rich.");
  }
  if (type === "couple") {
    accommodationSuggestions.push("Boutique stays and hotels with mountain-view rooms are popular for couples visiting Sikkim.");
  }
  if (type === "family" && hasChildren) {
    accommodationSuggestions.push("Family rooms or connecting double rooms are recommended. Look for properties with garden access or common areas for children.");
  }
  if (hasSeniors) {
    accommodationSuggestions.push("Properties at lower elevations with lift/lift access and warm rooms are more comfortable for senior travelers.");
  }
  if (type === "group") {
    accommodationSuggestions.push("Large groups may benefit from resort or hotel blocks that can accommodate multiple rooms in the same property.");
  }

  // ─── PACE + DRIVE CONFLICT ────────────────────────────────────────────────
  const driveTolerance = transportation?.longDriveTolerance;
  if (travelStyle === "packed" && (driveTolerance === "prefer-shorter" || driveTolerance === "moderate")) {
    notes.push({
      type: "warning",
      message:
        "Your packed travel pace combined with a preference for shorter drives may create back-to-back tight travel days. Consider switching to a balanced pace or reducing destination stops."
    });
  }

  // ─── BUDGET vs ACCOMMODATION PREFERENCE ──────────────────────────────────
  const accomComfort = accommodation?.comfort;
  const comfortOrder = ["budget", "comfortable", "premium", "luxury"];
  const budgetIdx = comfortOrder.indexOf(budgetLevel);
  const accomIdx = comfortOrder.indexOf(accomComfort);

  if (accomComfort && accomIdx > budgetIdx + 1) {
    notes.push({
      type: "warning",
      message: `Your selected accommodation comfort level (${accomComfort}) is higher than your overall trip budget tier (${budgetLevel}). This may increase the estimated trip cost.`
    });
  }

  // ─── BUDGET vs TRANSPORT PREFERENCE ──────────────────────────────────────
  const transportComfort = transportation?.comfort;
  const transportOrder = ["budget", "balanced", "comfort", "premium"];
  const transportIdx = transportOrder.indexOf(transportComfort);

  if (transportComfort && transportIdx > budgetIdx + 1) {
    notes.push({
      type: "warning",
      message: `Your selected transport comfort (${transportComfort}) is above your overall budget tier. The planning estimate will reflect this adjustment.`
    });
  }

  // ─── DESTINATION-AWARE TRANSPORT NOTICES ─────────────────────────────────
  if (hasNorth) {
    notes.push({
      type: "info",
      message:
        "North Sikkim (Lachung, Lachen, Yumthang, Gurudongmar) requires a registered local permit and specialized mountain vehicles. Private transport is typically required — shared options are limited beyond Mangan."
    });
  }
  if (hasSilk) {
    notes.push({
      type: "info",
      message:
        "The Silk Route / East Sikkim (Zuluk, Nathang) involves narrow mountain tracks that require dedicated 4WD vehicles. Confirm road access locally as conditions vary by season."
    });
  }
  if (hasRemote && travelStyle === "packed") {
    notes.push({
      type: "info",
      message:
        "Remote high-altitude destinations often have unpredictable road conditions. A packed pace on these routes may not always be feasible — allow buffer time."
    });
  }

  // ─── SENIOR COMFORT OPTIMIZATION SUGGESTION ──────────────────────────────
  if (hasSeniors && travelStyle === "packed") {
    notes.push({
      type: "suggestion",
      message:
        "Your group includes senior travelers. A packed travel schedule may be tiring on high-altitude mountain roads. We recommend switching to a relaxed or balanced pace for a more comfortable experience."
    });
  }

  return {
    accommodationSuggestions,
    transportSuggestions,
    notes
  };
}

/**
 * Checks if accommodation preferences are compatible with overall budget level.
 */
export function checkAccommodationBudgetCompatibility({ accommodationComfort, budgetLevel }) {
  const order = ["budget", "comfortable", "premium", "luxury"];
  const budgetIdx = order.indexOf(budgetLevel);
  const accomIdx = order.indexOf(accommodationComfort);

  if (!accommodationComfort || !budgetLevel) return { compatible: true };

  if (accomIdx > budgetIdx + 1) {
    return {
      compatible: false,
      severity: "warning",
      message: `A ${accommodationComfort} accommodation on a ${budgetLevel} budget will likely increase your trip cost. The budget estimate will adjust accordingly.`
    };
  }
  return { compatible: true };
}

/**
 * Checks if transport preferences are compatible with overall budget level.
 */
export function checkTransportBudgetCompatibility({ transportComfort, budgetLevel }) {
  const budgetOrder = ["budget", "comfortable", "premium", "luxury"];
  const transportOrder = ["budget", "balanced", "comfort", "premium"];
  const budgetIdx = budgetOrder.indexOf(budgetLevel);
  const transportIdx = transportOrder.indexOf(transportComfort);

  if (!transportComfort || !budgetLevel) return { compatible: true };

  if (transportIdx > budgetIdx + 1) {
    return {
      compatible: false,
      severity: "warning",
      message: `Your preferred transport comfort (${transportComfort}) is above your overall budget tier. This is reflected in the updated budget estimate.`
    };
  }
  return { compatible: true };
}

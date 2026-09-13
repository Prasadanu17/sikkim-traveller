import { budgetConfig, accommodationMultipliers, transportMultipliers } from "../../data/budgetConfig";

/**
 * Calculates a transparent planning budget range and breakdown for a Sikkim trip.
 * MODULE 4: Now accepts optional accommodation and transport preference overrides.
 */
export function estimateTripBudget({
  duration,
  travelers,
  destinations = [],
  travelStyle = "balanced",
  budgetLevel = "comfortable",
  // MODULE 4 optional overrides
  accommodationTypes = [],   // e.g. ["homestay", "resort"]
  transportModes = []        // e.g. ["private-cab", "shared-sumo"]
}) {
  const config = budgetConfig[budgetLevel] || budgetConfig.comfortable;

  const adults = parseInt(travelers.adults, 10) || 1;
  const children = parseInt(travelers.children, 10) || 0;
  const seniors = parseInt(travelers.seniors, 10) || 0;
  const total = adults + children + seniors;

  const assumptions = [];

  // ─── 1. ACCOMMODATION ─────────────────────────────────────────────────────
  const roomOccupantsCount = adults + seniors + (children > 0 ? children * 0.5 : 0);
  const roomsCount = Math.max(1, Math.ceil(roomOccupantsCount / 2));
  const nightsCount = Math.max(1, duration - 1);

  // Derive accommodation multiplier from Module 4 type selections
  let accomMultiplier = 1.0;
  if (accommodationTypes.length > 0) {
    const validTypes = accommodationTypes.filter((t) => accommodationMultipliers[t] !== undefined);
    if (validTypes.length > 0) {
      accomMultiplier =
        validTypes.reduce((sum, t) => sum + accommodationMultipliers[t], 0) / validTypes.length;
    }
  }

  const baseAccommodation = roomsCount * config.roomCost * accomMultiplier * nightsCount;

  const accomTypeLabel =
    accommodationTypes.length > 0
      ? accommodationTypes.join("/")
      : `${budgetLevel} level`;
  assumptions.push(
    `Stay: ${roomsCount} Room${roomsCount > 1 ? "s" : ""} (${accomTypeLabel}) for ${nightsCount} Night${nightsCount > 1 ? "s" : ""}`
  );

  // ─── 2. FOOD ──────────────────────────────────────────────────────────────
  const baseFood = total * config.foodCost * duration;
  assumptions.push(
    `Meals: Standard food rate allowance for ${total} traveler${total > 1 ? "s" : ""} over ${duration} days`
  );

  // ─── 3. TRANSPORTATION ────────────────────────────────────────────────────
  const hasNorth = destinations.some((d) => {
    if (!d) return false;
    const dest = d.toLowerCase();
    return (
      dest.includes("lachung") ||
      dest.includes("lachen") ||
      dest.includes("mangan") ||
      dest.includes("yumthang") ||
      dest.includes("gurudongmar") ||
      dest.includes("zero-point")
    );
  });
  const hasSilk = destinations.some((d) => {
    if (!d) return false;
    const dest = d.toLowerCase();
    return dest.includes("zuluk") || dest.includes("silk") || dest.includes("pakyong");
  });

  // Derive transport multiplier from Module 4 mode selections
  let transportMultiplier = 1.0;
  let isShared = config.isSharedTransport;

  if (transportModes.length > 0) {
    const validModes = transportModes.filter((m) => transportMultipliers[m] !== undefined);
    if (validModes.length > 0) {
      transportMultiplier =
        validModes.reduce((sum, m) => sum + transportMultipliers[m], 0) / validModes.length;
      // If user explicitly chose shared, override the config default
      isShared = transportModes.includes("shared-sumo") && !transportModes.includes("private-cab");
    }
  }

  let baseTransport = 0;

  if (isShared) {
    const dailyTransport = total * config.transportCostPerPerson * duration;
    let surcharge = 0;
    if (hasNorth) surcharge += total * config.northSurchargePerPerson;
    if (hasSilk) surcharge += total * config.silkSurchargePerPerson;
    baseTransport = (dailyTransport + surcharge) * transportMultiplier;
    assumptions.push("Transport: Shared Sumo transport including regional loop transits");
  } else {
    const vehicleCount = Math.max(1, Math.ceil(total / 6));
    const dailyRate = vehicleCount * config.vehicleCost * duration;

    let paceMultiplier = 1.0;
    if (travelStyle === "packed") paceMultiplier = 1.15;
    else if (travelStyle === "relaxed") paceMultiplier = 0.9;

    let surcharge = 0;
    if (hasNorth) surcharge += vehicleCount * config.northSurchargeVehicle;
    if (hasSilk) surcharge += vehicleCount * config.silkSurchargeVehicle;

    baseTransport = (dailyRate * paceMultiplier * transportMultiplier) + surcharge;

    const transportLabel =
      transportModes.includes("premium-private")
        ? "Innova Crysta / Fortuner"
        : transportModes.includes("private-cab")
        ? "Private SUV/Cab"
        : "Private vehicle";

    assumptions.push(
      `Transport: ${transportLabel} (${vehicleCount} vehicle${vehicleCount > 1 ? "s" : ""}) for the entire duration`
    );
    if (hasNorth || hasSilk) {
      assumptions.push("Transport includes high-altitude permit and road surcharge fees");
    }
  }

  // ─── 4. ACTIVITIES ────────────────────────────────────────────────────────
  const baseActivities = total * config.activityCost * duration;
  assumptions.push(`Activities: Entrance fees, sanctuary permits & basic sights budget`);

  // ─── 5. TOTALS ────────────────────────────────────────────────────────────
  const subtotal = baseAccommodation + baseFood + baseTransport + baseActivities;
  const miscellaneous = Math.round(subtotal * 0.1);
  const finalTotal = subtotal + miscellaneous;

  const minTotal = Math.round((finalTotal * 0.92) / 1000) * 1000;
  const maxTotal = Math.round((finalTotal * 1.12) / 1000) * 1000;

  const breakdown = {
    accommodation: {
      min: Math.round((baseAccommodation * 0.92) / 1000) * 1000,
      max: Math.round((baseAccommodation * 1.12) / 1000) * 1000
    },
    transportation: {
      min: Math.round((baseTransport * 0.92) / 1000) * 1000,
      max: Math.round((baseTransport * 1.12) / 1000) * 1000
    },
    food: {
      min: Math.round((baseFood * 0.92) / 1000) * 1000,
      max: Math.round((baseFood * 1.12) / 1000) * 1000
    },
    activities: {
      min: Math.round((baseActivities * 0.92) / 1000) * 1000,
      max: Math.round((baseActivities * 1.12) / 1000) * 1000
    },
    miscellaneous: {
      min: Math.round((miscellaneous * 0.92) / 1000) * 1000,
      max: Math.round((miscellaneous * 1.12) / 1000) * 1000
    }
  };

  return {
    currency: "INR",
    estimatedRange: { min: minTotal, max: maxTotal },
    breakdown,
    assumptions
  };
}

/**
 * Validates a user's target budget range against the generated estimations.
 */
export function analyzeBudgetMatch({ targetMin, targetMax, estimatedRange }) {
  if (!targetMin || !targetMax) {
    return { status: "neutral", message: "No target budget provided to match." };
  }

  const { min: estMin, max: estMax } = estimatedRange;

  if (targetMax < estMin) {
    return {
      status: "low",
      message:
        "Your budget target is below our baseline estimate for this route. Consider reducing destinations, switching to a budget style, or extending your budget limit."
    };
  } else if (targetMin > estMax) {
    return {
      status: "high",
      message:
        "Your budget target exceeds our estimation. This gives you comfortable flexibility! Future itinerary generation can upgrade your transport or stays."
    };
  } else {
    return {
      status: "match",
      message: "Excellent budget match! Your target matches our estimated planning cost range for this trip."
    };
  }
}

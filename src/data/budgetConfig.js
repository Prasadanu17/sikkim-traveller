// Planning estimates and assumptions for Sikkim travel budgets (in INR)
export const budgetConfig = {
  budget: {
    roomCost: 1500,          // Standard basic homestays / guesthouses
    foodCost: 450,           // Simple local dining (momos, thukpa, local meals)
    vehicleCost: 2200,       // Small hatchback for local run
    activityCost: 150,       // Basic permits & entry fees
    isSharedTransport: true, // Budget trips typically use shared Sumos
    transportCostPerPerson: 850,
    northSurchargeVehicle: 3500, // Shared permits or basic local sumo surcharge
    northSurchargePerPerson: 1200,
    silkSurchargeVehicle: 2000,
    silkSurchargePerPerson: 600
  },
  comfortable: {
    roomCost: 3200,          // Mid-range hotels / comfortable homestays
    foodCost: 850,           // Restaurant dining & tourist cafes
    vehicleCost: 3800,       // Private SUV (Bolero/Maxx)
    activityCost: 350,       // Sightseeing entry tickets, cable cars
    isSharedTransport: false,
    northSurchargeVehicle: 6000, // Private permit + North Sikkim vehicle runs
    northSurchargePerPerson: 2500,
    silkSurchargeVehicle: 3200,
    silkSurchargePerPerson: 1200
  },
  premium: {
    roomCost: 6500,          // Premium hotels / luxury resort wings
    foodCost: 1600,          // Fine dining & premium restaurants
    vehicleCost: 5500,       // Private Innova / Xylo
    activityCost: 850,       // Guided excursions, organic tastings, permits
    isSharedTransport: false,
    northSurchargeVehicle: 8000,
    northSurchargePerPerson: 3500,
    silkSurchargeVehicle: 4500,
    silkSurchargePerPerson: 1800
  },
  luxury: {
    roomCost: 13000,         // 5-star properties / heritage luxury retreats
    foodCost: 3200,          // Premium resort dining & gourmet cuisines
    vehicleCost: 9500,       // Luxury premium SUV (Fortuner / Crysta)
    activityCost: 1800,      // Private local guide, VIP permit clearances
    isSharedTransport: false,
    northSurchargeVehicle: 12000,
    northSurchargePerPerson: 5500,
    silkSurchargeVehicle: 7000,
    silkSurchargePerPerson: 3000
  }
};

/**
 * MODULE 4: Accommodation type cost multipliers
 * Applied to the base roomCost from the budget tier.
 * These represent relative cost differences between stay types within the same comfort tier.
 */
export const accommodationMultipliers = {
  homestay: 0.65,    // Homestays are typically below standard hotel rates
  guesthouse: 0.80,  // Simple guesthouses slightly below mid-range
  hotel: 1.00,       // Baseline — standard hotel benchmark
  boutique: 1.25,    // Boutique stays command a small premium
  resort: 1.45,      // Full-service resorts are significantly higher
  lodge: 0.90        // Mountain lodges slightly below standard
};

/**
 * MODULE 4: Transportation mode multipliers
 * Applied to the base vehicleCost from the budget tier.
 */
export const transportMultipliers = {
  "shared-sumo": 0.45,   // Shared Sumo — cheapest option
  "private-cab": 1.00,   // Private cab/SUV — baseline for private travel
  "premium-private": 1.50 // Innova Crysta / Fortuner with better comfort
};

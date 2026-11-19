/**
 * backend/src/validation/aiSchemas.js
 * Strict, non-permissive Zod schemas for AI generation, refinement, and Copilot endpoints.
 * Explicitly validates nested structures with strict type, numeric, and string boundaries.
 */

import { z } from 'zod';

export const destinationItemSchema = z.object({
  slug: z.string().min(1).max(100).optional(),
  name: z.string().min(1).max(150).optional(),
  region: z.string().max(50).optional(),
  elevation: z.union([z.string().max(50), z.number().min(0).max(9000)]).optional(),
  overnight: z.boolean().optional(),
  recommendedDuration: z.union([
    z.string().max(50),
    z.number().min(0).max(30),
    z.object({
      min: z.coerce.number().optional(),
      ideal: z.coerce.number().optional(),
      max: z.coerce.number().optional()
    })
  ]).optional(),
  highlights: z.array(z.string().max(200)).max(20).optional(),
  interests: z.array(z.string().max(50)).max(20).optional()
});

export const destinationsFieldSchema = z.union([
  z.array(z.union([z.string().min(1).max(100), destinationItemSchema])).max(30),
  z.object({
    selected: z.array(z.string().min(1).max(100)).max(30).optional(),
    mode: z.string().max(50).optional(),
    recommendedOrder: z.array(z.string().max(100)).max(30).optional(),
    routeAnalysis: z.object({
      isValid: z.boolean().optional(),
      warnings: z.array(z.string().max(500)).max(20).optional()
    }).optional()
  })
]);

export const budgetFieldSchema = z.object({
  level: z.enum(['budget', 'comfortable', 'premium', 'luxury', 'standard']).optional(),
  mode: z.enum(['fixed', 'estimate', 'flexible']).nullable().optional(),
  targetMin: z.coerce.number().min(0).max(10000000).optional(),
  targetMax: z.coerce.number().min(0).max(10000000).optional(),
  estimatedMin: z.coerce.number().min(0).max(10000000).optional(),
  estimatedMax: z.coerce.number().min(0).max(10000000).optional(),
  currency: z.string().max(10).optional()
});

export const travelersFieldSchema = z.object({
  type: z.string().max(50).optional(),
  adults: z.coerce.number().int().min(0).max(100).optional(),
  children: z.coerce.number().int().min(0).max(100).optional(),
  seniors: z.coerce.number().int().min(0).max(100).optional(),
  total: z.coerce.number().int().min(1).max(200).optional(),
  childrenAgeGroups: z.array(z.string().max(50)).max(20).optional()
});

export const travelTimingFieldSchema = z.object({
  mode: z.string().max(50).optional(),
  start: z.string().max(50).nullable().optional(),
  end: z.string().max(50).nullable().optional(),
  season: z.string().max(50).optional(),
  seasonalScore: z.coerce.number().min(0).max(100).optional(),
  recommendedMonths: z.array(z.string().max(50)).max(12).optional(),
  month: z.string().max(50).optional()
});

export const tripContextSchema = z.object({
  duration: z.coerce.number().int().min(1).max(30).optional(),
  destinations: destinationsFieldSchema.optional(),
  interests: z.array(z.string().min(1).max(100)).max(30).optional(),
  budget: budgetFieldSchema.optional(),
  travelers: travelersFieldSchema.optional(),
  travelStyle: z.string().max(50).optional(),
  dates: travelTimingFieldSchema.optional(),
  travelTiming: travelTimingFieldSchema.optional(),
  language: z.enum(['en', 'hi', 'ne']).optional(),
  routeInfo: z.object({
    regions: z.array(z.string().max(50)).max(20).optional(),
    regionCounts: z.record(z.string(), z.number()).optional(),
    isValid: z.boolean().optional(),
    warnings: z.array(z.string().max(500)).max(20).optional()
  }).optional(),
  accommodation: z.object({
    mode: z.string().max(50).optional(),
    types: z.array(z.string().max(50)).max(10).optional(),
    comfort: z.string().max(50).optional(),
    tier: z.string().max(50).optional(),
    roomPreference: z.string().max(50).optional(),
    locationPreferences: z.array(z.string().max(100)).max(20).optional(),
    priorities: z.array(z.string().max(100)).max(20).optional()
  }).optional(),
  transportation: z.object({
    mode: z.string().max(50).optional(),
    preferredModes: z.array(z.string().max(50)).max(10).optional(),
    primaryMode: z.string().max(50).optional(),
    comfort: z.string().max(50).optional(),
    longDriveTolerance: z.string().max(50).optional(),
    transferPreference: z.string().max(50).optional(),
    arrivalPreference: z.string().max(50).optional(),
    departurePreference: z.string().max(50).optional()
  }).optional(),
  travelPreferences: z.object({
    notes: z.array(z.union([
      z.string().max(500),
      z.object({
        id: z.string().optional(),
        text: z.string().optional(),
        category: z.string().optional()
      })
    ])).max(20).optional(),
    accommodationSuggestions: z.array(z.string().max(500)).max(20).optional(),
    transportSuggestions: z.array(z.string().max(500)).max(20).optional()
  }).optional()
});

export const activityItemSchema = z.object({
  id: z.string().max(100).optional(),
  title: z.string().min(1).max(250),
  timeSlot: z.string().max(50).optional(),
  time: z.string().max(50).optional(),
  duration: z.union([z.string().max(50), z.number().min(0).max(24)]).optional(),
  durationHours: z.coerce.number().min(0).max(24).optional(),
  location: z.string().max(150).optional(),
  description: z.string().max(3000).optional(),
  cost: z.union([z.string().max(50), z.number()]).optional(),
  bookingRequired: z.boolean().optional(),
  type: z.string().max(50).optional(),
  altitudeM: z.coerce.number().min(0).max(9000).optional(),
  altitudeWarning: z.string().max(500).optional()
});

export const dayStaySchema = z.object({
  name: z.string().max(150).optional(),
  hotelName: z.string().max(150).optional(),
  comfort: z.string().max(50).optional(),
  location: z.string().max(150).optional(),
  pricePerNight: z.coerce.number().min(0).optional(),
  roomType: z.string().max(100).optional(),
  accommodationType: z.string().max(150).optional()
});

export const itineraryDaySchema = z.object({
  dayNumber: z.coerce.number().int().min(1).max(30),
  date: z.string().nullable().optional(),
  title: z.string().min(1).max(250),
  baseLocation: z.string().max(100).optional(),
  theme: z.string().max(100).optional(),
  description: z.string().max(4000).optional(),
  activities: z.array(activityItemSchema).max(25).optional(),
  morning: z.array(activityItemSchema).max(10).optional(),
  afternoon: z.array(activityItemSchema).max(10).optional(),
  evening: z.array(activityItemSchema).max(10).optional(),
  travel: z.array(z.object({
    from: z.string().max(100).optional(),
    to: z.string().max(100).optional(),
    duration: z.union([z.string().max(50), z.number()]).optional(),
    mode: z.string().max(100).optional()
  })).max(10).optional(),
  meals: z.array(z.string().max(200)).max(10).optional(),
  stay: dayStaySchema.optional(),
  stays: z.union([dayStaySchema, z.array(dayStaySchema).max(5)]).optional(),
  overnight: z.union([
    dayStaySchema,
    z.object({
      location: z.string().max(150).optional(),
      accommodationType: z.string().max(150).optional()
    })
  ]).optional(),
  estimatedCost: z.object({
    min: z.coerce.number().min(0).optional(),
    max: z.coerce.number().min(0).optional(),
    currency: z.string().max(10).optional()
  }).optional(),
  notes: z.array(z.string().max(1000)).max(20).optional(),
  warnings: z.array(z.string().max(1000)).max(20).optional(),
  travelLeg: z.object({
    from: z.string().max(100).optional(),
    to: z.string().max(100).optional(),
    distanceKm: z.coerce.number().min(0).optional(),
    driveDurationHours: z.coerce.number().min(0).optional(),
    roadCondition: z.string().max(100).optional()
  }).optional(),
  altitudeProfile: z.object({
    dayMaxAltitudeM: z.coerce.number().min(0).max(9000).optional(),
    sleepAltitudeM: z.coerce.number().min(0).max(9000).optional(),
    ascentRiskLevel: z.string().max(50).optional(),
    acclimatizationRequired: z.boolean().optional()
  }).optional()
});

export const existingItinerarySchema = z.object({
  tripTitle: z.string().max(250).optional(),
  summary: z.string().max(4000).optional(),
  overview: z.object({
    duration: z.coerce.number().int().min(1).max(30).optional(),
    title: z.string().max(250).optional(),
    tripTitle: z.string().max(250).optional(),
    summary: z.string().max(4000).optional(),
    bestSuitedFor: z.string().max(300).optional(),
    season: z.string().max(100).optional(),
    travelers: z.coerce.number().optional(),
    travelerType: z.string().max(100).optional(),
    travelStyle: z.string().max(100).optional(),
    route: z.array(z.string().max(100)).max(30).optional(),
    estimatedCost: z.object({
      min: z.coerce.number().optional(),
      max: z.coerce.number().optional(),
      currency: z.string().max(10).optional()
    }).optional()
  }).optional(),
  days: z.array(itineraryDaySchema).min(1, 'existingItinerary must contain at least one day').max(30),
  whyThisTripWorks: z.array(z.string().max(1000)).max(30).optional(),
  budget: z.union([
    z.object({
      estimatedTotal: z.coerce.number().min(0).optional(),
      currency: z.string().max(10).optional(),
      breakdown: z.record(z.string(), z.union([z.number(), z.string()])).optional()
    }),
    z.record(z.string(), z.union([
      z.number(),
      z.string(),
      z.object({
        min: z.coerce.number().optional(),
        max: z.coerce.number().optional()
      })
    ]))
  ]).optional(),
  importantNotes: z.array(z.string().max(1500)).max(30).optional(),
  warnings: z.array(z.string().max(1000)).max(30).optional(),
  qualityScore: z.union([z.number(), z.record(z.string(), z.any())]).optional()
});

export const refinementChangesSchema = z.object({
  budgetLevel: z.string().max(50).optional(),
  budgetCap: z.coerce.number().min(0).max(10000000).optional(),
  targetMax: z.coerce.number().min(0).max(10000000).optional(),
  targetMin: z.coerce.number().min(0).max(10000000).optional(),
  pacePreference: z.string().max(50).optional(),
  preferredStay: z.string().max(50).optional(),
  preferredTransport: z.string().max(50).optional(),
  avoidLongDrives: z.boolean().optional(),
  destinationsToAdd: z.array(z.string().max(100)).max(10).optional(),
  destinationsToRemove: z.array(z.string().max(100)).max(10).optional(),
  targetDay: z.coerce.number().int().min(0).max(30).nullable().optional()
});

export const requestInputSchema = z.union([
  z.string().min(1, 'Refinement instruction cannot be empty').max(2000, 'Instruction too long'),
  z.object({
    instruction: z.string().max(2000, 'Instruction too long').optional(),
    mode: z.string().max(100).optional(),
    changes: refinementChangesSchema.optional(),
    proposalId: z.string().max(100).optional()
  }).refine((data) => {
    const hasInstruction = typeof data.instruction === 'string' && data.instruction.trim().length > 0;
    const hasMode = typeof data.mode === 'string' && data.mode.trim().length > 0;
    const hasChanges = Boolean(data.changes && Object.keys(data.changes).length > 0);
    return hasInstruction || hasMode || hasChanges;
  }, {
    message: 'Refinement instruction cannot be empty unless mode or changes are specified'
  })
]);

export const refinementIntentSchema = z.object({
  intent: z.string().max(100),
  targetDay: z.coerce.number().int().min(0).max(30).nullable().optional(),
  changes: refinementChangesSchema.optional(),
  entities: z.object({
    budgetAmount: z.coerce.number().optional(),
    pace: z.string().max(50).optional(),
    accommodationType: z.string().max(50).optional(),
    transportMode: z.string().max(50).optional(),
    destinationSlug: z.string().max(100).optional()
  }).optional()
});

export const generateSchema = z.object({
  tripContext: tripContextSchema.refine((val) => Object.keys(val).length > 0, {
    message: 'tripContext must be a non-empty object'
  }),
  regenerationPreference: z.object({
    preference: z.string().max(100).optional(),
    mode: z.string().max(100).optional(),
    reason: z.string().max(500).optional(),
    focusAreas: z.array(z.string().max(100)).max(10).optional()
  }).nullable().optional(),
  systemInstruction: z.string().max(5000).optional(),
  userPrompt: z.string().max(5000).optional(),
  language: z.enum(['en', 'hi', 'ne']).optional()
});

export const refineSchema = z.object({
  tripContext: tripContextSchema.optional(),
  existingItinerary: existingItinerarySchema,
  intent: refinementIntentSchema.optional(),
  requestInput: requestInputSchema.optional(),
  language: z.enum(['en', 'hi', 'ne']).optional()
});

export const copilotSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1500, 'Message too long'),
  intent: refinementIntentSchema.optional(),
  context: tripContextSchema.optional(),
  language: z.enum(['en', 'hi', 'ne']).optional()
});

import { describe, it, expect } from 'vitest';
import {
  generateSchema,
  refineSchema,
  copilotSchema,
  existingItinerarySchema,
  destinationItemSchema,
  budgetFieldSchema,
  travelersFieldSchema
} from '../src/validation/aiSchemas.js';

describe('Strict Zod Validation Schemas', () => {
  describe('generateSchema', () => {
    it('accepts a valid generate payload', () => {
      const valid = {
        tripContext: {
          duration: 5,
          destinations: ['gangtok', 'pelling'],
          budget: { level: 'comfortable', currency: 'INR' },
          travelers: { adults: 2, total: 2 },
          language: 'en'
        },
        language: 'en'
      };
      const result = generateSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects empty tripContext object', () => {
      const invalid = { tripContext: {} };
      const result = generateSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects duration outside 1-30 days', () => {
      const invalidZero = { tripContext: { duration: 0 } };
      const invalidTooLong = { tripContext: { duration: 35 } };
      expect(generateSchema.safeParse(invalidZero).success).toBe(false);
      expect(generateSchema.safeParse(invalidTooLong).success).toBe(false);
    });

    it('rejects invalid budget level enum', () => {
      const invalid = {
        tripContext: {
          duration: 5,
          budget: { level: 'ultra-free' }
        }
      };
      const result = generateSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects unsupported language enum', () => {
      const invalid = {
        tripContext: { duration: 3 },
        language: 'es'
      };
      expect(generateSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects destinations array exceeding 30 items', () => {
      const excessiveDestinations = Array.from({ length: 35 }, (_, i) => `dest-${i}`);
      const invalid = {
        tripContext: {
          duration: 5,
          destinations: excessiveDestinations
        }
      };
      expect(generateSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('refineSchema', () => {
    const validItinerary = {
      tripTitle: 'Sikkim Odyssey',
      overview: { duration: 2, title: '2 Day Tour', summary: 'A short tour' },
      days: [
        {
          dayNumber: 1,
          title: 'Arrival in Gangtok',
          activities: [{ title: 'MG Marg Walk', durationHours: 2 }]
        },
        {
          dayNumber: 2,
          title: 'Tsomgo Lake Excursion',
          activities: [{ title: 'Lake Visit', durationHours: 4 }]
        }
      ]
    };

    it('accepts valid string instruction refinement', () => {
      const valid = {
        existingItinerary: validItinerary,
        requestInput: 'Make day 2 more relaxed'
      };
      expect(refineSchema.safeParse(valid).success).toBe(true);
    });

    it('accepts valid object instruction with changes', () => {
      const valid = {
        existingItinerary: validItinerary,
        requestInput: {
          instruction: 'Switch stay to luxury',
          changes: { budgetLevel: 'luxury', pacePreference: 'relaxed' },
          proposalId: 'prop-123'
        }
      };
      expect(refineSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects empty string instruction', () => {
      const invalid = {
        existingItinerary: validItinerary,
        requestInput: ''
      };
      const result = refineSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects empty string in object instruction', () => {
      const invalid = {
        existingItinerary: validItinerary,
        requestInput: {
          instruction: '',
          changes: {}
        }
      };
      const result = refineSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('rejects instruction exceeding 2000 characters', () => {
      const oversized = 'A'.repeat(2005);
      const invalid = {
        existingItinerary: validItinerary,
        requestInput: oversized
      };
      expect(refineSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects existingItinerary with 0 days', () => {
      const invalid = {
        existingItinerary: {
          overview: { duration: 0 },
          days: []
        },
        requestInput: 'Relax pace'
      };
      expect(refineSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects existingItinerary with missing days array', () => {
      const invalid = {
        existingItinerary: {
          overview: { duration: 3 }
        },
        requestInput: 'Relax pace'
      };
      expect(refineSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects activity with durationHours > 24', () => {
      const invalid = {
        existingItinerary: {
          days: [
            {
              dayNumber: 1,
              title: 'Day 1',
              activities: [{ title: 'Marathon', durationHours: 28 }]
            }
          ]
        },
        requestInput: 'Check marathon'
      };
      expect(refineSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('copilotSchema', () => {
    it('accepts valid copilot message', () => {
      const valid = {
        message: 'Can I visit Gurudongmar in December?',
        language: 'en'
      };
      expect(copilotSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects empty copilot message', () => {
      const invalid = { message: '' };
      expect(copilotSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects oversized copilot message (>1500 chars)', () => {
      const invalid = { message: 'X'.repeat(1505) };
      expect(copilotSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe('Field Sub-schemas', () => {
    it('destinationItemSchema rejects elevation > 9000m (Mt Everest is 8848m)', () => {
      expect(destinationItemSchema.safeParse({ elevation: 12000 }).success).toBe(false);
      expect(destinationItemSchema.safeParse({ elevation: 5400 }).success).toBe(true);
    });

    it('travelersFieldSchema rejects negative passenger counts', () => {
      expect(travelersFieldSchema.safeParse({ adults: -1 }).success).toBe(false);
      expect(travelersFieldSchema.safeParse({ adults: 2, children: 1 }).success).toBe(true);
    });

    it('budgetFieldSchema coerces valid numeric strings', () => {
      const parsed = budgetFieldSchema.parse({ targetMin: '5000', targetMax: '15000' });
      expect(parsed.targetMin).toBe(5000);
      expect(parsed.targetMax).toBe(15000);
    });
  });
});

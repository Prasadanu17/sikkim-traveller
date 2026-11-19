/**
 * backend/tests/bookingRequestAndTracking.test.js
 * Integration verification for:
 * 1. POST /api/booking-request (from frontend BookingJourney.jsx & bookingRequestService.js)
 * 2. Idempotency handling (X-Idempotency-Key and Idempotency-Key)
 * 3. GET /api/customer/booking/:trackingToken (Customer Portal lookup)
 * 4. Customer Portal messages & change requests via tracking token
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/database.js';

describe('Booking Request and Customer Portal Tracking Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/booking-request', () => {
    it('accepts normalized BookingJourney payload and returns 201 with requestId', async () => {
      const payload = {
        trip: {
          duration: 6,
          startDate: '2026-10-15',
          endDate: '2026-10-21',
          adults: 2,
          children: 1,
          seniors: 0,
          destinations: ['gangtok', 'lachung']
        },
        traveler: {
          fullName: 'Tenzing Norgay',
          email: 'tenzing@example.com',
          phone: '+919876543210'
        },
        destinations: ['gangtok', 'lachung'],
        itinerary: [
          { dayNumber: 1, title: 'Arrival in Gangtok', location: 'Gangtok' },
          { dayNumber: 2, title: 'Gangtok to Lachung', location: 'Lachung' }
        ],
        budget: { tier: 'MODERATE', totalEstimate: 45000 },
        contact: {
          fullName: 'Tenzing Norgay',
          email: 'tenzing@example.com',
          phone: '+919876543210'
        },
        specialRequests: 'Vegetarian meals preferred'
      };

      const res = await request(app)
        .post('/api/booking-request')
        .set('X-Idempotency-Key', 'test-idem-key-101')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.requestId).toBeDefined();
      expect(res.body.status).toBe('RECEIVED');
    });

    it('handles idempotent replay when identical key is provided', async () => {
      // Mock existing journey found for key
      const mockFindUnique = vi.spyOn(prisma.customerJourney, 'findUnique').mockResolvedValueOnce({
        id: 'journey-idem-123',
        requestId: 'ST-REQ-20261119-9999',
        status: 'RECEIVED'
      });

      const res = await request(app)
        .post('/api/booking-request')
        .set('Idempotency-Key', 'existing-key-555')
        .send({
          trip: { duration: 5 },
          destinations: ['gangtok']
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body._idempotent).toBe(true);
      expect(res.body.requestId).toBe('ST-REQ-20261119-9999');

      mockFindUnique.mockRestore();
    });
  });

  describe('GET /api/customer/booking/:trackingToken', () => {
    it('returns 404 when tracking token does not exist', async () => {
      const res = await request(app)
        .get('/api/customer/booking/ST-REQ-NONEXISTENT')
        .set('Accept', 'application/json');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No trip booking was found');
    });

    it('returns customer-safe journey model when tracking token exists', async () => {
      const mockJourney = {
        id: 'test-j-001',
        requestId: 'ST-REQ-20261119-4321',
        status: 'RECEIVED',
        priority: 'NORMAL',
        createdAt: new Date(),
        updatedAt: new Date(),
        traveler: {
          firstName: 'Sonam',
          lastName: 'Lepcha',
          email: 'sonam@example.com',
          phone: '+919876543211',
          city: 'Gangtok',
          country: 'India'
        },
        trip: {
          adults: 2,
          children: 0,
          seniors: 0,
          duration: 5,
          destinations: [{ name: 'Gangtok', slug: 'gangtok', nights: 2, order: 1 }]
        },
        itinerary: {
          title: 'Custom Sikkim Journey',
          days: []
        },
        permits: [],
        proposals: [],
        customerApproval: null,
        documents: [],
        notifications: [],
        notificationPref: null,
        changeRequests: []
      };

      vi.spyOn(prisma.customerJourney, 'findUnique')
        .mockResolvedValueOnce({ id: 'test-j-001', requestId: 'ST-REQ-20261119-4321' }) // resolve
        .mockResolvedValueOnce(mockJourney); // getCustomerSafeJourney

      const res = await request(app)
        .get('/api/customer/booking/ST-REQ-20261119-4321')
        .set('Accept', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body.requestId).toBe('ST-REQ-20261119-4321');
      expect(res.body.trackingToken).toBe('ST-REQ-20261119-4321');
      expect(res.body.status).toBe('RECEIVED');
    });
  });

  describe('Customer Portal Actions via Tracking Token', () => {
    it('sends customer message when valid token is provided', async () => {
      vi.spyOn(prisma.customerJourney, 'findUnique')
        .mockResolvedValue({
          id: 'test-j-002',
          requestId: 'ST-REQ-MSG-001',
          status: 'RECEIVED',
          priority: 'NORMAL',
          createdAt: new Date(),
          updatedAt: new Date(),
          traveler: { firstName: 'Sonam' },
          trip: { duration: 5, destinations: [] },
          itinerary: { days: [] }
        });

      vi.spyOn(prisma.notification, 'create').mockResolvedValueOnce({
        id: 'notif-1',
        channel: 'IN_APP',
        eventType: 'CUSTOMER_MESSAGE',
        body: 'Hello, could we add an extra night in Lachung?',
        createdAt: new Date()
      });

      const res = await request(app)
        .post('/api/customer/booking/ST-REQ-MSG-001/messages')
        .send({
          text: 'Hello, could we add an extra night in Lachung?',
          senderName: 'Sonam'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message.text).toContain('extra night in Lachung');
    });

    it('rejects empty message with 400', async () => {
      vi.spyOn(prisma.customerJourney, 'findUnique')
        .mockResolvedValue({
          id: 'test-j-002',
          requestId: 'ST-REQ-MSG-001',
          status: 'RECEIVED',
          priority: 'NORMAL',
          createdAt: new Date(),
          updatedAt: new Date()
        });

      const res = await request(app)
        .post('/api/customer/booking/ST-REQ-MSG-001/messages')
        .send({ text: '' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Please provide a message');
    });

    it('submits change request via tracking token', async () => {
      vi.spyOn(prisma.customerJourney, 'findUnique')
        .mockResolvedValue({
          id: 'test-j-003',
          requestId: 'ST-REQ-CR-001',
          status: 'RECEIVED',
          priority: 'NORMAL',
          createdAt: new Date(),
          updatedAt: new Date(),
          traveler: { firstName: 'Sonam' },
          trip: { duration: 5, destinations: [] },
          itinerary: { days: [] }
        });

      vi.spyOn(prisma.changeRequest, 'create').mockResolvedValueOnce({
        id: 'cr-1',
        category: 'DATES',
        title: 'Change Travel Dates',
        description: 'Need to shift arrival from 15th to 18th Oct',
        status: 'SUBMITTED'
      });

      const res = await request(app)
        .post('/api/customer/booking/ST-REQ-CR-001/change-request')
        .send({
          category: 'DATES',
          title: 'Change Travel Dates',
          description: 'Need to shift arrival from 15th to 18th Oct'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Change request submitted');
    });
  });
});

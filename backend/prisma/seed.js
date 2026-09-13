/**
 * backend/prisma/seed.js
 * Seed script for local development.
 * Seeds standard operations roles and a realistic test journey.
 */

import { PrismaClient } from '@prisma/client';
import { hashToken } from '../src/security/tokenGenerator.js';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Clearing existing data...');
  
  // Clear tables in reverse dependency order
  await prisma.auditLog.deleteMany({});
  await prisma.customerSession.deleteMany({});
  await prisma.journeyAccessToken.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.proposalApproval.deleteMany({});
  await prisma.proposal.deleteMany({});
  await prisma.quote.deleteMany({});
  await prisma.changeRequest.deleteMany({});
  await prisma.permit.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.notificationPreference.deleteMany({});
  await prisma.destination.deleteMany({});
  await prisma.itineraryDay.deleteMany({});
  await prisma.itinerary.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.traveler.deleteMany({});
  await prisma.customerJourney.deleteMany({});
  await prisma.operationsUser.deleteMany({});
  await prisma.travelAdvisory.deleteMany({});

  console.log('[Seed] Seeding operational staff roles...');
  const admin = await prisma.operationsUser.create({
    data: { name: 'Admin Staff', email: 'admin@sikkimtraveller.com', role: 'ADMIN' }
  });
  const manager = await prisma.operationsUser.create({
    data: { name: 'Operations Manager', email: 'manager@sikkimtraveller.com', role: 'OPERATIONS_MANAGER' }
  });
  const operator = await prisma.operationsUser.create({
    data: { name: 'Travel Operator', email: 'operator@sikkimtraveller.com', role: 'TRAVEL_OPERATOR' }
  });
  const sales = await prisma.operationsUser.create({
    data: { name: 'Sales Representative', email: 'sales@sikkimtraveller.com', role: 'SALES' }
  });
  const viewer = await prisma.operationsUser.create({
    data: { name: 'Guest Viewer', email: 'viewer@sikkimtraveller.com', role: 'VIEWER' }
  });

  console.log('[Seed] Seeding travel advisories...');
  await prisma.travelAdvisory.createMany({
    data: [
      { region: 'Sikkim', title: 'Monsoon Alert', description: 'Heavy rains in North Sikkim. Travel with caution.', riskLevel: 'MEDIUM' },
      { region: 'Nathula', title: 'Permit Requirement', description: 'Nathula Pass permits are subject to weather conditions and security clearances.', riskLevel: 'LOW' }
    ]
  });

  console.log('[Seed] Seeding test customer journey...');
  
  // Create a realistic journey matching verify-token test flow
  const rawToken = 'test-customer-token-for-local-development-verification-123456';
  const tokenHash = hashToken(rawToken);
  
  const journey = await prisma.customerJourney.create({
    data: {
      requestId: 'ST-REQ-20260826-9999',
      status: 'RECEIVED',
      priority: 'NORMAL',
      assignedStaffId: operator.id,
      idempotencyKey: 'seed-idempotency-key'
    }
  });

  await prisma.journeyAccessToken.create({
    data: {
      tokenHash,
      journeyId: journey.id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.traveler.create({
    data: {
      journeyId: journey.id,
      fullName: 'Rahul Sharma',
      firstName: 'Rahul',
      email: 'rahul@example.com',
      phone: '+919876543210',
      city: 'Mumbai',
      adultCount: 2,
      childCount: 1
    }
  });

  const trip = await prisma.trip.create({
    data: {
      journeyId: journey.id,
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      duration: 5,
      dateMode: 'fixed',
      travelStyle: 'adventure',
      budgetTier: 'comfortable'
    }
  });

  await prisma.destination.createMany({
    data: [
      { tripId: trip.id, slug: 'gangtok', name: 'Gangtok', order: 0 },
      { tripId: trip.id, slug: 'lachung', name: 'Lachung', order: 1 }
    ]
  });

  await prisma.notificationPreference.create({
    data: { journeyId: journey.id }
  });

  console.log('[Seed] Database seeding complete.');
  console.log(`[Seed] Seeded Access Token (for manual verification): ${rawToken}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

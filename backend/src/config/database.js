/**
 * backend/src/config/database.js
 * Prisma client singleton — auto-fallback to a robust in-memory mock database
 * with full relational joint/include simulation for tests and local development.
 */

import { PrismaClient } from '@prisma/client';
import env from './env.js';

// In-Memory Database Store for Testing
const store = {
  customerJourney: [],
  journeyAccessToken: [],
  customerSession: [],
  traveler: [],
  trip: [],
  destination: [],
  itinerary: [],
  itineraryDay: [],
  permit: [],
  changeRequest: [],
  proposal: [],
  proposalApproval: [],
  quote: [],
  payment: [],
  invoice: [],
  document: [],
  notification: [],
  notificationPreference: [],
  auditLog: [],
  operationsUser: [],
  travelAdvisory: [],
  weatherSnapshot: []
};

// Helper: Generates UUID
function uuid() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Simple query matcher
function matches(item, where) {
  if (!where) return true;
  for (const [key, val] of Object.entries(where)) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if ('gt' in val && !(item[key] > val.gt)) return false;
      if ('gte' in val && !(item[key] >= val.gte)) return false;
      if ('lt' in val && !(item[key] < val.lt)) return false;
      if ('lte' in val && !(item[key] <= val.lte)) return false;
      if ('not' in val && item[key] === val.not) return false;
      if ('in' in val && !val.in.includes(item[key])) return false;
    } else if (item[key] !== val) {
      return false;
    }
  }
  return true;
}

// Relational joint resolver (Include helper)
function resolveIncludes(item, include, modelName) {
  if (!item || !include) return item;
  const newItem = { ...item };

  for (const [relationName, relationIncludeVal] of Object.entries(include)) {
    if (!relationIncludeVal) continue;

    // 1. journeyAccessToken -> journey
    if (modelName === 'journeyAccessToken' && relationName === 'journey') {
      const journey = store.customerJourney.find(j => j.id === item.journeyId);
      newItem.journey = resolveIncludes(journey, relationIncludeVal.include, 'customerJourney');
    }
    // 2. customerSession -> journey, token
    if (modelName === 'customerSession' && relationName === 'journey') {
      const journey = store.customerJourney.find(j => j.id === item.journeyId);
      newItem.journey = resolveIncludes(journey, relationIncludeVal.include, 'customerJourney');
    }
    if (modelName === 'customerSession' && relationName === 'token') {
      const token = store.journeyAccessToken.find(t => t.id === item.tokenId);
      newItem.token = resolveIncludes(token, relationIncludeVal.include, 'journeyAccessToken');
    }
    // 3. customerJourney relations
    if (modelName === 'customerJourney') {
      if (relationName === 'traveler') {
        newItem.traveler = store.traveler.find(t => t.journeyId === item.id) || null;
      }
      if (relationName === 'trip') {
        const trip = store.trip.find(t => t.journeyId === item.id);
        newItem.trip = resolveIncludes(trip, relationIncludeVal.include, 'trip');
      }
      if (relationName === 'itinerary') {
        const itinerary = store.itinerary.find(i => i.journeyId === item.id);
        newItem.itinerary = resolveIncludes(itinerary, relationIncludeVal.include, 'itinerary');
      }
      if (relationName === 'permits') {
        newItem.permits = store.permit.filter(p => p.journeyId === item.id);
      }
      if (relationName === 'changeRequests') {
        newItem.changeRequests = store.changeRequest.filter(c => c.journeyId === item.id);
      }
      if (relationName === 'proposals') {
        const proposals = store.proposal.filter(p => p.journeyId === item.id);
        newItem.proposals = proposals.map(p => resolveIncludes(p, relationIncludeVal.include, 'proposal'));
      }
      if (relationName === 'payments') {
        const payments = store.payment.filter(p => p.journeyId === item.id);
        newItem.payments = payments.map(p => resolveIncludes(p, relationIncludeVal.include, 'payment'));
      }
      if (relationName === 'documents') {
        newItem.documents = store.document.filter(d => d.journeyId === item.id);
      }
      if (relationName === 'notifications') {
        newItem.notifications = store.notification.filter(n => n.journeyId === item.id);
      }
      if (relationName === 'notificationPref') {
        newItem.notificationPref = store.notificationPreference.find(n => n.journeyId === item.id) || null;
      }
      if (relationName === 'assignedStaff') {
        newItem.assignedStaff = store.operationsUser.find(o => o.id === item.assignedStaffId) || null;
      }
    }
    // 4. proposal -> approval, quote
    if (modelName === 'proposal') {
      if (relationName === 'approval') {
        newItem.approval = store.proposalApproval.find(a => a.proposalId === item.id) || null;
      }
      if (relationName === 'quote') {
        newItem.quote = store.quote.find(q => q.id === item.quoteId) || null;
      }
    }
    // 5. trip -> destinations
    if (modelName === 'trip' && relationName === 'destinations') {
      newItem.destinations = store.destination.filter(d => d.tripId === item.id);
    }
    // 6. itinerary -> days
    if (modelName === 'itinerary' && relationName === 'days') {
      newItem.days = store.itineraryDay.filter(d => d.itineraryId === item.id);
    }
    // 7. payment -> invoice
    if (modelName === 'payment' && relationName === 'invoice') {
      newItem.invoice = store.invoice.find(i => i.paymentId === item.id) || null;
    }
  }

  return newItem;
}

// In-memory model operations generator
function makeModelOps(modelName) {
  return {
    findUnique: async ({ where, include }) => {
      const list = store[modelName];
      const item = list.find(item => matches(item, where));
      return item ? resolveIncludes(item, include, modelName) : null;
    },
    findFirst: async ({ where, orderBy, include } = {}) => {
      let list = [...store[modelName]];
      list = list.filter(item => matches(item, where));
      if (orderBy) {
        const key = Object.keys(orderBy)[0];
        const dir = orderBy[key];
        list.sort((a, b) => dir === 'desc' ? (b[key] > a[key] ? 1 : -1) : (a[key] > b[key] ? 1 : -1));
      }
      const item = list[0];
      return item ? resolveIncludes(item, include, modelName) : null;
    },
    findMany: async ({ where, orderBy, take, include } = {}) => {
      let list = [...store[modelName]];
      list = list.filter(item => matches(item, where));
      if (orderBy) {
        const key = Object.keys(orderBy)[0];
        const dir = orderBy[key];
        list.sort((a, b) => dir === 'desc' ? (b[key] > a[key] ? 1 : -1) : (a[key] > b[key] ? 1 : -1));
      }
      if (take) {
        list = list.slice(0, take);
      }
      return list.map(item => resolveIncludes(item, include, modelName));
    },
    create: async ({ data }) => {
      const newItem = { id: uuid(), createdAt: new Date(), updatedAt: new Date(), ...data };
      store[modelName].push(newItem);
      return newItem;
    },
    createMany: async ({ data }) => {
      const items = (Array.isArray(data) ? data : [data]).map(item => ({
        id: uuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...item
      }));
      store[modelName].push(...items);
      return { count: items.length };
    },
    update: async ({ where, data }) => {
      const list = store[modelName];
      const idx = list.findIndex(item => matches(item, where));
      if (idx === -1) throw new Error(`${modelName} not found for update`);
      const updatedItem = { ...list[idx], ...data, updatedAt: new Date() };
      list[idx] = updatedItem;
      return updatedItem;
    },
    updateMany: async ({ where, data }) => {
      const list = store[modelName];
      let count = 0;
      for (let i = 0; i < list.length; i++) {
        if (matches(list[i], where)) {
          list[i] = { ...list[i], ...data, updatedAt: new Date() };
          count++;
        }
      }
      return { count };
    },
    upsert: async ({ where, create, update }) => {
      const list = store[modelName];
      const idx = list.findIndex(item => matches(item, where));
      if (idx !== -1) {
        const updatedItem = { ...list[idx], ...update, updatedAt: new Date() };
        list[idx] = updatedItem;
        return updatedItem;
      } else {
        const newItem = { id: uuid(), createdAt: new Date(), updatedAt: new Date(), ...create };
        list.push(newItem);
        return newItem;
      }
    },
    deleteMany: async ({ where } = {}) => {
      const beforeCount = store[modelName].length;
      if (!where) {
        store[modelName] = [];
        return { count: beforeCount };
      }
      store[modelName] = store[modelName].filter(item => !matches(item, where));
      return { count: beforeCount - store[modelName].length };
    }
  };
}

// In-Memory Database instance wrapper
const mockPrisma = {
  $connect: async () => {
    console.log('[Mock DB] Connection simulated.');
  },
  $disconnect: async () => {},
  $transaction: async (callback) => {
    return callback(mockPrisma);
  },
  $queryRaw: async () => {
    return [{ result: 1 }];
  }
};

// Generate model handlers dynamically
for (const modelName of Object.keys(store)) {
  mockPrisma[modelName] = makeModelOps(modelName);
}

// Strict Database Environment Policy
const isPlaceholderUrl = !env.DATABASE_URL ||
  env.DATABASE_URL.toLowerCase().includes('your-') ||
  env.DATABASE_URL.toLowerCase().includes('placeholder') ||
  env.DATABASE_URL.includes('test:test');

const isStagingOrProd = env.NODE_ENV === 'production' || env.NODE_ENV === 'staging';
const isTestMode = env.NODE_ENV === 'test';

let activeClient;

if (isStagingOrProd) {
  if (isPlaceholderUrl) {
    throw new Error(
      `[Database] FATAL: ${env.NODE_ENV.toUpperCase()} environment REQUIRES a valid PostgreSQL DATABASE_URL. ` +
      `Silent in-memory mock fallback is strictly prohibited in staging/production to prevent data loss.`
    );
  }
  console.log(`[Database] 🚀 Initializing production Prisma Client for ${env.NODE_ENV} environment.`);
  activeClient = new PrismaClient({
    log: ['error', 'warn'],
  });
} else if (isTestMode || isPlaceholderUrl) {
  if (!isTestMode) {
    console.warn(
      '[Database] ⚠️ WARNING: Development environment using In-Memory simulated database because DATABASE_URL is placeholder/unset. ' +
      'Data will NOT persist across server restarts. Set a valid PostgreSQL DATABASE_URL in .env to use real storage.'
    );
  } else {
    console.log('[Database] 🟢 Using In-Memory simulated Database Client for test suite.');
  }
  activeClient = mockPrisma;
} else {
  try {
    activeClient = new PrismaClient({
      log: ['query', 'warn', 'error'],
    });
    console.log('[Database] 🔌 Connected to local development PostgreSQL database.');
  } catch (err) {
    console.warn('[Database] ⚠️ Failed to construct PrismaClient in development. Falling back to In-Memory simulation:', err.message);
    activeClient = mockPrisma;
  }
}

export const prisma = activeClient;
export default prisma;
export { store, mockPrisma }; // Exported for inspection in tests

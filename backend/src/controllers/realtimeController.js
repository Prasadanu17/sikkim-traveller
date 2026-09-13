/**
 * backend/src/controllers/realtimeController.js
 */

import { getWeatherForDestination, getWeatherForJourney } from '../services/realtime/weatherService.js';
import prisma from '../config/database.js';

export async function getCustomerRealtime(req, res, next) {
  try {
    const journeyId = req.customer.journeyId;

    // Get all destinations for the trip
    const trip = await prisma.trip.findUnique({
      where: { journeyId },
      include: { destinations: { orderBy: { order: 'asc' } } }
    });

    const destSlugs = trip?.destinations?.map(d => d.slug) || ['gangtok'];
    const weatherData = await getWeatherForJourney(destSlugs);

    // Get active travel advisories for the destinations region (e.g. Sikkim)
    const advisories = await prisma.travelAdvisory.findMany({
      where: {
        expiresAt: { gte: new Date() }
      },
      orderBy: { issuedAt: 'desc' }
    });

    // Provide structured road status / travel advisories mimicking Module 7
    return res.json({
      success: true,
      weather: weatherData,
      advisories: advisories.map(a => ({
        id: a.id,
        region: a.region,
        title: a.title,
        description: a.description,
        riskLevel: a.riskLevel,
        issuedAt: a.issuedAt.toISOString()
      })),
      roadStatus: {
        lastUpdated: new Date().toISOString(),
        routes: [
          { route: 'Siliguri to Gangtok (NH10)', status: '🟢 OPEN', conditions: 'Clear, light traffic' },
          { route: 'Gangtok to Nathula Pass', status: '🟢 OPEN', conditions: 'Permits required, open until 4 PM' },
          { route: 'Gangtok to Lachen / Lachung', status: '🟢 OPEN', conditions: 'Watch for weather changes in evening' }
        ]
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getWeather(req, res, next) {
  try {
    const { dest } = req.query;
    const data = await getWeatherForDestination(dest || 'gangtok');
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getAdvisories(req, res, next) {
  try {
    const advisories = await prisma.travelAdvisory.findMany({
      orderBy: { issuedAt: 'desc' },
      take: 20
    });
    return res.json({
      success: true,
      advisories: advisories.map(a => ({
        id: a.id,
        region: a.region,
        title: a.title,
        description: a.description,
        riskLevel: a.riskLevel,
        issuedAt: a.issuedAt.toISOString()
      }))
    });
  } catch (err) {
    next(err);
  }
}

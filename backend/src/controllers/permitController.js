/**
 * backend/src/controllers/permitController.js
 */

import prisma from '../config/database.js';

export async function getPermits(req, res, next) {
  try {
    const permits = await prisma.permit.findMany({
      where: { journeyId: req.customer.journeyId },
      orderBy: { createdAt: 'asc' },
    });

    return res.json({
      success: true,
      permits: permits.map(p => ({
        id: p.id,
        permitType: p.permitType,
        destination: p.destination,
        status: p.status,
        submittedAt: p.submittedAt?.toISOString(),
        approvedAt: p.approvedAt?.toISOString(),
      }))
    });
  } catch (err) { next(err); }
}

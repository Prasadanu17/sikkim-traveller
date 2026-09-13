/**
 * backend/src/controllers/changeRequestController.js
 */

import prisma from '../config/database.js';
import { sanitizeText } from '../security/sanitizer.js';
import { auditLog, AUDIT_ACTIONS } from '../audit/auditLogger.js';

const VALID_CATEGORIES = ['DATES','DESTINATIONS','ACCOMMODATION','TRANSPORTATION','BUDGET_REDUCE','BUDGET_INCREASE','PACE','ACTIVITY','GENERAL','CANCELLATION'];

export async function getChangeRequests(req, res, next) {
  try {
    const changeRequests = await prisma.changeRequest.findMany({
      where: { journeyId: req.customer.journeyId },
      orderBy: { createdAt: 'desc' },
    });
    // Strip internal review notes before returning
    return res.json({
      success: true,
      changeRequests: changeRequests.map(cr => ({
        id: cr.id,
        category: cr.category,
        title: cr.title,
        description: cr.description,
        status: cr.status,
        reviewedAt: cr.reviewedAt?.toISOString(),
        createdAt: cr.createdAt.toISOString(),
      }))
    });
  } catch (err) { next(err); }
}

export async function submitChangeRequest(req, res, next) {
  try {
    const { category, title, description, requestedDetails } = req.body;

    const cleanDesc = sanitizeText(description || '');
    const cleanTitle = sanitizeText(title || 'Change Request');
    const safeCategory = VALID_CATEGORIES.includes((category || '').toUpperCase())
      ? category.toUpperCase()
      : 'GENERAL';

    if (!cleanDesc || cleanDesc.length < 5) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Please provide a description (at least 5 characters).' } });
    }
    if (cleanDesc.length > 2000) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Description is too long (max 2000 characters).' } });
    }

    const changeRequest = await prisma.changeRequest.create({
      data: {
        journeyId: req.customer.journeyId,
        category: safeCategory,
        title: cleanTitle,
        description: cleanDesc,
        requestedDetails: requestedDetails || null,
        status: 'SUBMITTED',
      }
    });

    await auditLog({
      journeyId: req.customer.journeyId,
      action: AUDIT_ACTIONS.CHANGE_REQUEST_SUBMITTED,
      newValue: safeCategory,
      message: `Change request submitted: ${cleanTitle}`,
    });

    return res.status(201).json({
      success: true,
      changeRequest: {
        id: changeRequest.id,
        category: changeRequest.category,
        title: changeRequest.title,
        description: changeRequest.description,
        status: changeRequest.status,
        createdAt: changeRequest.createdAt.toISOString(),
      }
    });
  } catch (err) { next(err); }
}

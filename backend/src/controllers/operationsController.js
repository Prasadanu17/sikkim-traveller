/**
 * backend/src/controllers/operationsController.js
 */

import prisma from '../config/database.js';
import { signOpsToken } from '../middleware/opsAuth.js';
import { auditLog, AUDIT_ACTIONS } from '../audit/auditLogger.js';
import { sanitizeText } from '../security/sanitizer.js';

export async function getOpsToken(req, res, next) {
  try {
    const { email, password } = req.body;
    
    // In production, verify actual user password hash.
    // For dev / mock seeding, retrieve user by email.
    const user = await prisma.operationsUser.findUnique({
      where: { email: email || '' }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials or inactive user.' } });
    }

    const token = signOpsToken(user.id, user.role);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function listJourneys(req, res, next) {
  try {
    const journeys = await prisma.customerJourney.findMany({
      include: {
        traveler: true,
        trip: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, journeys });
  } catch (err) {
    next(err);
  }
}

export async function getJourney(req, res, next) {
  try {
    const { id } = req.params;

    const journey = await prisma.customerJourney.findUnique({
      where: { id },
      include: {
        traveler: true,
        trip: { include: { destinations: true } },
        itinerary: { include: { days: true } },
        permits: true,
        changeRequests: true,
        proposals: { include: { quote: true, approval: true } },
        payments: true,
        documents: true,
        auditLogs: { orderBy: { createdAt: 'desc' } },
        assignedStaff: true
      }
    });

    if (!journey) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Journey not found.' } });
    }

    // Hide internal details if role doesn't have permission (canViewInternalNotes is checked in middleware or here)
    const canViewInternalNotes = req.opsUser.permissions.canViewInternalNotes;
    const canViewPII = req.opsUser.permissions.canViewPII;

    const responseJourney = { ...journey };
    if (!canViewInternalNotes) {
      delete responseJourney.internalNotes;
      delete responseJourney.supplierMargin;
    }
    if (!canViewPII && responseJourney.traveler) {
      responseJourney.traveler = {
        ...responseJourney.traveler,
        fullName: 'REDACTED',
        email: 'REDACTED',
        phone: 'REDACTED'
      };
    }

    return res.json({ success: true, journey: responseJourney });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const journey = await prisma.customerJourney.findUnique({ where: { id } });
    if (!journey) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Journey not found.' } });
    }

    const previousStatus = journey.status;
    const updated = await prisma.customerJourney.update({
      where: { id },
      data: { status, updatedAt: new Date() }
    });

    await auditLog({
      journeyId: id,
      actorId: req.opsUser.id,
      actorRole: req.opsUser.role,
      action: AUDIT_ACTIONS.STATUS_CHANGED,
      previousValue: previousStatus,
      newValue: status,
      message: `Status updated from ${previousStatus} to ${status} by staff.`,
      ipAddress: req.ip
    });

    return res.json({ success: true, journey: updated });
  } catch (err) {
    next(err);
  }
}

export async function createQuote(req, res, next) {
  try {
    const { journeyId, baseCost, accommodationCost, transportCost, permitCost, serviceFee, taxes, markup } = req.body;

    if (!journeyId) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'journeyId is required.' } });
    }

    const finalPrice = baseCost + accommodationCost + transportCost + permitCost + serviceFee + taxes + markup;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7); // Valid for 7 days

    const quote = await prisma.quote.create({
      data: {
        journeyId,
        baseCost,
        accommodationCost,
        transportCost,
        permitCost,
        serviceFee,
        taxes,
        markup,
        finalPrice,
        validUntil,
        createdBy: req.opsUser.id,
        createdByRole: req.opsUser.role
      }
    });

    await auditLog({
      journeyId,
      actorId: req.opsUser.id,
      actorRole: req.opsUser.role,
      action: AUDIT_ACTIONS.OPS_ACTION,
      message: `Quote created for ₹${finalPrice}`,
      ipAddress: req.ip
    });

    return res.status(201).json({ success: true, quote });
  } catch (err) {
    next(err);
  }
}

export async function createProposal(req, res, next) {
  try {
    const { journeyId, quoteId, summary, inclusions, exclusions } = req.body;

    const journey = await prisma.customerJourney.findUnique({
      where: { id: journeyId },
      include: { proposals: true }
    });

    if (!journey) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Journey not found.' } });
    }

    const version = journey.proposals.length + 1;
    const versionLabel = `Proposal v${version}`;

    const quote = quoteId ? await prisma.quote.findUnique({ where: { id: quoteId } }) : null;
    const validUntil = quote?.validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Write proposal and invalidate any previous approvals in a transaction
    const proposal = await prisma.$transaction(async (tx) => {
      // Create new proposal
      const p = await tx.proposal.create({
        data: {
          journeyId,
          quoteId: quoteId || null,
          version,
          versionLabel,
          status: 'SENT_TO_CUSTOMER',
          summary,
          inclusions: inclusions || [],
          exclusions: exclusions || [],
          validUntil,
          sentAt: new Date(),
          createdBy: req.opsUser.id
        }
      });

      // Update journey active proposal
      await tx.customerJourney.update({
        where: { id: journeyId },
        data: {
          activeProposalId: p.id,
          status: 'PROPOSAL_SENT',
          updatedAt: new Date()
        }
      });

      // Invalidate previous approval if any exists
      const previousApproval = await tx.proposalApproval.findFirst({
        where: {
          proposal: { journeyId },
          invalidatedAt: null
        }
      });

      if (previousApproval) {
        await tx.proposalApproval.update({
          where: { id: previousApproval.id },
          data: {
            invalidatedAt: new Date(),
            invalidationReason: `New proposal v${version} was sent.`
          }
        });
      }

      await tx.auditLog.create({
        data: {
          journeyId,
          actorId: req.opsUser.id,
          actorRole: req.opsUser.role,
          action: AUDIT_ACTIONS.PROPOSAL_SENT,
          newValue: versionLabel,
          message: `${versionLabel} published and sent. Previous approvals invalidated.`,
        }
      });

      return p;
    });

    return res.status(201).json({ success: true, proposal });
  } catch (err) {
    next(err);
  }
}

export async function reviewChangeRequest(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    const changeRequest = await prisma.changeRequest.findUnique({
      where: { id },
      include: { journey: true }
    });

    if (!changeRequest) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Change request not found.' } });
    }

    const updated = await prisma.changeRequest.update({
      where: { id },
      data: {
        status,
        reviewedBy: req.opsUser.id,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes ? sanitizeText(reviewNotes) : null
      }
    });

    await auditLog({
      journeyId: changeRequest.journeyId,
      actorId: req.opsUser.id,
      actorRole: req.opsUser.role,
      action: AUDIT_ACTIONS.CHANGE_REQUEST_UPDATED,
      newValue: status,
      message: `Change request status changed to ${status}. Notes: ${reviewNotes}`,
      ipAddress: req.ip
    });

    return res.json({ success: true, changeRequest: updated });
  } catch (err) {
    next(err);
  }
}

export async function addNote(req, res, next) {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const journey = await prisma.customerJourney.findUnique({ where: { id } });
    if (!journey) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Journey not found.' } });
    }

    const cleanNote = sanitizeText(note || '');

    const updated = await prisma.customerJourney.update({
      where: { id },
      data: {
        internalNotes: journey.internalNotes 
          ? `${journey.internalNotes}\n[${new Date().toISOString()} - ${req.opsUser.role}]: ${cleanNote}`
          : `[${new Date().toISOString()} - ${req.opsUser.role}]: ${cleanNote}`
      }
    });

    await auditLog({
      journeyId: id,
      actorId: req.opsUser.id,
      actorRole: req.opsUser.role,
      action: AUDIT_ACTIONS.OPS_ACTION,
      message: `Added internal operational note.`,
      ipAddress: req.ip
    });

    return res.json({ success: true, internalNotes: updated.internalNotes });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLog(req, res, next) {
  try {
    const { id } = req.params;
    const logs = await prisma.auditLog.findMany({
      where: { journeyId: id },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, auditLogs: logs });
  } catch (err) {
    next(err);
  }
}

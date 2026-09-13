/**
 * backend/src/controllers/proposalController.js
 */

import { getLatestProposal, approveProposal as approveProposalService } from '../services/customer/proposalService.js';

export async function getProposal(req, res, next) {
  try {
    const proposal = await getLatestProposal(req.customer.journeyId);
    if (!proposal) return res.json({ success: true, proposal: null });
    return res.json({ success: true, proposal });
  } catch (err) {
    next(err);
  }
}

export async function approveProposal(req, res, next) {
  try {
    const { proposalVersion, agreements, customerName } = req.body;

    if (!proposalVersion) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'proposalVersion is required.' } });
    }

    const result = await approveProposalService(
      req.customer.journeyId,
      req.customer.sessionId,
      Number(proposalVersion),
      agreements,
      customerName,
      req.ip
    );

    return res.json(result);
  } catch (err) {
    next(err);
  }
}

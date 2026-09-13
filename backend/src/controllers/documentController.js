/**
 * backend/src/controllers/documentController.js
 */

import * as documentService from '../services/customer/documentService.js';

export async function getDocuments(req, res, next) {
  try {
    const docs = await documentService.getDocuments(req.customer.journeyId);
    return res.json({ success: true, documents: docs });
  } catch (err) { next(err); }
}

export async function getSignedUrl(req, res, next) {
  try {
    const { id } = req.params;
    // IDOR: journeyId from session — not from req.params or req.query
    const result = await documentService.getSignedDownloadUrl(req.customer.journeyId, id);
    return res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

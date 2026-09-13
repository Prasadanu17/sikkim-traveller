/**
 * backend/src/services/customer/documentService.js
 * Document service using Supabase Storage private buckets + short-lived signed URLs.
 *
 * SECURITY: Documents are NEVER publicly accessible.
 * All access requires journey session verification + document authorization checks.
 */

import prisma from '../../config/database.js';
import { auditLog, AUDIT_ACTIONS } from '../../audit/auditLogger.js';
import env from '../../config/env.js';

let supabaseClient = null;

async function getSupabase() {
  if (supabaseClient) return supabaseClient;
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw Object.assign(new Error('Document storage not configured.'), { status: 503, code: 'STORAGE_UNAVAILABLE' });
  }
  const { createClient } = await import('@supabase/supabase-js');
  supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  return supabaseClient;
}

/**
 * Gets document list for an authorized journey.
 * Returns metadata only — not the actual file URLs yet.
 * @param {string} journeyId - From authenticated session
 */
export async function getDocuments(journeyId) {
  const docs = await prisma.document.findMany({
    where: { journeyId, status: 'READY' },
    orderBy: { createdAt: 'desc' }
  });

  return docs.map(d => ({
    id: d.id,
    name: d.name,
    type: d.type,
    status: d.status,
    version: d.version,
    date: d.issuedAt?.toISOString().split('T')[0] || d.createdAt.toISOString().split('T')[0],
    downloadUrl: `/api/customer/documents/${d.id}/download`,
  }));
}

/**
 * Generates a short-lived signed URL for a specific document.
 * Verifies journey ownership before generating URL.
 *
 * @param {string} journeyId - From authenticated session (NEVER from browser)
 * @param {string} documentId - The document to retrieve
 * @returns {{ signedUrl: string, expiresAt: string }}
 */
export async function getSignedDownloadUrl(journeyId, documentId) {
  // Ownership check — ensure this document belongs to this journey
  const doc = await prisma.document.findFirst({
    where: {
      id: documentId,
      journeyId, // IDOR protection — journeyId from verified session only
      status: 'READY',
    }
  });

  if (!doc) {
    throw Object.assign(
      new Error('Document not found or not authorized.'),
      { status: 404, code: 'NOT_FOUND' }
    );
  }

  // Check journey status allows document access
  const journey = await prisma.customerJourney.findUnique({
    where: { id: journeyId },
    select: { status: true }
  });

  const documentsAllowedStatuses = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'READY_TO_CONFIRM'];
  if (!documentsAllowedStatuses.includes(journey.status)) {
    throw Object.assign(
      new Error('Documents become available once your journey is confirmed.'),
      { status: 403, code: 'DOCUMENT_NOT_READY' }
    );
  }

  const supabase = await getSupabase();
  const expirySeconds = 300; // 5 minutes

  const { data, error } = await supabase.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .createSignedUrl(doc.storagePath, expirySeconds);

  if (error || !data?.signedUrl) {
    throw Object.assign(new Error('Unable to generate document access link.'), { status: 500, code: 'STORAGE_ERROR' });
  }

  await auditLog({
    journeyId,
    action: AUDIT_ACTIONS.DOCUMENT_ACCESSED,
    message: `Document ${doc.name} (${doc.type}) accessed`,
  });

  const expiresAt = new Date(Date.now() + expirySeconds * 1000);

  return {
    signedUrl: data.signedUrl,
    expiresAt: expiresAt.toISOString(),
    documentName: doc.name,
  };
}

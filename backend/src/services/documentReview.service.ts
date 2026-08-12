import { Knex } from 'knex';
import db from '../config/database';
import { ConflictError, ForbiddenError, NotFoundError } from '../utils/errors';
import { normalizeDocumentType } from './documentStorage.service';
import { writeAudit } from './audit.service';
import { applicationStudentUserId, queueNotification } from './notification.service';
import { WorkflowActor, lockApplication, transitionApplication } from './workflow.service';

async function claimApplication(
  trx: Knex.Transaction,
  applicationId: number,
  reviewerId: number,
): Promise<Record<string, any>> {
  await trx('Applications')
    .where({ ApplicationID: applicationId })
    .whereNull('AssignedDocReviewer')
    .update({ AssignedDocReviewer: reviewerId, UpdatedAt: trx.fn.now() });
  const app = await lockApplication(trx, applicationId);
  if (app.AssignedDocReviewer !== reviewerId) throw new ConflictError('Application is assigned to another reviewer.');
  if (!['Submitted', 'AutoMatched', 'DocAuditInProgress'].includes(app.Status)) {
    throw new ConflictError('Application is not in document review.');
  }
  if (app.IsHeldByAdmin) throw new ForbiddenError('Application is currently on hold.');
  return app;
}

export async function reviewDocument(
  checklistId: number,
  actor: WorkflowActor,
  status: 'Verified' | 'Rejected',
  rejectionReason?: string,
) {
  return db.transaction(async (trx) => {
    const rows = await trx.raw(
      'SELECT * FROM DocumentChecklist WITH (UPDLOCK, ROWLOCK) WHERE ChecklistID = ?',
      [checklistId],
    );
    const document = Array.isArray(rows) ? rows[0] : undefined;
    if (!document) throw new NotFoundError('Document not found.');
    if (!['Uploaded', 'Pending'].includes(document.Status)) {
      throw new ConflictError('Document has already been reviewed or needs re-upload.');
    }
    let app = await claimApplication(trx, document.ApplicationID, actor.userId);
    if (['Submitted', 'AutoMatched'].includes(app.Status)) {
      app = await transitionApplication(trx, document.ApplicationID, 'DocAuditInProgress', actor, {
        assignment: 'AssignedDocReviewer',
      });
    }

    const finalStatus = status === 'Rejected' ? 'ReUploadRequested' : 'Verified';
    const updated = await trx('DocumentChecklist')
      .where({ ChecklistID: checklistId, Version: document.Version ?? 0, Status: document.Status })
      .update({
        Status: finalStatus,
        ReviewedBy: actor.userId,
        ReviewedAt: trx.fn.now(),
        RejectionReason: status === 'Rejected' ? rejectionReason : null,
        ReUploadCount: status === 'Rejected' ? Number(document.ReUploadCount ?? 0) + 1 : document.ReUploadCount,
        Version: Number(document.Version ?? 0) + 1,
      });
    if (updated !== 1) throw new ConflictError('Document changed; refresh and retry.');
    await writeAudit(trx, {
      userId: actor.userId, action: status === 'Verified' ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REJECTED',
      entityType: 'DocumentChecklist', entityId: checklistId,
      oldValue: { status: document.Status }, newValue: { status: finalStatus, reason: rejectionReason },
      requestId: actor.requestId, ipAddress: actor.ipAddress,
    });

    const studentUserId = await applicationStudentUserId(trx, document.ApplicationID);
    if (status === 'Rejected' && studentUserId) {
      await queueNotification(trx, studentUserId, 'DOCUMENT_REUPLOAD_REQUIRED',
        `${document.DocumentType} requires re-upload: ${rejectionReason}`, { checklistId });
    }
    const remaining = await trx('DocumentChecklist')
      .where({ ApplicationID: document.ApplicationID }).whereNot('Status', 'Verified').count('* as count').first();
    const total = await trx('DocumentChecklist').where({ ApplicationID: document.ApplicationID }).count('* as count').first();
    const allVerified = Number(total?.count ?? 0) > 0 && Number(remaining?.count ?? 0) === 0;
    if (allVerified) {
      await transitionApplication(trx, document.ApplicationID, 'DocAuditComplete', actor, {
        assignment: 'AssignedDocReviewer',
      });
      if (studentUserId) await queueNotification(trx, studentUserId, 'DOCUMENT_AUDIT_COMPLETE',
        'All submitted documents have been verified.', { applicationId: document.ApplicationID });
    }
    return { checklistId, status: finalStatus, allVerified };
  });
}

export async function linkReuploadedDocument(
  applicationId: number,
  studentId: number,
  rawDocumentType: string,
  actor: WorkflowActor,
) {
  const documentType = normalizeDocumentType(rawDocumentType);
  return db.transaction(async (trx) => {
    const app = await trx('Applications').where({ ApplicationID: applicationId, StudentID: studentId }).first();
    if (!app) throw new NotFoundError('Application not found.');
    const studentDoc = await trx('StudentDocuments as d')
      .leftJoin('DocumentVersions as v', function joinVersion() {
        this.on('v.DocumentID', '=', 'd.DocumentID').andOn('v.VersionNumber', '=', 'd.CurrentVersion');
      })
      .select('d.*', 'v.DocumentVersionID')
      .where({ 'd.StudentID': studentId, 'd.DocumentType': documentType, 'd.IsActive': true })
      .first();
    if (!studentDoc) throw new NotFoundError('Upload the replacement document first.');
    const checklist = await trx('DocumentChecklist')
      .where({ ApplicationID: applicationId, DocumentType: documentType }).first();
    if (!checklist || checklist.Status !== 'ReUploadRequested') {
      throw new ConflictError('This document is not awaiting re-upload.');
    }
    await trx('DocumentChecklist').where({ ChecklistID: checklist.ChecklistID }).update({
      DocumentVersionID: studentDoc.DocumentVersionID,
      FileURL: `/api/v1/documents/checklist/${checklist.ChecklistID}/download`,
      Status: 'Uploaded', UploadedAt: trx.fn.now(), ReviewedBy: null, ReviewedAt: null,
      RejectionReason: null, Version: Number(checklist.Version ?? 0) + 1,
    });
    await writeAudit(trx, {
      userId: actor.userId, action: 'DOCUMENT_REUPLOADED', entityType: 'DocumentChecklist',
      entityId: checklist.ChecklistID, oldValue: { status: checklist.Status },
      newValue: { status: 'Uploaded', documentVersionId: studentDoc.DocumentVersionID },
      requestId: actor.requestId, ipAddress: actor.ipAddress,
    });
    return { checklistId: checklist.ChecklistID, documentType, status: 'Uploaded' };
  });
}

import db from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';

export async function getPendingReviewApplications() {
  return db('Applications as a')
    .join('Students as s', 's.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 's.UserID')
    .join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID')
    .select(
      'a.ApplicationID',
      'a.Status',
      'a.SubmissionDate',
      'u.FullName as StudentName',
      'u.Email as StudentEmail',
      'sc.Name as ScholarshipName'
    )
    .whereIn('a.Status', ['Submitted', 'AutoMatched', 'DocAuditInProgress'])
    .orderBy('a.SubmissionDate', 'asc');
}

export async function getPendingDocuments() {
  return db('DocumentChecklist as dc')
    .join('Applications as a', 'a.ApplicationID', 'dc.ApplicationID')
    .join('Students as s', 's.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 's.UserID')
    .select(
      'dc.*',
      'a.ScholarshipID',
      'a.Status as ApplicationStatus',
      'u.FullName as StudentName',
      'u.Email as StudentEmail'
    )
    .whereIn('dc.Status', ['Pending', 'Uploaded', 'ReUploadRequested'])
    .orderBy('dc.CreatedAt', 'asc');
}

export async function reviewDocument(
  checklistId: number,
  reviewerId: number,
  status: 'Verified' | 'Rejected',
  rejectionReason?: string
) {
  const trx = await db.transaction();
  try {
    const doc = await trx('DocumentChecklist').where({ ChecklistID: checklistId }).first();
    if (!doc) throw new NotFoundError('Document not found');

    const updateData: any = {
      Status: status,
      ReviewedBy: reviewerId,
      ReviewedAt: trx.fn.now(),
      RejectionReason: status === 'Rejected' ? rejectionReason : null,
    };

    if (status === 'Rejected') {
      updateData.ReUploadCount = doc.ReUploadCount + 1;
      updateData.Status = 'ReUploadRequested';
    }

    await trx('DocumentChecklist')
      .where({ ChecklistID: checklistId })
      .update(updateData);

    const allDocs = await trx('DocumentChecklist')
      .where({ ApplicationID: doc.ApplicationID });

    const allVerified = allDocs.every((d) => 
      (d.ChecklistID === checklistId ? status === 'Verified' : d.Status === 'Verified')
    );

    if (allVerified && allDocs.length > 0) {
      await trx('Applications')
        .where({ ApplicationID: doc.ApplicationID })
        .update({ Status: 'DocAuditComplete' });
    } else if (status === 'Rejected') {
      await trx('Applications')
        .where({ ApplicationID: doc.ApplicationID })
        .update({ Status: 'DocAuditInProgress' });
    } else {
      const app = await trx('Applications').where({ ApplicationID: doc.ApplicationID }).first();
      if (app.Status === 'Submitted') {
        await trx('Applications')
          .where({ ApplicationID: doc.ApplicationID })
          .update({ Status: 'DocAuditInProgress' });
      }
    }

    await trx.commit();
    return { checklistId, status, allVerified };
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

export async function getStudentReUploads(studentId: number) {
  return db('DocumentChecklist as dc')
    .join('Applications as a', 'a.ApplicationID', 'dc.ApplicationID')
    .select('dc.*', 'a.ScholarshipID')
    .where('a.StudentID', studentId)
    .whereIn('dc.Status', ['Rejected', 'ReUploadRequested']);
}

export async function uploadDocument(applicationId: number, documentType: string, fileUrl: string) {
  const doc = await db('DocumentChecklist')
    .where({ ApplicationID: applicationId, DocumentType: documentType })
    .first();

  if (doc) {
    await db('DocumentChecklist')
      .where({ ChecklistID: doc.ChecklistID })
      .update({
        FileURL: fileUrl,
        Status: 'Uploaded',
        UploadedAt: db.fn.now(),
      });
    return { ChecklistID: doc.ChecklistID, ApplicationID: applicationId, DocumentType: documentType, FileURL: fileUrl, Status: 'Uploaded' };
  } else {
    const [inserted] = await db('DocumentChecklist')
      .insert({
        ApplicationID: applicationId,
        DocumentType: documentType,
        FileURL: fileUrl,
        Status: 'Uploaded',
        UploadedAt: db.fn.now(),
      })
      .returning('*');
    return inserted;
  }
}

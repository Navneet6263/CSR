import fs from 'fs';
import path from 'path';
import db from '../config/database';
import { NotFoundError } from '../utils/errors';
import { writeAudit } from './audit.service';
import {
  normalizeDocumentType, removeStoredFile, secureUploadedFile,
} from './documentStorage.service';

function cleanOriginalName(value: string): string {
  return path.basename(value).replace(/[\x00-\x1f\x7f]/g, '').slice(0, 255) || 'document';
}

export async function saveStudentDocument(
  userId: number,
  rawDocumentType: string,
  file: Express.Multer.File,
) {
  const student = await db('Students').where({ UserID: userId }).first();
  if (!student) throw new NotFoundError('Student profile not found.');
  const documentType = normalizeDocumentType(rawDocumentType);
  let stored: Awaited<ReturnType<typeof secureUploadedFile>> | undefined;

  try {
    stored = await secureUploadedFile(file, student.StudentID, documentType);
    return await db.transaction(async (trx) => {
      const rows = await trx.raw(
        'SELECT * FROM StudentDocuments WITH (UPDLOCK, ROWLOCK) WHERE StudentID = ? AND DocumentType = ?',
        [student.StudentID, documentType],
      );
      const existing = Array.isArray(rows) ? rows[0] : undefined;
      const version = Number(existing?.CurrentVersion ?? 0) + 1;
      let documentId: number;

      if (existing) {
        documentId = existing.DocumentID;
      } else {
        const [created] = await trx('StudentDocuments').insert({
          StudentID: student.StudentID,
          DocumentType: documentType,
          FileURL: '/api/v1/documents/pending',
          StorageKey: stored!.storageKey,
          OriginalName: cleanOriginalName(file.originalname),
          MimeType: file.mimetype,
          SizeBytes: file.size,
          Sha256: stored!.digest,
          ScanStatus: stored!.scanStatus,
          CurrentVersion: version,
          IsActive: true,
          UploadedAt: trx.fn.now(),
        }).returning('DocumentID');
        documentId = typeof created === 'object' ? created.DocumentID : created;
      }

      const [createdVersion] = await trx('DocumentVersions').insert({
        DocumentID: documentId,
        VersionNumber: version,
        StorageKey: stored!.storageKey,
        OriginalName: cleanOriginalName(file.originalname),
        MimeType: file.mimetype,
        SizeBytes: file.size,
        Sha256: stored!.digest,
        ScanStatus: stored!.scanStatus,
        UploadedBy: userId,
      }).returning('DocumentVersionID');
      const versionId = typeof createdVersion === 'object'
        ? createdVersion.DocumentVersionID
        : createdVersion;
      const fileUrl = `/api/v1/documents/student/${documentId}/download`;

      await trx('StudentDocuments').where({ DocumentID: documentId }).update({
        FileURL: fileUrl,
        StorageKey: stored!.storageKey,
        OriginalName: cleanOriginalName(file.originalname),
        MimeType: file.mimetype,
        SizeBytes: file.size,
        Sha256: stored!.digest,
        ScanStatus: stored!.scanStatus,
        CurrentVersion: version,
        IsActive: true,
        UploadedAt: trx.fn.now(),
      });
      await writeAudit(trx, {
        userId, action: existing ? 'DOCUMENT_REUPLOADED' : 'DOCUMENT_UPLOADED',
        entityType: 'StudentDocument', entityId: documentId,
        newValue: { documentType, version, sha256: stored!.digest },
      });
      return { documentId, documentVersionId: versionId, documentType, fileUrl, scanStatus: stored!.scanStatus };
    });
  } catch (error) {
    await removeStoredFile(stored?.destination ?? file.path).catch(() => undefined);
    throw error;
  }
}

export async function listStudentDocuments(userId: number) {
  const student = await db('Students').where({ UserID: userId }).first();
  if (!student) return [];
  const documents = await db('StudentDocuments').where({ StudentID: student.StudentID, IsActive: true });
  return documents.map((doc) => ({
    ...doc,
    StorageKey: undefined,
    FileURL: `/api/v1/documents/student/${doc.DocumentID}/download`,
  }));
}

import fs from 'fs';
import path from 'path';
import db from '../config/database';
import { AuthPayload } from '../types';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import { assertApplicationAccess } from './applicationAccess.service';
import { resolveStorageKey } from './documentStorage.service';

export interface DownloadFile {
  path: string;
  mimeType: string;
  originalName: string;
}

function legacyPath(fileUrl: string): string | undefined {
  try {
    const pathname = new URL(fileUrl, 'http://legacy.local').pathname;
    const marker = '/uploads/';
    const index = pathname.toLowerCase().indexOf(marker);
    if (index < 0) return undefined;
    const relative = decodeURIComponent(pathname.slice(index + marker.length));
    const root = path.resolve(process.cwd(), 'uploads');
    const resolved = path.resolve(root, relative);
    return resolved.startsWith(`${root}${path.sep}`) ? resolved : undefined;
  } catch {
    return undefined;
  }
}

function toDownload(record: Record<string, any>): DownloadFile {
  const filePath = record.StorageKey
    ? resolveStorageKey(record.StorageKey)
    : legacyPath(record.FileURL);
  if (!filePath || !fs.existsSync(filePath)) throw new NotFoundError('Document file not found.');
  return {
    path: filePath,
    mimeType: record.MimeType ?? (filePath.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
    originalName: record.OriginalName ?? path.basename(filePath),
  };
}

export async function studentDocumentDownload(
  documentId: number,
  user: AuthPayload,
): Promise<DownloadFile> {
  const record = await db('StudentDocuments as d')
    .join('Students as s', 's.StudentID', 'd.StudentID')
    .leftJoin('DocumentVersions as v', function joinVersion() {
      this.on('v.DocumentID', '=', 'd.DocumentID').andOn('v.VersionNumber', '=', 'd.CurrentVersion');
    })
    .select('d.*', 's.UserID', 'v.StorageKey as VersionStorageKey', 'v.MimeType as VersionMimeType', 'v.OriginalName as VersionName')
    .where('d.DocumentID', documentId)
    .first();
  if (!record) throw new NotFoundError('Document not found.');
  if (user.role !== 'Admin' && (user.role !== 'Student' || record.UserID !== user.userId)) {
    throw new ForbiddenError('You do not have access to this document.');
  }
  return toDownload({
    ...record,
    StorageKey: record.VersionStorageKey ?? record.StorageKey,
    MimeType: record.VersionMimeType ?? record.MimeType,
    OriginalName: record.VersionName ?? record.OriginalName,
  });
}

export async function checklistDocumentDownload(
  checklistId: number,
  user: AuthPayload,
): Promise<DownloadFile> {
  const record = await db('DocumentChecklist as c')
    .leftJoin('DocumentVersions as v', 'v.DocumentVersionID', 'c.DocumentVersionID')
    .select('c.ApplicationID', 'c.FileURL', 'v.StorageKey', 'v.MimeType', 'v.OriginalName')
    .where('c.ChecklistID', checklistId)
    .first();
  if (!record) throw new NotFoundError('Checklist document not found.');
  await assertApplicationAccess(record.ApplicationID, user);
  return toDownload(record);
}

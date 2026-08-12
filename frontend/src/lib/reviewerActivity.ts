import type { RawReviewerLog, ReviewerActivityLog } from '@/types/reviewer';

export function mapReviewerLog(log: RawReviewerLog): ReviewerActivityLog {
  const action = log.action === 'Verified' ? 'Approved'
    : ['ReUploadRequested', 'Rejected'].includes(log.action) ? 'Rejected' : 'Submitted';
  const spaced = (log.docType || 'Document').replace(/([A-Z])/g, ' $1').trim();
  return {
    id: String(log.id), action, docType: spaced.charAt(0).toUpperCase() + spaced.slice(1),
    studentName: log.studentName, appId: String(log.appId), reason: log.reason,
    timestamp: log.timestamp,
  };
}

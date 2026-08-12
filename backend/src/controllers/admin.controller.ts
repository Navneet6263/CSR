import { NextFunction, Request, Response } from 'express';
import * as admin from '../services/admin.service';
import { ValidationError } from '../utils/errors';
import { parsePage } from '../utils/pagination';
import { requestActor } from '../utils/requestActor';
import { sendSuccess } from '../utils/response';
import * as adminUsers from '../services/adminUsers.service';
import { getRecentAuditEvents } from '../services/adminAudit.service';
import { getAdminPaymentQueue } from '../services/adminFinance.service';
import { getScholarshipOverview, listSponsors } from '../services/adminScholarships.service';
import * as comms from '../services/adminComms.service';
import { getGeoAnalytics, getSlaAnalytics } from '../services/adminAnalytics.service';
import { exportAdminReport } from '../services/adminReports.service';
import { emergencyApproveApplication } from '../services/adminOverride.service';

function id(value: unknown) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new ValidationError('A valid application id is required.');
  return parsed;
}

export async function getStaffHandler(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await adminUsers.listStaff()); } catch (error) { next(error); }
}

export async function createStaffHandler(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await adminUsers.createStaff(req.body, requestActor(req)), 'Staff account created', 201); }
  catch (error) { next(error); }
}

export async function deactivateStaffHandler(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await adminUsers.deactivateStaff(id(req.params.id), requestActor(req))); }
  catch (error) { next(error); }
}

export async function getAuditEventsHandler(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getRecentAuditEvents()); } catch (error) { next(error); }
}

export async function getAdminPaymentQueueHandler(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getAdminPaymentQueue()); } catch (error) { next(error); }
}

export async function getSponsorsHandler(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await listSponsors()); } catch (error) { next(error); }
}

export async function getScholarshipOverviewHandler(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getScholarshipOverview(id(req.params.id))); } catch (error) { next(error); }
}

export async function getAnnouncementsHandler(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await comms.listAnnouncements()); } catch (error) { next(error); }
}
export async function createAnnouncementHandler(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await comms.createAnnouncement(req.body, requestActor(req)), 'Announcement saved.', 201); }
  catch (error) { next(error); }
}
export async function archiveAnnouncementHandler(req: Request, res: Response, next: NextFunction) {
  try { await comms.archiveAnnouncement(id(req.params.id), requestActor(req)); sendSuccess(res, null, 'Announcement archived.'); }
  catch (error) { next(error); }
}
export async function getBroadcastsHandler(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await comms.listBroadcasts()); } catch (error) { next(error); }
}
export async function sendBroadcastHandler(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await comms.sendBroadcast(req.body, requestActor(req)), 'Notification sent.', 201); }
  catch (error) { next(error); }
}
export async function getTicketsHandler(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await comms.listSupportTickets()); } catch (error) { next(error); }
}
export async function updateTicketHandler(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await comms.updateTicket(id(req.params.id), req.body.status, requestActor(req))); }
  catch (error) { next(error); }
}

export async function getDashboardMetricsHandler(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await admin.getDashboardMetrics()); } catch (error) { next(error); }
}

export async function toggleApplicationHoldHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admin.toggleApplicationHold(
      id(req.params.id), req.body.hold, requestActor(req), req.body.reason,
    );
    sendSuccess(res, result, 'Hold status updated successfully');
  } catch (error) { next(error); }
}

export async function emergencyApproveApplicationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await emergencyApproveApplication(id(req.params.id), req.body, requestActor(req));
    sendSuccess(res, result, 'Emergency stage approval recorded successfully.');
  } catch (error) { next(error); }
}

export async function getRolePipelineHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const roles: admin.PipelineRole[] = ['reviewer', 'bgchecker', 'screener', 'csr'];
    const role = req.params.role as admin.PipelineRole;
    if (!roles.includes(role)) throw new ValidationError('Invalid pipeline role.');
    const { page, limit } = parsePage(req.query.page, req.query.limit, 25, 100);
    sendSuccess(res, await admin.getPipelineByRole(role, page, limit));
  } catch (error) { next(error); }
}

export async function getSlaAnalyticsHandler(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getSlaAnalytics()); } catch (error) { next(error); }
}

export async function getGeoAnalyticsHandler(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getGeoAnalytics()); } catch (error) { next(error); }
}

export async function bulkHoldApplicationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await admin.bulkToggleApplicationHold(req.body.applicationIds, req.body.hold, req.body.reason, requestActor(req));
    sendSuccess(res, result, 'Bulk hold operation completed.');
  } catch (error) { next(error); }
}

export async function exportReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const type = Array.isArray(req.params.type) ? req.params.type[0] : req.params.type;
    const report = await exportAdminReport(type, requestActor(req));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
    res.status(200).send(report.content);
  } catch (error) { next(error); }
}

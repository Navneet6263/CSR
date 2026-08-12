import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { bulkHoldSchema, emergencyApprovalSchema, validateHoldApplication } from '../validators/admin.validator';
import {
  getDashboardMetricsHandler,
  toggleApplicationHoldHandler,
  getRolePipelineHandler, getStaffHandler, createStaffHandler, deactivateStaffHandler, getAuditEventsHandler,
  getAdminPaymentQueueHandler,
  getSponsorsHandler, getScholarshipOverviewHandler,
  getAnnouncementsHandler, createAnnouncementHandler, archiveAnnouncementHandler,
  getBroadcastsHandler, sendBroadcastHandler, getTicketsHandler, updateTicketHandler,
  getSlaAnalyticsHandler, getGeoAnalyticsHandler, bulkHoldApplicationsHandler, exportReportHandler,
  emergencyApproveApplicationHandler,
} from '../controllers/admin.controller';
import { validateBody } from '../middleware/validate';
import { createStaffSchema } from '../validators/adminUsers.validator';
import { announcementSchema, broadcastSchema, ticketUpdateSchema } from '../validators/adminComms.validator';

const router = Router();

router.use(authenticate, requireRole('Admin'));

router.get('/metrics', getDashboardMetricsHandler);
router.get('/pipeline/:role', getRolePipelineHandler);
router.post('/applications/:id/hold', validateHoldApplication, toggleApplicationHoldHandler);
router.post('/applications/:id/emergency-approve', validateBody(emergencyApprovalSchema), emergencyApproveApplicationHandler);
router.post('/applications/bulk-hold', validateBody(bulkHoldSchema), bulkHoldApplicationsHandler);
router.get('/analytics/sla', getSlaAnalyticsHandler);
router.get('/analytics/geo', getGeoAnalyticsHandler);
router.post('/reports/:type/export', exportReportHandler);
router.get('/users', getStaffHandler);
router.post('/users', validateBody(createStaffSchema), createStaffHandler);
router.delete('/users/:id', deactivateStaffHandler);
router.get('/audit-events', getAuditEventsHandler);
router.get('/payment-queue', getAdminPaymentQueueHandler);
router.get('/sponsors', getSponsorsHandler);
router.get('/scholarships/:id/overview', getScholarshipOverviewHandler);
router.get('/announcements', getAnnouncementsHandler);
router.post('/announcements', validateBody(announcementSchema), createAnnouncementHandler);
router.delete('/announcements/:id', archiveAnnouncementHandler);
router.get('/broadcasts', getBroadcastsHandler);
router.post('/broadcasts', validateBody(broadcastSchema), sendBroadcastHandler);
router.get('/support-tickets', getTicketsHandler);
router.patch('/support-tickets/:id', validateBody(ticketUpdateSchema), updateTicketHandler);

export default router;

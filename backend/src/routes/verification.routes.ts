import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { validate, docReviewSchema, bgCheckSchema } from '../validators/verification.validator';
import {
  getDocsPending,
  reviewDoc,
  getReUploads,
  uploadDoc,
  getBGChecksPending,
  submitBGCheck,
  getAppDocs,
  getReviewerLogsHandler,
  getStatsHandler,
  getBGCheckDetailsHandler,
  getBGOfficerLogsHandler,
  getBGOfficerStatsHandler
} from '../controllers/verification.controller';

const router = Router();

// Ensure all routes are protected
router.use(authenticate);

// ─── Document Audit Routes ──────────────────────────────────────────────────
router.get('/docs/pending', requireRole('DocReviewer'), getDocsPending);
router.get('/docs/application/:id', requireRole('DocReviewer'), getAppDocs);
router.put('/docs/:id/review', requireRole('DocReviewer'), validate(docReviewSchema), reviewDoc);
router.get('/logs', requireRole('DocReviewer'), getReviewerLogsHandler);
router.get('/stats', requireRole('DocReviewer'), getStatsHandler);

// Student Docs
router.get('/docs/reuploads', requireRole('Student'), getReUploads);
router.post('/docs/upload', requireRole('Student'), uploadDoc); // No complex validation schema added but can be if needed.

// ─── Background Check Routes ────────────────────────────────────────────────
router.get('/bg-checks/stats', requireRole('BGCheckOfficer'), getBGOfficerStatsHandler);
router.get('/bg-checks/logs', requireRole('BGCheckOfficer'), getBGOfficerLogsHandler);
router.get('/bg-checks/pending', requireRole('BGCheckOfficer'), getBGChecksPending);
router.get('/bg-checks/:applicationId', requireRole('BGCheckOfficer'), getBGCheckDetailsHandler);
router.post('/bg-checks/:applicationId', requireRole('BGCheckOfficer'), validate(bgCheckSchema), submitBGCheck);

export default router;

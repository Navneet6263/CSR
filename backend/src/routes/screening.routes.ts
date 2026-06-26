import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  getPendingScreeningHandler,
  submitScreeningDecisionHandler,
  getPendingCSRHandler,
  submitCSRDecisionHandler,
  getConsolidatedHandler,
  getScreenerStatsHandler,
  getScreeningHistoryHandler,
} from '../controllers/screening.controller';
import {
  validateScreeningDecision,
  validateCsrDecision,
} from '../validators/screening.validator';

const router = Router();

router.use(authenticate);

// ─── Screening Officer Routes ───────────────────────────────────────────────

router.get(
  '/stats',
  requireRole('ScreeningOfficer'),
  getScreenerStatsHandler
);

router.get(
  '/history',
  requireRole('ScreeningOfficer'),
  getScreeningHistoryHandler
);

router.get(
  '/pending',
  requireRole('ScreeningOfficer'),
  getPendingScreeningHandler
);

router.get(
  '/:id/consolidated',
  requireRole('ScreeningOfficer'),
  getConsolidatedHandler
);

router.post(
  '/:id/decision',
  requireRole('ScreeningOfficer'),
  validateScreeningDecision,
  submitScreeningDecisionHandler
);

// ─── CSR Partner Routes ─────────────────────────────────────────────────────

router.get(
  '/csr/pending',
  requireRole('CSRPartner'),
  getPendingCSRHandler
);

router.post(
  '/csr/:id/decision',
  requireRole('CSRPartner'),
  validateCsrDecision,
  submitCSRDecisionHandler
);

export default router;

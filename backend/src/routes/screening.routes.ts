import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  getPendingScreeningHandler,
  submitScreeningDecisionHandler,
  getPendingCSRHandler,
  submitCSRDecisionHandler,
} from '../controllers/screening.controller';
import {
  validateScreeningDecision,
  validateCsrDecision,
} from '../validators/screening.validator';

const router = Router();

router.use(authenticate);

// ─── Screening Officer Routes ───────────────────────────────────────────────

router.get(
  '/pending',
  requireRole('ScreeningOfficer'),
  getPendingScreeningHandler
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

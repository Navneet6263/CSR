import { Router } from 'express';
import { authenticate, requireFinanceFunction, requireRole } from '../middleware/auth';
import {
  getPendingInitiation,
  getFinanceOverview,
  initiatePayment,
  getPendingVerifications,
  verifyPayment,
  getPaymentHistory, getFinanceAudit
} from '../controllers/finance.controller';
import {
  validateInitiatePayment,
  validateVerifyPayment
} from '../validators/finance.validator';

const router = Router();

// All finance routes require Finance role
router.use(authenticate, requireRole('Finance'));

router.get('/overview', getFinanceOverview);
router.get('/initiation/pending', requireFinanceFunction('Maker'), getPendingInitiation);
router.post('/initiation', requireFinanceFunction('Maker'), validateInitiatePayment, initiatePayment);

router.get('/verification/pending', requireFinanceFunction('Checker'), getPendingVerifications);
router.post('/verification/:id', requireFinanceFunction('Checker'), validateVerifyPayment, verifyPayment);
router.get('/history/:status', getPaymentHistory);
router.get('/audit', getFinanceAudit);

export default router;

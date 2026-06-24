import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  getPendingInitiation,
  initiatePayment,
  getPendingVerifications,
  verifyPayment
} from '../controllers/finance.controller';
import {
  validateInitiatePayment,
  validateVerifyPayment
} from '../validators/finance.validator';

const router = Router();

// All finance routes require Finance role
router.use(authenticate, requireRole('Finance'));

router.get('/initiation/pending', getPendingInitiation);
router.post('/initiation', validateInitiatePayment, initiatePayment);

router.get('/verification/pending', getPendingVerifications);
router.post('/verification/:id', validateVerifyPayment, verifyPayment);

export default router;

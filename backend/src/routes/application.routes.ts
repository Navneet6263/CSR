import { Router } from 'express';
import {
  create, submit, getById, getMyApplications, getAll,
} from '../controllers/application.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// ─── Student Endpoints ──────────────────────────────────────────────────────
router.post('/', authenticate, requireRole('Student'), create);
router.post('/:id/submit', authenticate, requireRole('Student'), submit);
router.get('/my', authenticate, requireRole('Student'), getMyApplications);

// ─── Shared / Admin Endpoints ───────────────────────────────────────────────
router.get('/:id', authenticate, getById);
router.get('/', authenticate, requireRole('Admin'), getAll);

export default router;

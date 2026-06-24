import { Router } from 'express';
import {
  create, getAll, getById, update,
  addRule, getRules, deleteRule,
} from '../controllers/scholarship.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// ─── Scholarship CRUD ───────────────────────────────────────────────────────
router.post('/', authenticate, requireRole('Admin'), create);
router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getById);
router.put('/:id', authenticate, requireRole('Admin'), update);

// ─── Eligibility Rules (nested under scholarship) ──────────────────────────
router.post('/:id/rules', authenticate, requireRole('Admin'), addRule);
router.get('/:id/rules', authenticate, getRules);
router.delete('/:id/rules/:ruleId', authenticate, requireRole('Admin'), deleteRule);

export default router;

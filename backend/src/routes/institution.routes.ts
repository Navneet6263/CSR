import { Router } from 'express';
import { getAll, getById } from '../controllers/institution.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/v1/institutions       — list all institutions
router.get('/', authenticate, getAll);

// GET /api/v1/institutions/:id   — get single institution
router.get('/:id', authenticate, getById);

export default router;

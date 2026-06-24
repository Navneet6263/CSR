import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/student.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// GET  /api/v1/students/me  — get current student's profile
router.get('/me', authenticate, requireRole('Student'), getProfile);

// PUT  /api/v1/students/me  — update current student's profile
router.put('/me', authenticate, requireRole('Student'), updateProfile);

export default router;

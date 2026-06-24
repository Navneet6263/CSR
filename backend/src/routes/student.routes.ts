import { Router } from 'express';
import { getProfile, updateProfile, uploadDocument, getDocuments } from '../controllers/student.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// GET  /api/v1/students/me  — get current student's profile
router.get('/me', authenticate, requireRole('Student'), getProfile);

// PUT  /api/v1/students/me  — update current student's profile
router.put('/me', authenticate, requireRole('Student'), updateProfile);

// POST /api/v1/students/me/documents
router.post('/me/documents', authenticate, requireRole('Student'), upload.single('file'), uploadDocument);

// GET  /api/v1/students/me/documents
router.get('/me/documents', authenticate, requireRole('Student'), getDocuments);

export default router;

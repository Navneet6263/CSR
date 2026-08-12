import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  downloadChecklistDocument, downloadStudentDocument,
} from '../controllers/document.controller';

const router = Router();
router.use(authenticate);
router.get('/student/:id/download', downloadStudentDocument);
router.get('/checklist/:id/download', downloadChecklistDocument);

export default router;

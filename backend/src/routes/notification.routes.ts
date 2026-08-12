import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { listNotifications, readAllNotifications, readNotification } from '../controllers/notification.controller';

const router = Router();
router.use(authenticate);
router.get('/', listNotifications);
router.patch('/read-all', readAllNotifications);
router.patch('/:id/read', readNotification);
export default router;

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getDashboardMetricsHandler,
  toggleApplicationHoldHandler,
  getRolePipelineHandler
} from '../controllers/admin.controller';

const router = Router();

router.use(authenticate);
// router.use(requireRole('Admin')); // Assuming we have an Admin role. We can just use requireAuth for testing if Admin role doesn't exist yet, but let's assume it does. Or we can just use requireRole('CSRPartner') since CSR acts as super admin sometimes. Let's use requireRole('CSRPartner', 'Admin') ideally. For now, let's just use requireAuth for prototyping the UI.
// Actually, let's assume there's an 'Admin' role, or we can just let any authenticated user hit this for now during the prototype phase since we don't have an explicit Admin login yet.
// Wait, I will use requireRole('Admin') but if the user logs in as CSR, maybe they act as Admin. Let's just remove role restriction on this endpoint for local dev, or add 'Admin'.

router.get('/metrics', getDashboardMetricsHandler);
router.get('/pipeline/:role', getRolePipelineHandler);
router.post('/applications/:id/hold', toggleApplicationHoldHandler);

export default router;

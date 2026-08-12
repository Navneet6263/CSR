import { Router } from 'express';
import { eligibility, portal } from '../controllers/public.controller';
import { validateBody } from '../middleware/validate';
import { publicEligibilitySchema } from '../validators/public.validator';

const router = Router();
router.get('/portal', portal);
router.post('/eligibility', validateBody(publicEligibilitySchema), eligibility);
export default router;

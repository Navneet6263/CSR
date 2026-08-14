import { Router } from 'express';
import {
  create, getAll, getById, pause, resume, update,
  addRule, getRules, updateRule, deleteRule,
  downloadContentSource, downloadSponsorLogo, generateContent, getContent, publishContent,
  saveContent, uploadSponsorLogo,
} from '../controllers/scholarship.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { scholarshipSourceUpload, sponsorLogoUpload } from '../middleware/upload';

const router = Router();

// ─── Scholarship CRUD ───────────────────────────────────────────────────────
router.post('/', authenticate, requireRole('Admin'), create);
router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getById);
router.put('/:id', authenticate, requireRole('Admin'), update);
router.post('/:id/pause', authenticate, requireRole('Admin'), pause);
router.post('/:id/resume', authenticate, requireRole('Admin'), resume);

// Structured content is drafted/generated first, then explicitly reviewed and published.
router.get('/:id/content', authenticate, requireRole('Admin'), getContent);
router.post('/:id/content/generate', authenticate, requireRole('Admin'), scholarshipSourceUpload.single('source'), generateContent);
router.put('/:id/content', authenticate, requireRole('Admin'), saveContent);
router.post('/:id/content/publish', authenticate, requireRole('Admin'), publishContent);
router.get('/:id/content/source', authenticate, requireRole('Admin'), downloadContentSource);
router.post('/:id/logo', authenticate, requireRole('Admin'), sponsorLogoUpload.single('logo'), uploadSponsorLogo);
router.get('/:id/logo', authenticate, downloadSponsorLogo);

// ─── Eligibility Rules (nested under scholarship) ──────────────────────────
router.post('/:id/rules', authenticate, requireRole('Admin'), addRule);
router.get('/:id/rules', authenticate, getRules);
router.put('/:id/rules/:ruleId', authenticate, requireRole('Admin'), updateRule);
router.delete('/:id/rules/:ruleId', authenticate, requireRole('Admin'), deleteRule);

export default router;

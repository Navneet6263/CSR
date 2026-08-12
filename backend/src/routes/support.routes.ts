import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import * as controller from '../controllers/support.controller';
import { activityEventSchema, createSupportTicketSchema, supportEventSchema,
  updateSupportTicketSchema } from '../validators/support.validator';

const router = Router();
router.use(authenticate);

router.post('/activity', requireRole('Student'), validateBody(activityEventSchema), controller.recordActivity);
router.post('/tickets', requireRole('Student'), validateBody(createSupportTicketSchema), controller.createTicket);

router.use(requireRole('SupportAgent'));
router.get('/overview', controller.overview);
router.get('/students', controller.students);
router.get('/students/:id', controller.student);
router.get('/activity', controller.activity);
router.get('/tickets', controller.listTickets);
router.get('/tickets/:id', controller.ticket);
router.patch('/tickets/:id', validateBody(updateSupportTicketSchema), controller.updateTicket);
router.post('/tickets/:id/events', validateBody(supportEventSchema), controller.addTicketEvent);

export default router;

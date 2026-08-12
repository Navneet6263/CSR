import { z } from 'zod/v4';

const safeCode = z.string().trim().min(1).max(80).regex(/^[a-zA-Z0-9._/-]+$/);

export const createSupportTicketSchema = z.object({
  subject: z.string().trim().min(5).max(200),
  message: z.string().trim().min(10).max(4000),
  category: z.enum(['Account', 'Profile', 'Application', 'Document', 'Payment', 'Technical', 'Other']),
  priority: z.enum(['Low', 'Normal', 'High', 'Urgent']).default('Normal'),
});

export const updateSupportTicketSchema = z.object({
  status: z.enum(['Open', 'InProgress', 'WaitingOnUser', 'Resolved']).optional(),
  priority: z.enum(['Low', 'Normal', 'High', 'Urgent']).optional(),
  assignToMe: z.boolean().optional(),
  resolutionCode: z.string().trim().min(3).max(50).optional(),
  version: z.number().int().nonnegative(),
}).refine((value) => value.status || value.priority || value.assignToMe, 'At least one update is required.');

export const supportEventSchema = z.object({
  type: z.enum(['InternalNote', 'Reply', 'Contact']),
  message: z.string().trim().min(3).max(4000),
  channel: z.enum(['InApp', 'Email', 'Phone', 'WhatsApp']).optional(),
  outcome: z.enum(['Reached', 'NoAnswer', 'MessageSent', 'CallbackRequested']).optional(),
  followUpAt: z.string().datetime().optional(),
}).superRefine((value, context) => {
  if (value.type === 'Contact' && (!value.channel || !value.outcome)) {
    context.addIssue({ code: 'custom', path: ['channel'], message: 'Contact channel and outcome are required.' });
  }
});

export const activityEventSchema = z.object({
  pageCode: safeCode,
  stepCode: safeCode.optional(),
  eventType: z.enum(['PageView', 'ValidationError', 'UploadError', 'HelpRequested']),
  errorCode: safeCode.optional(),
});

export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>;
export type UpdateSupportTicketInput = z.infer<typeof updateSupportTicketSchema>;
export type SupportEventInput = z.infer<typeof supportEventSchema>;
export type ActivityEventInput = z.infer<typeof activityEventSchema>;

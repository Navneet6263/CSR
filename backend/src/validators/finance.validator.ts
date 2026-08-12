import { z } from 'zod/v4';
import { validateBody } from '../middleware/validate';

export const initiatePaymentSchema = z.object({
  appId: z.coerce.number().int().positive('Application ID is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  paymentType: z.enum(['Direct', 'Institution']),
  referenceNo: z.string().trim().regex(/^[A-Z0-9]{22}$/, 'Reference must be 22 alphanumeric characters'),
  makerNotes: z.string().trim().max(1000).optional(),
});

export const verifyPaymentSchema = z.object({
  status: z.enum(['Completed', 'Failed']),
  referenceNo: z.string().trim().max(100).optional(),
  checkerNotes: z.string().trim().max(1000).optional(),
}).superRefine((data, context) => {
  if (data.status === 'Completed' && !data.referenceNo) {
    context.addIssue({ code: 'custom', path: ['referenceNo'], message: 'Reference number is required' });
  }
  if (data.status === 'Failed' && !data.checkerNotes) {
    context.addIssue({ code: 'custom', path: ['checkerNotes'], message: 'Failure reason is required' });
  }
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

export const validateInitiatePayment = validateBody(initiatePaymentSchema);
export const validateVerifyPayment = validateBody(verifyPaymentSchema);

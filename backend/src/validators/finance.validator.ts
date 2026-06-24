import { z } from 'zod/v4';
import { validate } from './auth.validator';

export const initiatePaymentSchema = z.object({
  appId: z.number().int().positive('Application ID is required'),
  amount: z.number().positive('Amount must be positive'),
  paymentType: z.string().min(1, 'Payment Type is required'),
  makerNotes: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  status: z.enum(['Completed', 'Failed']),
  referenceNo: z.string().min(1, 'Reference Number is required'),
  checkerNotes: z.string().optional(),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

export const validateInitiatePayment = validate(initiatePaymentSchema);
export const validateVerifyPayment = validate(verifyPaymentSchema);

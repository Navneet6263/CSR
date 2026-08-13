import { z } from 'zod/v4';

export const strongPassword = z.string()
  .min(10, 'Password must be at least 10 characters')
  .max(100)
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain a special character');

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  email: z.email('Invalid email address').transform((value) => value.trim().toLowerCase()),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number').optional(),
  password: strongPassword,
  role: z.literal('Student').default('Student'),
  termsAccepted: z.boolean().refine((accepted) => accepted, 'User Agreement & Privacy Policy must be accepted'),
});

export const loginSchema = z.object({
  email: z.email('Invalid email address').transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, 'Password is required').max(100),
});

export const verifyLoginOtpSchema = z.object({
  challengeId: z.uuid(), code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit OTP'),
});
export const resendLoginOtpSchema = z.object({ challengeId: z.uuid() });

export const forgotPasswordSchema = z.object({
  email: z.email('Invalid email address').transform((value) => value.trim().toLowerCase()),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(200), newPassword: strongPassword,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(100), newPassword: strongPassword,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

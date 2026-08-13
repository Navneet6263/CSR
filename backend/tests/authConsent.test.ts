import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { registerSchema, verifyLoginOtpSchema } from '../src/validators/auth.validator';

const validRegistration = {
  fullName: 'Consent Test',
  email: 'consent@example.org',
  phone: '+919876543210',
  password: 'StrongPass@123',
  role: 'Student' as const,
};

test('registration rejects missing or false terms acceptance', () => {
  assert.equal(registerSchema.safeParse(validRegistration).success, false);
  assert.equal(registerSchema.safeParse({ ...validRegistration, termsAccepted: false }).success, false);
});

test('registration accepts explicit terms consent', () => {
  const result = registerSchema.safeParse({ ...validRegistration, termsAccepted: true });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.termsAccepted, true);
});

test('staff OTP validation requires a UUID challenge and exactly six digits', () => {
  assert.equal(verifyLoginOtpSchema.safeParse({ challengeId: 'not-a-uuid', code: '123456' }).success, false);
  assert.equal(verifyLoginOtpSchema.safeParse({ challengeId: crypto.randomUUID(), code: '12345' }).success, false);
  assert.equal(verifyLoginOtpSchema.safeParse({ challengeId: crypto.randomUUID(), code: '123456' }).success, true);
});

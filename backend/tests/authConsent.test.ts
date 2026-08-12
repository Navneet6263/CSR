import test from 'node:test';
import assert from 'node:assert/strict';
import { registerSchema } from '../src/validators/auth.validator';

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

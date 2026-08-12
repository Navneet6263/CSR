import assert from 'node:assert/strict';
import test from 'node:test';
import { activityEventSchema, createSupportTicketSchema, supportEventSchema,
  updateSupportTicketSchema } from '../src/validators/support.validator';

test('student support ticket requires useful context and a safe category', () => {
  const valid = createSupportTicketSchema.safeParse({ subject: 'Document upload failed',
    message: 'The income certificate upload fails after I select the PDF.', category: 'Document' });
  const invalid = createSupportTicketSchema.safeParse({ subject: 'Help', message: 'failed', category: 'Secret' });
  assert.equal(valid.success, true); assert.equal(invalid.success, false);
});

test('support ticket updates require optimistic version and a real change', () => {
  assert.equal(updateSupportTicketSchema.safeParse({ status: 'InProgress', version: 3 }).success, true);
  assert.equal(updateSupportTicketSchema.safeParse({ version: 3 }).success, false);
  assert.equal(updateSupportTicketSchema.safeParse({ status: 'InProgress', version: -1 }).success, false);
});

test('contact log requires channel and outcome', () => {
  const base = { type: 'Contact', message: 'Student requested a callback tomorrow.' };
  assert.equal(supportEventSchema.safeParse({ ...base, channel: 'Phone', outcome: 'Reached' }).success, true);
  assert.equal(supportEventSchema.safeParse(base).success, false);
});

test('activity telemetry accepts codes but rejects free-form personal data', () => {
  assert.equal(activityEventSchema.safeParse({ pageCode: '/student/profile', stepCode: 'documents',
    eventType: 'UploadError', errorCode: 'file-too-large' }).success, true);
  assert.equal(activityEventSchema.safeParse({ pageCode: 'Aadhaar is 1234 5678', eventType: 'PageView' }).success, false);
});

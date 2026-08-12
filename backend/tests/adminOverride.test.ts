import assert from 'node:assert/strict';
import test from 'node:test';
import { emergencyApprovalTarget } from '../src/services/adminOverride.service';
import { emergencyApprovalSchema } from '../src/validators/admin.validator';

test('admin emergency approval advances one workflow stage only', () => {
  assert.equal(emergencyApprovalTarget('DocAuditInProgress'), 'DocAuditComplete');
  assert.equal(emergencyApprovalTarget('BGCheckInProgress'), 'BGCheckComplete');
  assert.equal(emergencyApprovalTarget('ScreeningPending'), 'ScreeningApproved');
  assert.equal(emergencyApprovalTarget('CSRPending'), 'CSRApproved');
});

test('admin emergency approval cannot bypass rejection or finance controls', () => {
  assert.equal(emergencyApprovalTarget('ScreeningRejected'), null);
  assert.equal(emergencyApprovalTarget('CSRDeclined'), null);
  assert.equal(emergencyApprovalTarget('PaymentPending'), null);
  assert.equal(emergencyApprovalTarget('PaymentInitiated'), null);
});

test('admin emergency approval requires detailed reason and typed confirmation', () => {
  assert.equal(emergencyApprovalSchema.safeParse({ reason: 'Too short', confirmation: 'APP-12', expectedStatus: 'ScreeningPending' }).success, false);
  assert.equal(emergencyApprovalSchema.safeParse({
    reason: 'Urgent approval supported by reviewed evidence.', confirmation: '12', expectedStatus: 'ScreeningPending',
  }).success, false);
  assert.equal(emergencyApprovalSchema.safeParse({
    reason: 'Urgent approval supported by reviewed evidence.', confirmation: 'APP-12', expectedStatus: 'ScreeningPending',
  }).success, true);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { ALLOWED_TRANSITIONS, canRoleTransition } from '../src/domain/applicationStatus';

test('terminal payment state has no outgoing transition', () => {
  assert.deepEqual(ALLOWED_TRANSITIONS.PaymentCompleted, []);
});

test('workflow roles cannot approve another stage', () => {
  assert.equal(canRoleTransition('DocReviewer', 'DocAuditComplete'), true);
  assert.equal(canRoleTransition('DocReviewer', 'CSRApproved'), false);
  assert.equal(canRoleTransition('Finance', 'PaymentCompleted'), true);
  assert.equal(canRoleTransition('CSRPartner', 'PaymentCompleted'), false);
});

test('administrator transitions are explicit override authority', () => {
  assert.equal(canRoleTransition('Admin', 'CSRDeclined'), true);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { screeningDecisionSchema } from '../src/validators/screening.validator';

test('screening approval requires an audit-ready rationale', () => {
  assert.equal(screeningDecisionSchema.safeParse({ decision: 'Approve' }).success, false);
  assert.equal(screeningDecisionSchema.safeParse({ decision: 'Approve', notes: 'ok' }).success, false);
  assert.equal(screeningDecisionSchema.safeParse({ decision: 'Approve', notes: 'All policy evidence verified.' }).success, true);
});

test('screening rejection requires a clear rationale', () => {
  assert.equal(screeningDecisionSchema.safeParse({ decision: 'Reject', notes: '' }).success, false);
  assert.equal(screeningDecisionSchema.safeParse({ decision: 'Reject', notes: 'Income evidence conflicts with policy.' }).success, false);
  assert.equal(screeningDecisionSchema.safeParse({ decision: 'Reject', notes: 'Income evidence conflicts with policy.',
    returnTo: 'CloseApplication' }).success, true);
});

test('screening internal return requires a target and affected evidence', () => {
  assert.equal(screeningDecisionSchema.safeParse({ decision: 'Reject', notes: 'Document was incorrectly verified.',
    returnTo: 'DocumentReviewer' }).success, false);
  assert.equal(screeningDecisionSchema.safeParse({ decision: 'Reject', notes: 'Document was incorrectly verified.',
    returnTo: 'DocumentReviewer', affectedItems: ['12'] }).success, true);
  assert.equal(screeningDecisionSchema.safeParse({ decision: 'Reject', notes: 'Address check needs another visit.',
    returnTo: 'BGCheckOfficer', affectedItems: ['Address'] }).success, true);
});

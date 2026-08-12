import assert from 'node:assert/strict';
import test from 'node:test';
import type { NextFunction, Request, Response } from 'express';
import { createStaffSchema } from '../src/validators/adminUsers.validator';
import { requireFinanceFunction } from '../src/middleware/auth';

const base = { fullName: 'Finance Checker', email: 'checker@example.com' };

test('administrator can provision a Finance account', () => {
  assert.equal(createStaffSchema.safeParse({ ...base, role: 'Finance', financeFunction: 'Checker' }).success, true);
  assert.equal(createStaffSchema.safeParse({ ...base, role: 'Finance' }).success, false);
});

test('CSR account can be bound to an existing sponsor id', () => {
  assert.equal(createStaffSchema.safeParse({ ...base, role: 'CSRPartner', sponsorId: 4 }).success, true);
});

test('CSR account cannot be created without a sponsor tenant', () => {
  assert.equal(createStaffSchema.safeParse({ ...base, role: 'CSRPartner' }).success, false);
});

test('new CSR sponsor requires company and positive fund envelope', () => {
  const valid = createStaffSchema.safeParse({
    ...base, role: 'CSRPartner', organization: 'Acme Foundation', fundCap: 500_000,
  });
  const invalid = createStaffSchema.safeParse({
    ...base, role: 'CSRPartner', organization: 'Acme Foundation', fundCap: 0,
  });
  assert.equal(valid.success, true);
  assert.equal(invalid.success, false);
});

test('administrator can provision a least-privilege Support Agent account', () => {
  assert.equal(createStaffSchema.safeParse({ ...base, role: 'SupportAgent' }).success, true);
});

function financeAccess(current: 'Maker' | 'Checker', required: 'Maker' | 'Checker') {
  let outcome: unknown = 'not-called';
  const request = { user: { userId: 1, role: 'Finance', sponsorId: null,
    financeFunction: current, sessionId: 'test' } } as Request;
  const next = ((error?: unknown) => { outcome = error ?? null; }) as NextFunction;
  requireFinanceFunction(required)(request, {} as Response, next);
  return outcome;
}

test('Finance Maker and Checker endpoints are mutually exclusive', () => {
  assert.equal(financeAccess('Maker', 'Maker'), null);
  assert.equal((financeAccess('Maker', 'Checker') as { statusCode: number }).statusCode, 403);
  assert.equal(financeAccess('Checker', 'Checker'), null);
  assert.equal((financeAccess('Checker', 'Maker') as { statusCode: number }).statusCode, 403);
});

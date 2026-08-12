import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateEligibility, type EligibilityRuleRecord } from '../src/services/eligibilityEvaluator.service';
import type { IStudent } from '../src/types';

const student = { AnnualFamilyIncome: 250_000, PreviousYearMarks: 82, State: 'Maharashtra',
  Category: 'OBC', Course: 'B.Tech', DOB: '2006-05-10' } as unknown as IStudent;
const rule = (patch: Partial<EligibilityRuleRecord>): EligibilityRuleRecord => ({ RuleID: 1,
  RuleType: 'Income', Operator: 'LTE', ValueMin: '300000', ValueMax: null, ValueList: null,
  IsRequired: true, ...patch });

test('required numeric, range and list rules pass together', () => {
  const result = evaluateEligibility(student, [
    rule({}), rule({ RuleID: 2, RuleType: 'Marks', Operator: 'BETWEEN', ValueMin: '75', ValueMax: '90' }),
    rule({ RuleID: 3, RuleType: 'State', Operator: 'IN', ValueMin: null, ValueList: 'Maharashtra,Karnataka' }),
  ]);
  assert.equal(result.isEligible, true); assert.equal(result.results.every((item) => item.passed), true);
});

test('failed required rule rejects and optional rule does not', () => {
  const required = evaluateEligibility(student, [rule({ ValueMin: '200000' })]);
  const optional = evaluateEligibility(student, [rule({ ValueMin: '200000', IsRequired: false })]);
  assert.equal(required.isEligible, false); assert.equal(optional.isEligible, true);
});

test('unsupported rule types fail closed', () => {
  const result = evaluateEligibility(student, [rule({ RuleType: 'Unknown' })]);
  assert.equal(result.isEligible, false); assert.match(result.results[0].reason, /Unsupported/);
});

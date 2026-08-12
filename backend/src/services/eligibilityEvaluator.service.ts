import crypto from 'crypto';
import { IStudent } from '../types';

export interface EligibilityRuleRecord {
  RuleID: number;
  RuleType: string;
  Operator: string;
  ValueMin: string | null;
  ValueMax: string | null;
  ValueList: string | null;
  IsRequired: boolean;
  RuleVersion?: number;
}

export interface RuleEvaluation {
  ruleId: number;
  ruleType: string;
  required: boolean;
  passed: boolean;
  reason: string;
}

function listValue(rule: EligibilityRuleRecord): string[] {
  if (!rule.ValueList) return [];
  try {
    const parsed = JSON.parse(rule.ValueList);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    return rule.ValueList.split(',').map((value) => value.trim()).filter(Boolean);
  }
  return [];
}

function compareNumber(value: unknown, rule: EligibilityRuleRecord): boolean {
  const actual = Number(value);
  const min = Number(rule.ValueMin);
  const max = Number(rule.ValueMax);
  if (!Number.isFinite(actual)) return false;
  if (rule.Operator === 'LT') return actual < min;
  if (rule.Operator === 'LTE') return actual <= min;
  if (rule.Operator === 'GT') return actual > min;
  if (rule.Operator === 'GTE') return actual >= min;
  if (rule.Operator === 'EQ') return actual === min;
  if (rule.Operator === 'NEQ') return actual !== min;
  if (rule.Operator === 'BETWEEN') return actual >= min && actual <= max;
  return false;
}

function compareText(value: unknown, rule: EligibilityRuleRecord): boolean {
  if (value === null || value === undefined || value === '') return false;
  const actual = String(value).trim().toLocaleLowerCase('en-IN');
  if (rule.Operator === 'IN') {
    return listValue(rule).some((item) => item.trim().toLocaleLowerCase('en-IN') === actual);
  }
  if (rule.Operator === 'NOT_IN') {
    return !listValue(rule).some((item) => item.trim().toLocaleLowerCase('en-IN') === actual);
  }
  const expected = String(rule.ValueMin ?? '').trim().toLocaleLowerCase('en-IN');
  if (rule.Operator === 'EQ') return actual === expected;
  return rule.Operator === 'NEQ' && actual !== expected;
}

function ageOn(dob: Date | string | undefined, at: Date): number | undefined {
  if (!dob) return undefined;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime()) || birth > at) return undefined;
  let age = at.getUTCFullYear() - birth.getUTCFullYear();
  const month = at.getUTCMonth() - birth.getUTCMonth();
  if (month < 0 || (month === 0 && at.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age;
}

function evaluate(student: IStudent, rule: EligibilityRuleRecord, at: Date): boolean | undefined {
  switch (rule.RuleType) {
    case 'Income':
    case 'MaxAnnualIncome': return compareNumber(student.AnnualFamilyIncome, rule);
    case 'Age':
    case 'MinAge':
    case 'MaxAge': return compareNumber(ageOn(student.DOB, at), rule);
    case 'Gender': return compareText(student.Gender, rule);
    case 'Category': return compareText(student.Category, rule);
    case 'State': return compareText(student.State, rule);
    case 'Course': return compareText(student.Course, rule);
    case 'Institution': return compareNumber(student.InstitutionID, rule);
    case 'Enrollment': return compareNumber(student.EnrollmentYear, rule);
    case 'FamilySize': return compareNumber(student.FamilySize, rule);
    case 'Marks': return compareNumber(student.PreviousYearMarks, rule);
    default: return undefined;
  }
}

export function evaluateEligibility(
  student: IStudent,
  rules: EligibilityRuleRecord[],
  at = new Date(),
) {
  const results: RuleEvaluation[] = rules.map((rule) => {
    const outcome = evaluate(student, rule, at);
    const passed = outcome === true || (outcome === false && !rule.IsRequired);
    const reason = outcome === undefined
      ? `Unsupported rule type: ${rule.RuleType}`
      : outcome ? 'Criteria met' : 'Criteria not met';
    return {
      ruleId: rule.RuleID,
      ruleType: rule.RuleType,
      required: Boolean(rule.IsRequired),
      passed: outcome === undefined ? false : passed,
      reason,
    };
  });
  const isEligible = results.every((result) => result.passed);
  return { isEligible, results };
}

export function profileFingerprint(student: IStudent): string {
  const fields = {
    dob: student.DOB, gender: student.Gender, category: student.Category,
    state: student.State, income: student.AnnualFamilyIncome, familySize: student.FamilySize,
    course: student.Course, institution: student.InstitutionID, enrollment: student.EnrollmentYear,
    marks: student.PreviousYearMarks,
  };
  return crypto.createHash('sha256').update(JSON.stringify(fields)).digest('hex');
}

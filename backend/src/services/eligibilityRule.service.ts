import db from '../config/database';
import { NotFoundError } from '../utils/errors';
import {
  EligibilityRuleInput,
  UpdateEligibilityRuleInput,
} from '../validators/scholarship.validator';

// ─── Add Eligibility Rule ───────────────────────────────────────────────────

export async function addEligibilityRule(data: EligibilityRuleInput) {
  // Verify scholarship exists
  const scholarship = await db('Scholarships')
    .where({ ScholarshipID: data.scholarshipId })
    .first();

  if (!scholarship) {
    throw new NotFoundError('Scholarship not found.');
  }

  const [inserted] = await db('EligibilityRules')
    .insert({
      ScholarshipID: data.scholarshipId,
      RuleType: data.ruleType,
      Operator: data.operator,
      ValueMin: data.valueMin || null,
      ValueMax: data.valueMax || null,
      ValueList: data.valueList || null,
      IsRequired: data.isRequired,
    })
    .returning('*');

  return inserted;
}

// ─── Get Eligibility Rules for Scholarship ──────────────────────────────────

export async function getEligibilityRules(scholarshipId: number) {
  return db('EligibilityRules')
    .where({ ScholarshipID: scholarshipId })
    .orderBy('RuleID');
}

// ─── Update Eligibility Rule ────────────────────────────────────────────────

export async function updateEligibilityRule(
  ruleId: number,
  data: UpdateEligibilityRuleInput
) {
  const existing = await db('EligibilityRules').where({ RuleID: ruleId }).first();
  if (!existing) {
    throw new NotFoundError('Eligibility rule not found.');
  }

  const payload: Record<string, unknown> = {};
  if (data.ruleType !== undefined) payload.RuleType = data.ruleType;
  if (data.operator !== undefined) payload.Operator = data.operator;
  if (data.valueMin !== undefined) payload.ValueMin = data.valueMin;
  if (data.valueMax !== undefined) payload.ValueMax = data.valueMax;
  if (data.valueList !== undefined) payload.ValueList = data.valueList;
  if (data.isRequired !== undefined) payload.IsRequired = data.isRequired;

  if (Object.keys(payload).length > 0) {
    await db('EligibilityRules').where({ RuleID: ruleId }).update(payload);
  }

  return db('EligibilityRules').where({ RuleID: ruleId }).first();
}

// ─── Delete Eligibility Rule ────────────────────────────────────────────────

export async function deleteEligibilityRule(ruleId: number) {
  const existing = await db('EligibilityRules').where({ RuleID: ruleId }).first();
  if (!existing) {
    throw new NotFoundError('Eligibility rule not found.');
  }

  await db('EligibilityRules').where({ RuleID: ruleId }).del();
}

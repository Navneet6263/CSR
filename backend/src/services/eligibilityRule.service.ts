import db from '../config/database';
import { ConflictError, NotFoundError } from '../utils/errors';
import { EligibilityRuleInput, UpdateEligibilityRuleInput } from '../validators/scholarship.validator';
import { writeAudit } from './audit.service';
import { WorkflowActor } from './workflow.service';

async function assertRulesMutable(scholarshipId: number) {
  const scholarship = await db('Scholarships').where({ ScholarshipID: scholarshipId }).first();
  if (!scholarship) throw new NotFoundError('Scholarship not found.');
  const submitted = await db('Applications').where({ ScholarshipID: scholarshipId }).whereNot('Status', 'Draft').first();
  if (submitted) throw new ConflictError('Eligibility rules are frozen after the first submitted application.');
}

export async function addEligibilityRule(data: EligibilityRuleInput, actor: WorkflowActor) {
  await assertRulesMutable(data.scholarshipId);
  return db.transaction(async (trx) => {
    const values = { ScholarshipID: data.scholarshipId, RuleType: data.ruleType, Operator: data.operator,
      ValueMin: data.valueMin || null, ValueMax: data.valueMax || null, ValueList: data.valueList || null,
      IsRequired: data.isRequired, RuleVersion: 1 };
    const inserted = await trx('EligibilityRules').insert(values).returning('*');
    const rule = inserted[0];
    await trx('ScholarshipContents').where({ ScholarshipID: data.scholarshipId })
      .update({ ReviewStatus: 'Review', UpdatedAt: new Date() });
    await writeAudit(trx, { userId: actor.userId, action: 'ELIGIBILITY_RULE_CREATED',
      entityType: 'EligibilityRule', entityId: rule.RuleID, newValue: values,
      requestId: actor.requestId, ipAddress: actor.ipAddress });
    return rule;
  });
}

export async function getEligibilityRules(scholarshipId: number) {
  return db('EligibilityRules').where({ ScholarshipID: scholarshipId }).orderBy('RuleID');
}

export async function updateEligibilityRule(ruleId: number, data: UpdateEligibilityRuleInput, actor: WorkflowActor) {
  const existing = await db('EligibilityRules').where({ RuleID: ruleId }).first();
  if (!existing) throw new NotFoundError('Eligibility rule not found.');
  await assertRulesMutable(existing.ScholarshipID);
  const map: Record<string, string> = { ruleType: 'RuleType', operator: 'Operator', valueMin: 'ValueMin',
    valueMax: 'ValueMax', valueList: 'ValueList', isRequired: 'IsRequired' };
  const payload: Record<string, unknown> = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [map[key], value]),
  );
  if (data.operator && ['IN', 'NOT_IN'].includes(data.operator)) {
    payload.ValueMin = null; payload.ValueMax = null;
  } else if (data.operator === 'BETWEEN') {
    payload.ValueList = null;
  } else if (data.operator) {
    payload.ValueList = null; payload.ValueMax = null;
  }
  payload.RuleVersion = Number(existing.RuleVersion ?? 0) + 1;
  await db.transaction(async (trx) => {
    await trx('EligibilityRules').where({ RuleID: ruleId }).update(payload);
    await trx('ScholarshipContents').where({ ScholarshipID: existing.ScholarshipID })
      .update({ ReviewStatus: 'Review', UpdatedAt: new Date() });
    await writeAudit(trx, { userId: actor.userId, action: 'ELIGIBILITY_RULE_UPDATED',
      entityType: 'EligibilityRule', entityId: ruleId, oldValue: existing, newValue: payload,
      requestId: actor.requestId, ipAddress: actor.ipAddress });
  });
  return db('EligibilityRules').where({ RuleID: ruleId }).first();
}

export async function deleteEligibilityRule(ruleId: number, actor: WorkflowActor) {
  const existing = await db('EligibilityRules').where({ RuleID: ruleId }).first();
  if (!existing) throw new NotFoundError('Eligibility rule not found.');
  await assertRulesMutable(existing.ScholarshipID);
  await db.transaction(async (trx) => {
    await trx('EligibilityRules').where({ RuleID: ruleId }).del();
    await trx('ScholarshipContents').where({ ScholarshipID: existing.ScholarshipID })
      .update({ ReviewStatus: 'Review', UpdatedAt: new Date() });
    await writeAudit(trx, { userId: actor.userId, action: 'ELIGIBILITY_RULE_DELETED',
      entityType: 'EligibilityRule', entityId: ruleId, oldValue: existing,
      requestId: actor.requestId, ipAddress: actor.ipAddress });
  });
}

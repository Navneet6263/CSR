import db from '../config/database';
import { IStudent } from '../types';
import { EligibilityRuleRecord, evaluateEligibility } from './eligibilityEvaluator.service';
import { resumeDueScholarships } from './scholarship.service';

export async function matchStudentToScholarships(studentId: number, onlyScholarshipIds?: number[]) {
  await resumeDueScholarships();
  const student = await db<IStudent>('Students').where({ StudentID: studentId }).first();
  if (!student) return { matched: [], failed: [] };

  const now = new Date();
  const query = db('Scholarships')
    .where({ Status: 'Active' })
    .where('ApplicationOpenDate', '<=', now)
    .where('ApplicationCloseDate', '>=', now);
  if (onlyScholarshipIds) {
    if (!onlyScholarshipIds.length) return { matched: [], failed: [] };
    query.whereIn('ScholarshipID', onlyScholarshipIds);
  }
  const scholarships = await query.select('ScholarshipID', 'Name');
  if (!scholarships.length) return { matched: [], failed: [] };

  const scholarshipIds = scholarships.map((item) => item.ScholarshipID);
  const [rules, applications] = await Promise.all([
    db<EligibilityRuleRecord>('EligibilityRules').whereIn('ScholarshipID', scholarshipIds),
    db('Applications').select('ScholarshipID').where({ StudentID: studentId }).whereIn('ScholarshipID', scholarshipIds),
  ]);
  const applied = new Set(applications.map((item) => item.ScholarshipID));
  const rulesByScholarship = new Map<number, EligibilityRuleRecord[]>();
  for (const rule of rules as Array<EligibilityRuleRecord & { ScholarshipID: number }>) {
    const group = rulesByScholarship.get(rule.ScholarshipID) ?? [];
    group.push(rule);
    rulesByScholarship.set(rule.ScholarshipID, group);
  }

  const matched: Array<{ scholarshipId: number; name: string }> = [];
  const failed: Array<{ scholarshipId: number; name: string; reasons: string[] }> = [];
  for (const scholarship of scholarships) {
    if (applied.has(scholarship.ScholarshipID)) continue;
    const evaluation = evaluateEligibility(student, rulesByScholarship.get(scholarship.ScholarshipID) ?? [], now);
    if (evaluation.isEligible) {
      matched.push({ scholarshipId: scholarship.ScholarshipID, name: scholarship.Name });
    } else {
      failed.push({
        scholarshipId: scholarship.ScholarshipID,
        name: scholarship.Name,
        reasons: evaluation.results.filter((result) => !result.passed).map((result) => result.reason),
      });
    }
  }
  return { matched, failed };
}

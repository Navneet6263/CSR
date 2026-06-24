import db from '../config/database';
import { IStudent } from '../types';
import { getStudentByUserId } from './student.service';

// ─── Rule Evaluation Result ─────────────────────────────────────────────────

interface RuleResult {
  ruleType: string;
  passed: boolean;
  reason: string;
}

interface EligibilityRule {
  RuleID: number;
  ScholarshipID: number;
  RuleType: string;
  Operator: string;
  ValueMin: string | null;
  ValueMax: string | null;
  ValueList: string | null;
  IsRequired: boolean;
}

// ─── Evaluate a Single Rule ─────────────────────────────────────────────────

export function evaluateRule(student: IStudent, rule: EligibilityRule): RuleResult {
  const { RuleType, Operator, ValueMin, ValueMax, ValueList } = rule;

  switch (RuleType) {
    case 'Income': {
      const threshold = Number(ValueMin);
      if (Operator === 'LT') {
        const passed = student.AnnualFamilyIncome < threshold;
        return { ruleType: RuleType, passed, reason: passed ? 'Income within limit' : `Income ${student.AnnualFamilyIncome} exceeds max ${threshold}` };
      }
      if (Operator === 'GT') {
        const passed = student.AnnualFamilyIncome > threshold;
        return { ruleType: RuleType, passed, reason: passed ? 'Income above minimum' : `Income ${student.AnnualFamilyIncome} below min ${threshold}` };
      }
      return { ruleType: RuleType, passed: false, reason: `Unsupported operator "${Operator}" for Income` };
    }

    case 'Age': {
      const dob = new Date(student.DOB);
      const ageDiffMs = Date.now() - dob.getTime();
      const age = Math.floor(ageDiffMs / (365.25 * 24 * 60 * 60 * 1000));

      if (Operator === 'BETWEEN') {
        const min = Number(ValueMin);
        const max = Number(ValueMax);
        const passed = age >= min && age <= max;
        return { ruleType: RuleType, passed, reason: passed ? `Age ${age} within ${min}-${max}` : `Age ${age} outside range ${min}-${max}` };
      }
      if (Operator === 'LT') {
        const max = Number(ValueMin);
        const passed = age < max;
        return { ruleType: RuleType, passed, reason: passed ? `Age ${age} < ${max}` : `Age ${age} >= ${max}` };
      }
      if (Operator === 'GT') {
        const min = Number(ValueMin);
        const passed = age > min;
        return { ruleType: RuleType, passed, reason: passed ? `Age ${age} > ${min}` : `Age ${age} <= ${min}` };
      }
      return { ruleType: RuleType, passed: false, reason: `Unsupported operator "${Operator}" for Age` };
    }

    case 'Gender': {
      const passed = student.Gender === ValueMin;
      return { ruleType: RuleType, passed, reason: passed ? 'Gender matches' : `Gender "${student.Gender}" does not match "${ValueMin}"` };
    }

    case 'Category': {
      const list: string[] = ValueList ? JSON.parse(ValueList) : [];
      const passed = list.includes(student.Category);
      return { ruleType: RuleType, passed, reason: passed ? 'Category eligible' : `Category "${student.Category}" not in [${list.join(', ')}]` };
    }

    case 'State': {
      const passed = student.State === ValueMin;
      return { ruleType: RuleType, passed, reason: passed ? 'State matches' : `State "${student.State}" does not match "${ValueMin}"` };
    }

    case 'Course': {
      const list: string[] = ValueList ? JSON.parse(ValueList) : [];
      const passed = list.includes(student.Course);
      return { ruleType: RuleType, passed, reason: passed ? 'Course eligible' : `Course "${student.Course}" not in [${list.join(', ')}]` };
    }

    case 'FamilySize': {
      const threshold = Number(ValueMin);
      if (Operator === 'LT') {
        const passed = student.FamilySize < threshold;
        return { ruleType: RuleType, passed, reason: passed ? 'Family size within limit' : `Family size ${student.FamilySize} >= ${threshold}` };
      }
      if (Operator === 'GT') {
        const passed = student.FamilySize > threshold;
        return { ruleType: RuleType, passed, reason: passed ? 'Family size above minimum' : `Family size ${student.FamilySize} <= ${threshold}` };
      }
      return { ruleType: RuleType, passed: false, reason: `Unsupported operator "${Operator}" for FamilySize` };
    }

    default:
      return { ruleType: RuleType, passed: true, reason: `Rule type "${RuleType}" not evaluated — skipped` };
  }
}

// ─── Match Student to All Active Scholarships ───────────────────────────────

export async function matchStudentToScholarships(studentId: number) {
  const student = await db<IStudent>('Students').where({ StudentID: studentId }).first();
  if (!student) return { matched: [], failed: [] };

  const scholarships = await db('Scholarships').where({ Status: 'Active' });

  const matched: { scholarshipId: number; name: string }[] = [];
  const failed: { scholarshipId: number; name: string; reasons: string[] }[] = [];

  for (const scholarship of scholarships) {
    // Skip if student already has a non-cancelled application
    const existingApp = await db('Applications')
      .where({ StudentID: studentId, ScholarshipID: scholarship.ScholarshipID })
      .whereNot({ Status: 'Cancelled' })
      .first();

    if (existingApp) continue;

    const rules: EligibilityRule[] = await db('EligibilityRules')
      .where({ ScholarshipID: scholarship.ScholarshipID });

    if (rules.length === 0) continue;

    const results = rules.map((rule) => evaluateRule(student, rule));
    const requiredFails = results.filter((r) => !r.passed);

    if (requiredFails.length === 0) {
      // All rules passed — auto-create application
      const [appIdObj] = await db('Applications').insert({
        StudentID: studentId,
        ScholarshipID: scholarship.ScholarshipID,
        Status: 'AutoMatched',
        ScholarshipAmount: scholarship.PerStudentAmount,
        SponsorID: scholarship.SponsorID,
      }).returning('ApplicationID');
      
      const newAppId = typeof appIdObj === 'object' ? appIdObj.ApplicationID : appIdObj;

      // Initialize Document Checklist from StudentDocuments
      const studentDocs = await db('StudentDocuments').where({ StudentID: studentId });
      
      if (studentDocs.length > 0) {
        const checklistItems = studentDocs.map((doc) => ({
          ApplicationID: newAppId,
          DocumentType: doc.DocumentType,
          Status: 'Uploaded',
          FileURL: doc.FileURL,
        }));
        await db('DocumentChecklist').insert(checklistItems);
      }

      matched.push({ scholarshipId: scholarship.ScholarshipID, name: scholarship.Name });
    } else {
      failed.push({
        scholarshipId: scholarship.ScholarshipID,
        name: scholarship.Name,
        reasons: requiredFails.map((r) => r.reason),
      });
    }
  }

  return { matched, failed };
}

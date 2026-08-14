import db from '../config/database';
import { IStudent } from '../types';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';
import { WorkflowActor, lockApplication, transitionApplication } from './workflow.service';
import { evaluateEligibility, profileFingerprint } from './eligibilityEvaluator.service';
import { writeAudit } from './audit.service';
import { buildSubmissionSnapshot, initializeChecklist } from './applicationSubmission.service';
import { applicationStudentUserId, queueNotification } from './notification.service';
import { resumeDueScholarships } from './scholarship.service';

export async function createApplication(
  studentId: number,
  scholarshipId: number,
  actor: WorkflowActor,
) {
  await resumeDueScholarships();
  return db.transaction(async (trx) => {
    const rows = await trx.raw(
      'SELECT * FROM Scholarships WITH (UPDLOCK, ROWLOCK) WHERE ScholarshipID = ?',
      [scholarshipId],
    );
    const scholarship = Array.isArray(rows) ? rows[0] : undefined;
    const now = new Date();
    if (!scholarship || scholarship.Status !== 'Active') throw new NotFoundError('Scholarship is not active.');
    if (new Date(scholarship.ApplicationOpenDate) > now || new Date(scholarship.ApplicationCloseDate) < now) {
      throw new ValidationError('Scholarship application window is closed.');
    }

    const existing = await trx('Applications').where({ StudentID: studentId, ScholarshipID: scholarshipId }).first();
    if (existing) {
      if (existing.Status === 'Draft') return existing;
      throw new ConflictError('You already have an application for this scholarship.');
    }
    if (scholarship.MaxApplicants) {
      const count = await trx('Applications').where({ ScholarshipID: scholarshipId }).whereNot('Status', 'Cancelled')
        .count('* as count').first();
      if (Number(count?.count ?? 0) >= Number(scholarship.MaxApplicants)) {
        throw new ConflictError('Scholarship application capacity has been reached.');
      }
    }

    const student = await trx<IStudent>('Students').where({ StudentID: studentId }).first();
    if (!student) throw new NotFoundError('Student profile not found.');
    const rules = await trx('EligibilityRules').where({ ScholarshipID: scholarshipId });
    const evaluation = evaluateEligibility(student, rules);
    if (!evaluation.isEligible) {
      const reasons = evaluation.results.filter((item) => !item.passed).map((item) => item.ruleType);
      throw new ValidationError(`Eligibility criteria not met: ${reasons.join(', ')}.`);
    }

    const [application] = await trx('Applications').insert({
      StudentID: studentId,
      ScholarshipID: scholarshipId,
      Status: 'Draft',
      ScholarshipAmount: scholarship.PerStudentAmount,
      SponsorID: scholarship.SponsorID,
      StageEnteredAt: new Date(),
      UpdatedAt: new Date(),
      EligibilitySnapshot: JSON.stringify(evaluation),
    }).returning('*');
    await trx('EligibilityEvaluations').insert({
      StudentID: studentId,
      ScholarshipID: scholarshipId,
      ApplicationID: application.ApplicationID,
      IsEligible: true,
      ResultJSON: JSON.stringify(evaluation.results),
      ProfileFingerprint: profileFingerprint(student),
      RulesVersion: Math.max(1, ...rules.map((rule) => Number(rule.RuleVersion ?? 1))),
    });
    await writeAudit(trx, {
      userId: actor.userId, action: 'APPLICATION_CREATED', entityType: 'Application',
      entityId: application.ApplicationID, newValue: { status: 'Draft', scholarshipId },
      requestId: actor.requestId, ipAddress: actor.ipAddress,
    });
    return application;
  });
}

export async function submitApplication(
  applicationId: number,
  studentId: number,
  actor: WorkflowActor,
) {
  await db.transaction(async (trx) => {
    const application = await lockApplication(trx, applicationId);
    if (application.StudentID !== studentId) throw new NotFoundError('Application not found.');
    if (application.Status !== 'Draft') throw new ConflictError('Only a draft application can be submitted.');

    const { snapshot, documents } = await buildSubmissionSnapshot(trx, application);
    await initializeChecklist(trx, applicationId, documents);
    await trx('Applications').where({ ApplicationID: applicationId }).update({
      SubmittedSnapshot: JSON.stringify(snapshot),
      SubmissionDate: new Date(),
      UpdatedAt: new Date(),
    });
    await transitionApplication(trx, applicationId, 'Submitted', actor);
    const userId = await applicationStudentUserId(trx, applicationId);
    if (userId) await queueNotification(trx, userId, 'APPLICATION_SUBMITTED', 'Application submitted successfully.', { applicationId });
  });
}

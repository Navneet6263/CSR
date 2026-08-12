import db from '../config/database';
import { evaluateEligibility, EligibilityRuleRecord } from './eligibilityEvaluator.service';
import { IStudent } from '../types';
import { PublicEligibilityInput } from '../validators/public.validator';

export async function getPublicPortal() {
  const now = new Date();
  const [students, funded, disbursed, sponsors, scholarships, outcomes, announcements] = await Promise.all([
    db('Students').count('* as count').first(),
    db('Applications').where({ Status: 'PaymentCompleted' }).count('* as count').first(),
    db('Payments').where({ Status: 'Completed' }).sum('Amount as total').first(),
    db('Sponsors').where({ Status: 'Active' }).select('SponsorName').orderBy('SponsorName').limit(100),
    db('Scholarships as sc').join('Sponsors as sp', 'sp.SponsorID', 'sc.SponsorID')
      .select('sc.ScholarshipID', 'sc.Name', 'sc.Description', 'sc.PerStudentAmount',
        'sc.ApplicationCloseDate', 'sc.MaxApplicants', 'sp.SponsorName')
      .where({ 'sc.Status': 'Active', 'sp.Status': 'Active' })
      .where('sc.ApplicationOpenDate', '<=', now).where('sc.ApplicationCloseDate', '>=', now)
      .orderBy('sc.ApplicationCloseDate', 'asc').limit(12),
    db('Applications as a').join('Students as st', 'st.StudentID', 'a.StudentID')
      .select('st.Course').count('* as beneficiaryCount').sum('a.ScholarshipAmount as totalAwarded')
      .where({ 'a.Status': 'PaymentCompleted' }).whereNotNull('st.Course')
      .groupBy('st.Course').havingRaw('COUNT(*) >= 3').orderBy('beneficiaryCount', 'desc').limit(6),
    db('AdminAnnouncements').select('AnnouncementID', 'Title', 'Message', 'PublishedAt', 'ExpiresAt')
      .where({ Status: 'Published' }).whereIn('Audience', ['All', 'Students'])
      .where((query) => query.whereNull('ExpiresAt').orWhere('ExpiresAt', '>', now))
      .orderBy('PublishedAt', 'desc').limit(10),
  ]);
  return {
    stats: { registeredStudents: Number(students?.count ?? 0), studentsFunded: Number(funded?.count ?? 0),
      disbursed: Number(disbursed?.total ?? 0), activePartners: sponsors.length },
    scholarships: scholarships.map((row) => ({ scholarshipId: row.ScholarshipID, name: row.Name,
      description: row.Description, sponsorName: row.SponsorName,
      perStudentAmount: Number(row.PerStudentAmount ?? 0), applicationCloseDate: row.ApplicationCloseDate,
      maxApplicants: row.MaxApplicants })),
    partners: sponsors.map((row) => String(row.SponsorName)),
    outcomes: outcomes.map((row) => ({ course: row.Course, beneficiaryCount: Number(row.beneficiaryCount),
      totalAwarded: Number(row.totalAwarded ?? 0) })),
    announcements: announcements.map((row) => ({ announcementId: row.AnnouncementID,
      title: row.Title, message: row.Message, publishedAt: row.PublishedAt, expiresAt: row.ExpiresAt })),
  };
}

export async function checkPublicEligibility(input: PublicEligibilityInput) {
  const scholarships = await db('Scholarships as sc').join('Sponsors as sp', 'sp.SponsorID', 'sc.SponsorID')
    .select('sc.ScholarshipID', 'sc.Name', 'sc.PerStudentAmount', 'sp.SponsorName')
    .where({ 'sc.Status': 'Active', 'sp.Status': 'Active' })
    .where('sc.ApplicationOpenDate', '<=', new Date()).where('sc.ApplicationCloseDate', '>=', new Date()).limit(100);
  const ids = scholarships.map((row) => row.ScholarshipID);
  const rules = ids.length ? await db('EligibilityRules').whereIn('ScholarshipID', ids).orderBy('RuleID') : [];
  const byScholarship = new Map<number, EligibilityRuleRecord[]>();
  for (const rule of rules) {
    const list = byScholarship.get(rule.ScholarshipID) ?? []; list.push(rule as EligibilityRuleRecord);
    byScholarship.set(rule.ScholarshipID, list);
  }
  const year = new Date().getUTCFullYear();
  const student = { Gender: input.gender, Category: input.category, State: input.state, Course: input.course,
    AnnualFamilyIncome: input.annualFamilyIncome, PreviousYearMarks: input.previousYearMarks,
    DOB: input.age ? new Date(Date.UTC(year - input.age, 0, 1)) : undefined } as unknown as IStudent;
  return scholarships.map((scholarship) => {
    const evaluation = evaluateEligibility(student, byScholarship.get(scholarship.ScholarshipID) ?? []);
    return { scholarshipId: scholarship.ScholarshipID, name: scholarship.Name, sponsorName: scholarship.SponsorName,
      perStudentAmount: Number(scholarship.PerStudentAmount ?? 0), eligible: evaluation.isEligible,
      reasons: evaluation.results.filter((item) => !item.passed).map((item) => `${item.ruleType}: ${item.reason}`) };
  });
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { buildContentFromText, buildGeneratedScholarshipContent } from '../src/services/scholarshipContent.service';
import { pauseScholarshipSchema, scholarshipContentSchema } from '../src/validators/scholarship.validator';

const context = {
  ScholarshipID: 10, Name: 'Future Leaders Scholarship', Description: 'Support for promising students from underserved communities.',
  PerStudentAmount: 50_000, ApplicationOpenDate: '2026-08-01', ApplicationCloseDate: '2026-12-31',
  MaxApplicants: 100, SponsorID: 2, SponsorName: 'Example Foundation', SponsorEmail: 'help@example.org',
  SponsorPhone: '1800000000', rules: [
    { RuleType: 'Gender', Operator: 'EQ', ValueMin: 'Female', IsRequired: true },
    { RuleType: 'Age', Operator: 'BETWEEN', ValueMin: '18', ValueMax: '25', IsRequired: true },
  ],
};

test('generated scholarship content is complete and publishable', () => {
  const content = buildGeneratedScholarshipContent(context);
  assert.equal(scholarshipContentSchema.safeParse(content).success, true);
  assert.match(content.eligibility.join(' '), /Female/);
  assert.match(content.eligibility.join(' '), /18 and 25/);
  assert.ok(content.termsAndConditions.length >= 5);
});

test('uploaded text headings replace generated sections while retaining safe defaults', () => {
  const content = buildContentFromText(context, `
    Overview
    A special scholarship supporting women in technology education.
    Benefits
    Tuition support up to INR 50,000
    Mentoring from industry leaders
    Required Documents
    Identity proof
    Latest marksheet
    Terms and Conditions
    Submitted records must be authentic
    Sponsor decision is final after verification
  `);
  assert.match(content.overview, /women in technology/);
  assert.ok(content.benefits.some((item) => item.includes('Tuition support')));
  assert.ok(content.requiredDocuments.some((item) => item.includes('Identity proof')));
  assert.ok(content.applicationSteps.length > 0);
});

test('scholarship pause requires a reason and accepts an optional future resume date', () => {
  assert.equal(pauseScholarshipSchema.safeParse({ reason: 'short', publishNotice: true }).success, false);
  assert.equal(pauseScholarshipSchema.safeParse({
    reason: 'Sponsor requested a temporary eligibility review.',
    resumeAt: new Date(Date.now() + 86_400_000).toISOString(), publishNotice: true,
  }).success, true);
  assert.equal(pauseScholarshipSchema.safeParse({
    reason: 'Sponsor requested a temporary eligibility review.',
    resumeAt: new Date(Date.now() - 86_400_000).toISOString(), publishNotice: false,
  }).success, false);
});

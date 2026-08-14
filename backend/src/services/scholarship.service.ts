import db from '../config/database';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';
import { CreateScholarshipInput, PauseScholarshipInput, UpdateScholarshipInput } from '../validators/scholarship.validator';
import { writeAudit } from './audit.service';
import { WorkflowActor } from './workflow.service';
import { buildGeneratedScholarshipContent } from './scholarshipContent.service';
import { numericSearchId, prefixSearchPattern } from '../utils/searchPattern';

interface ScholarshipFilters {
  status?: string;
  search?: string;
  sponsorId?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

function pauseMessage(name: string, reason: string, resumeAt?: string | Date | null) {
  const resume = resumeAt
    ? ` Applications are planned to reopen on ${new Date(resumeAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.`
    : ' A reopening date will be announced after the review is complete.';
  return `${name} has been temporarily paused. ${reason}${resume}`;
}

export async function resumeDueScholarships(now = new Date()) {
  const due = await db('Scholarships').select('ScholarshipID').where({ Status: 'Paused' })
    .whereNotNull('ResumeAt').where('ResumeAt', '<=', now).limit(100);
  for (const item of due) {
    await db.transaction(async (trx) => {
      const scholarship = await trx('Scholarships').where({ ScholarshipID: item.ScholarshipID, Status: 'Paused' })
        .whereNotNull('ResumeAt').where('ResumeAt', '<=', now).forUpdate().first();
      if (!scholarship) return;
      await trx('Scholarships').where({ ScholarshipID: scholarship.ScholarshipID }).update({
        Status: 'Active', PauseReason: null, PausedAt: null, PausedBy: null, ResumeAt: null,
        PublishPauseNotice: false, PauseAnnouncementID: null, UpdatedAt: now,
      });
      if (scholarship.PauseAnnouncementID) await trx('AdminAnnouncements')
        .where({ AnnouncementID: scholarship.PauseAnnouncementID }).whereNot({ Status: 'Archived' })
        .update({ Status: 'Archived', UpdatedAt: now });
      await trx('Notifications').where({ GroupKey: `scholarship-pause:${scholarship.ScholarshipID}` })
        .where((query) => query.whereNull('ExpiresAt').orWhere('ExpiresAt', '>', now))
        .update({ ExpiresAt: now });
      await writeAudit(trx, { action: 'SCHOLARSHIP_AUTO_RESUMED', entityType: 'Scholarship',
        entityId: scholarship.ScholarshipID,
        oldValue: { status: 'Paused', reason: scholarship.PauseReason, resumeAt: scholarship.ResumeAt },
        newValue: { status: 'Active', resumedAt: now, trigger: 'Scheduled' } });
    });
  }
  return due.length;
}

async function assertSponsor(sponsorId: number) {
  const sponsor = await db('Sponsors').where({ SponsorID: sponsorId, Status: 'Active' }).first();
  if (!sponsor) throw new ValidationError('An active sponsor is required.');
}

function validateScholarshipValues(values: Record<string, any>) {
  if (new Date(values.ApplicationCloseDate) <= new Date(values.ApplicationOpenDate)) {
    throw new ValidationError('Application close date must be after open date.');
  }
  if (Number(values.PerStudentAmount) > Number(values.TotalBudget)) {
    throw new ValidationError('Per-student amount cannot exceed the total budget.');
  }
}

export async function createScholarship(data: CreateScholarshipInput, actor: WorkflowActor) {
  await assertSponsor(data.sponsorId);
  return db.transaction(async (trx) => {
    const sponsor = await trx('Sponsors').where({ SponsorID: data.sponsorId }).first();
    const requestedReview = data.status === 'Active';
    const values = { Name: data.name, Description: data.description || null, SponsorID: data.sponsorId,
      TotalBudget: data.totalBudget, PerStudentAmount: data.perStudentAmount,
      ApplicationOpenDate: data.applicationOpenDate, ApplicationCloseDate: data.applicationCloseDate,
      MaxApplicants: data.maxApplicants || null, Status: 'Inactive' };
    const inserted = await trx('Scholarships').insert(values).returning('*');
    const scholarship = inserted[0];
    if (data.rules?.length) {
      await trx('EligibilityRules').insert(data.rules.map((rule) => ({
        ScholarshipID: scholarship.ScholarshipID, RuleType: rule.ruleType, Operator: rule.operator,
        ValueMin: rule.valueMin ?? null, ValueMax: rule.valueMax ?? null,
        ValueList: rule.valueList ?? null, IsRequired: rule.isRequired, RuleVersion: 1,
      })));
    }
    const rules = (data.rules ?? []).map((rule) => ({ RuleType: rule.ruleType, Operator: rule.operator,
      ValueMin: rule.valueMin ?? null, ValueMax: rule.valueMax ?? null, ValueList: rule.valueList ?? null,
      IsRequired: rule.isRequired }));
    const generated = buildGeneratedScholarshipContent({ ...values, ScholarshipID: scholarship.ScholarshipID,
      SponsorName: sponsor.SponsorName, SponsorEmail: sponsor.Email, SponsorPhone: sponsor.Phone, rules });
    const insertedContent = await trx('ScholarshipContents').insert({ ScholarshipID: scholarship.ScholarshipID,
      DraftJSON: JSON.stringify(generated), ReviewStatus: requestedReview ? 'Review' : 'Draft',
      DraftVersion: 1, SourceType: 'Generated' }).returning('*');
    await trx('ScholarshipContentVersions').insert({ ContentID: insertedContent[0].ContentID, VersionNumber: 1,
      ContentJSON: JSON.stringify(generated), SourceType: 'Generated', EditedBy: actor.userId,
      ChangeNote: 'Initial professional draft generated from scholarship data' });
    await writeAudit(trx, { userId: actor.userId, action: 'SCHOLARSHIP_CREATED', entityType: 'Scholarship',
      entityId: scholarship.ScholarshipID, newValue: values, requestId: actor.requestId, ipAddress: actor.ipAddress });
    return { ...scholarship, Status: 'Inactive', ContentStatus: requestedReview ? 'Review' : 'Draft' };
  });
}

export async function getAllScholarships(filters: ScholarshipFilters = {}) {
  await resumeDueScholarships();
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const query = db('Scholarships as s').join('Sponsors as sp', 'sp.SponsorID', 's.SponsorID')
    .leftJoin('ScholarshipContents as content', 'content.ScholarshipID', 's.ScholarshipID')
    .select('s.*', 'sp.SponsorName', 'content.ReviewStatus as ContentStatus',
      db.raw('CASE WHEN sp.LogoStorageKey IS NULL THEN 0 ELSE 1 END as HasSponsorLogo'), db.raw(
      '(SELECT COUNT(1) FROM Applications a WHERE a.ScholarshipID = s.ScholarshipID AND a.Status <> ?) as ApplicantCount',
      ['Cancelled'],
    ));
  if (filters.status) {
    const statuses = filters.status.split(',').map((value) => value.trim())
      .filter((value) => ['Active', 'Paused', 'Inactive', 'Closed'].includes(value));
    if (statuses.length) query.whereIn('s.Status', statuses);
  }
  if (filters.sponsorId) query.where('s.SponsorID', filters.sponsorId);
  if (filters.search) {
    const search = prefixSearchPattern(filters.search);
    const searchId = numericSearchId(filters.search);
    query.where((builder) => { builder.where('s.Name', 'like', search).orWhere('sp.SponsorName', 'like', search);
      if (searchId) builder.orWhere('s.ScholarshipID', searchId); });
  }
  const order = filters.sort === 'amount'
    ? [{ column: 's.PerStudentAmount', order: 'desc' as const }, { column: 's.ScholarshipID', order: 'asc' as const }]
    : [{ column: 's.ApplicationCloseDate', order: 'asc' as const }, { column: 's.ScholarshipID', order: 'asc' as const }];
  const [total, scholarships] = await Promise.all([
    query.clone().clearSelect().count('* as count').first(),
    query.orderBy(order).limit(limit).offset((page - 1) * limit),
  ]);
  return { scholarships: scholarships.map((row) => ({ ...row,
    SponsorLogoURL: row.HasSponsorLogo ? `/api/v1/scholarships/${row.ScholarshipID}/logo` : null })),
    pagination: { page, limit, total: Number(total?.count ?? 0) } };
}

export async function getScholarshipById(id: number) {
  await resumeDueScholarships();
  const scholarship = await db('Scholarships as s').join('Sponsors as sp', 'sp.SponsorID', 's.SponsorID')
    .leftJoin('ScholarshipContents as content', 'content.ScholarshipID', 's.ScholarshipID')
    .select('s.*', 'sp.SponsorName', 'content.ReviewStatus as ContentStatus', 'content.PublishedJSON',
      db.raw('CASE WHEN sp.LogoStorageKey IS NULL THEN 0 ELSE 1 END as HasSponsorLogo'))
    .where('s.ScholarshipID', id).first();
  if (!scholarship) throw new NotFoundError('Scholarship not found.');
  const rules = await db('EligibilityRules').where({ ScholarshipID: id }).orderBy('RuleID');
  let publishedContent = null;
  try { publishedContent = scholarship.PublishedJSON ? JSON.parse(scholarship.PublishedJSON) : null; } catch { /* invalid legacy JSON */ }
  const { PublishedJSON: _publishedJson, ...safe } = scholarship;
  return { ...safe, SponsorLogoURL: scholarship.HasSponsorLogo ? `/api/v1/scholarships/${id}/logo` : null,
    publishedContent, eligibilityRules: rules };
}

export async function updateScholarship(id: number, data: UpdateScholarshipInput, actor: WorkflowActor) {
  await db.transaction(async (trx) => {
    const existing = await trx('Scholarships').where({ ScholarshipID: id }).first();
    if (!existing) throw new NotFoundError('Scholarship not found.');
    if (existing.Status === 'Active' && data.status === 'Inactive') {
      throw new ConflictError('Use the pause workflow so a reason, resume plan, and audit record are captured.');
    }
    if (existing.Status === 'Paused' && data.status === 'Active') {
      throw new ConflictError('Use the resume action to make a paused scholarship live.');
    }
    const hasApplications = await trx('Applications').where({ ScholarshipID: id }).whereNot('Status', 'Draft').first();
    if (hasApplications && ['sponsorId', 'perStudentAmount', 'totalBudget'].some((field) => field in data)) {
      throw new ConflictError('Financial scholarship fields cannot change after applications are submitted.');
    }
    if (data.sponsorId !== undefined) await assertSponsor(data.sponsorId);
    if (data.status === 'Active') {
      const content = await trx('ScholarshipContents').where({ ScholarshipID: id }).first();
      if (content && content.ReviewStatus !== 'Published') {
        throw new ConflictError('Review and publish the scholarship content before activating the program.');
      }
    }
    const map: Record<string, string> = { name: 'Name', description: 'Description', sponsorId: 'SponsorID',
      totalBudget: 'TotalBudget', perStudentAmount: 'PerStudentAmount', applicationOpenDate: 'ApplicationOpenDate',
      applicationCloseDate: 'ApplicationCloseDate', maxApplicants: 'MaxApplicants', status: 'Status' };
    const payload: Record<string, unknown> = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [map[key], value]),
    );
    validateScholarshipValues({ ...existing, ...payload });
    payload.UpdatedAt = new Date();
    await trx('Scholarships').where({ ScholarshipID: id }).update(payload);
    if (await trx('ScholarshipContents').where({ ScholarshipID: id }).first()) {
      const contentRelevant = ['name', 'description', 'sponsorId', 'perStudentAmount', 'applicationOpenDate',
        'applicationCloseDate', 'maxApplicants'].some((field) => field in data);
      if (contentRelevant) await trx('ScholarshipContents').where({ ScholarshipID: id })
        .update({ ReviewStatus: 'Review', UpdatedAt: new Date() });
    }
    await writeAudit(trx, { userId: actor.userId, action: 'SCHOLARSHIP_UPDATED', entityType: 'Scholarship',
      entityId: id, oldValue: existing, newValue: payload, requestId: actor.requestId, ipAddress: actor.ipAddress });
  });
  return getScholarshipById(id);
}

export async function pauseScholarship(id: number, data: PauseScholarshipInput, actor: WorkflowActor) {
  await db.transaction(async (trx) => {
    const scholarship = await trx('Scholarships').where({ ScholarshipID: id }).forUpdate().first();
    if (!scholarship) throw new NotFoundError('Scholarship not found.');
    if (scholarship.Status !== 'Active') throw new ConflictError('Only an active scholarship can be paused.');
    const now = new Date();
    let announcementId: number | null = null;
    if (data.publishNotice) {
      const message = pauseMessage(scholarship.Name, data.reason, data.resumeAt);
      const inserted = await trx('AdminAnnouncements').insert({
        Title: `${scholarship.Name} temporarily paused`,
        Message: message,
        Audience: 'Students', Status: 'Published', CreatedBy: actor.userId,
        PublishedAt: now, ExpiresAt: data.resumeAt ? new Date(data.resumeAt) : null,
      }).returning('AnnouncementID');
      announcementId = Number(inserted[0]?.AnnouncementID ?? inserted[0]);
      const payload = JSON.stringify({ scholarshipId: id, status: 'Paused', resumeAt: data.resumeAt ?? null });
      await trx.raw(`INSERT INTO Notifications
        (UserID, Type, Channel, Message, Payload, IsSent, RetryCount, NextAttemptAt, Priority,
         RequiresAction, ActionURL, GroupKey, ExpiresAt)
        SELECT u.UserID, 'SCHOLARSHIP_PAUSED', 'InApp', ?, ?, 0, 0, SYSUTCDATETIME(), 'Normal',
          0, ?, ?, ?
        FROM Users u WHERE u.Role = 'Student' AND u.IsActive = 1`, [message, payload,
        `/student/scholarships/${id}`, `scholarship-pause:${id}`, data.resumeAt ? new Date(data.resumeAt) : null]);
    }
    const values = { Status: 'Paused', PauseReason: data.reason, PausedAt: now, PausedBy: actor.userId,
      ResumeAt: data.resumeAt ? new Date(data.resumeAt) : null, PublishPauseNotice: data.publishNotice,
      PauseAnnouncementID: announcementId, UpdatedAt: now };
    await trx('Scholarships').where({ ScholarshipID: id }).update(values);
    await writeAudit(trx, { userId: actor.userId, action: 'SCHOLARSHIP_PAUSED', entityType: 'Scholarship', entityId: id,
      oldValue: { status: scholarship.Status }, newValue: { status: 'Paused', reason: data.reason,
        resumeAt: data.resumeAt ?? null, publicNotice: data.publishNotice, announcementId },
      requestId: actor.requestId, ipAddress: actor.ipAddress });
  });
  return getScholarshipById(id);
}

export async function resumeScholarship(id: number, actor: WorkflowActor) {
  await db.transaction(async (trx) => {
    const scholarship = await trx('Scholarships').where({ ScholarshipID: id }).forUpdate().first();
    if (!scholarship) throw new NotFoundError('Scholarship not found.');
    if (scholarship.Status !== 'Paused') throw new ConflictError('Only a paused scholarship can be resumed.');
    const now = new Date();
    await trx('Scholarships').where({ ScholarshipID: id }).update({ Status: 'Active', PauseReason: null,
      PausedAt: null, PausedBy: null, ResumeAt: null, PublishPauseNotice: false,
      PauseAnnouncementID: null, UpdatedAt: now });
    if (scholarship.PauseAnnouncementID) await trx('AdminAnnouncements')
      .where({ AnnouncementID: scholarship.PauseAnnouncementID }).whereNot({ Status: 'Archived' })
      .update({ Status: 'Archived', UpdatedAt: now });
    await trx('Notifications').where({ GroupKey: `scholarship-pause:${id}` })
      .where((query) => query.whereNull('ExpiresAt').orWhere('ExpiresAt', '>', now))
      .update({ ExpiresAt: now });
    await writeAudit(trx, { userId: actor.userId, action: 'SCHOLARSHIP_RESUMED', entityType: 'Scholarship', entityId: id,
      oldValue: { status: 'Paused', reason: scholarship.PauseReason, resumeAt: scholarship.ResumeAt,
        publicNotice: Boolean(scholarship.PublishPauseNotice) }, newValue: { status: 'Active', resumedAt: now },
      requestId: actor.requestId, ipAddress: actor.ipAddress });
  });
  return getScholarshipById(id);
}

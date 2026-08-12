import bcrypt from 'bcrypt';
import crypto from 'crypto';
import db from '../config/database';
import { WorkflowActor } from './workflow.service';
import { writeAudit } from './audit.service';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';

export interface CreateStaffInput {
  fullName: string; email: string;
  role: 'Finance' | 'CSRPartner' | 'DocReviewer' | 'BGCheckOfficer' | 'ScreeningOfficer' | 'SupportAgent';
  financeFunction?: 'Maker' | 'Checker'; sponsorId?: number; organization?: string; fundCap?: number;
}

export function listStaff(limit = 100) {
  return db('Users as u').leftJoin('Sponsors as s', 's.SponsorID', 'u.SponsorID')
    .select('u.UserID', 'u.FullName', 'u.Email', 'u.Role', 'u.SponsorID', 'u.IsActive', 'u.MustChangePassword',
      'u.FinanceFunction', 'u.CreatedAt', 's.SponsorName', 's.TotalFund', 's.FundAllocated', 's.FundUtilized')
    .whereIn('u.Role', ['Finance', 'CSRPartner', 'DocReviewer', 'BGCheckOfficer', 'ScreeningOfficer', 'SupportAgent'])
    .orderBy('u.CreatedAt', 'desc').limit(limit);
}

function temporaryPassword() {
  return `Tb!${crypto.randomBytes(12).toString('base64url')}`;
}

export async function createStaff(input: CreateStaffInput, actor: WorkflowActor) {
  const email = input.email.trim().toLowerCase();
  return db.transaction(async (trx) => {
    if (await trx('Users').whereRaw('LOWER(Email) = ?', [email]).first()) {
      throw new ConflictError(`An account with ${email} already exists. Use a different email address.`);
    }
    let sponsorId: number | null = null;
    if (input.role === 'CSRPartner') {
      let sponsor = input.sponsorId
        ? await trx('Sponsors').where({ SponsorID: input.sponsorId, Status: 'Active' }).first()
        : await trx('Sponsors').whereRaw('LOWER(SponsorName) = ?', [input.organization!.toLowerCase()]).first();
      if (input.sponsorId && !sponsor) throw new ValidationError('Selected sponsor is not active or does not exist.');
      if (sponsor && sponsor.Status !== 'Active') throw new ValidationError('Sponsor account is not active.');
      if (!sponsor) {
        const inserted = await trx('Sponsors').insert({ SponsorName: input.organization, ContactPerson: input.fullName,
          Email: email, TotalFund: input.fundCap, Status: 'Active' }).returning('*');
        sponsor = inserted[0];
      }
      sponsorId = sponsor.SponsorID;
    }
    const password = temporaryPassword();
    const inserted = await trx('Users').insert({ FullName: input.fullName.trim(), Email: email,
      PasswordHash: await bcrypt.hash(password, 12), Role: input.role, SponsorID: sponsorId,
      FinanceFunction: input.role === 'Finance' ? input.financeFunction : null,
      IsActive: true, MustChangePassword: true }).returning('*');
    const user = inserted[0];
    await writeAudit(trx, { userId: actor.userId, action: 'STAFF_ACCOUNT_CREATED', entityType: 'User',
      entityId: user.UserID, newValue: { role: input.role, sponsorId,
        financeFunction: input.role === 'Finance' ? input.financeFunction : null }, requestId: actor.requestId,
      ipAddress: actor.ipAddress });
    return { user: { userId: user.UserID, fullName: user.FullName, email: user.Email,
      role: user.Role, sponsorId, financeFunction: user.FinanceFunction }, temporaryPassword: password };
  });
}

export async function deactivateStaff(userId: number, actor: WorkflowActor) {
  if (userId === actor.userId) throw new ForbiddenError('You cannot deactivate your own account.');
  return db.transaction(async (trx) => {
    const user = await trx('Users').where({ UserID: userId }).first();
    if (!user || user.Role === 'Student' || user.Role === 'Admin') throw new NotFoundError('Staff account not found.');
    await trx('Users').where({ UserID: userId }).update({ IsActive: false,
      TokenVersion: Number(user.TokenVersion ?? 0) + 1, UpdatedAt: trx.fn.now() });
    await trx('AuthSessions').where({ UserID: userId }).whereNull('RevokedAt').update({ RevokedAt: trx.fn.now() });
    await writeAudit(trx, { userId: actor.userId, action: 'STAFF_ACCOUNT_DEACTIVATED', entityType: 'User',
      entityId: userId, oldValue: { active: true }, newValue: { active: false }, requestId: actor.requestId,
      ipAddress: actor.ipAddress });
    return { userId, active: false };
  });
}

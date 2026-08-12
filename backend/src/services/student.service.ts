import db from '../config/database';
import { IStudent } from '../types';
import { ConflictError, NotFoundError } from '../utils/errors';
import { decryptPii } from '../utils/piiCrypto';
import { UpdateStudentProfileInput } from '../validators/student.validator';
import { writeAudit } from './audit.service';
import { profileUpdatePayload, protectedProfileFields } from './studentProfileMapper.service';
import { profileReadiness } from './profileReadiness.service';

const CLOSED_STATUSES = ['EligibilityFailed', 'ScreeningRejected', 'CSRDeclined', 'PaymentCompleted', 'Cancelled'];

export async function getStudentByUserId(userId: number): Promise<IStudent | undefined> {
  return db<IStudent>('Students').where({ UserID: userId }).first();
}

function studentResponse(profile: Record<string, any>, documentCount: number): Record<string, any> {
  const aadhar = decryptPii(profile.AadharCiphertext) ?? profile.AadharNumber ?? null;
  const account = decryptPii(profile.BankAccountCiphertext) ?? profile.BankAccountNo ?? null;
  const ifsc = decryptPii(profile.BankIFSCCiphertext) ?? profile.BankIFSC ?? null;
  const {
    AadharCiphertext: _aadharCiphertext,
    AadharHash: _aadharHash,
    BankAccountCiphertext: _accountCiphertext,
    BankIFSCCiphertext: _ifscCiphertext,
    ...safe
  } = profile;
  const readiness = profileReadiness(profile, documentCount);
  return { ...safe, AadharNumber: aadhar, BankAccountNo: account, BankIFSC: ifsc,
    ProfileCompletion: readiness.completion, ProfileSections: readiness.sections,
    MissingProfileSections: readiness.missing };
}

export async function getStudentProfile(userId: number) {
  const profile = await db('Students as s')
    .join('Users as u', 'u.UserID', 's.UserID')
    .leftJoin('Institutions as i', 'i.InstitutionID', 's.InstitutionID')
    .select('s.*', 'u.FullName', 'u.Email', 'u.Phone', 'u.Role', 'i.Name as InstitutionName')
    .where('s.UserID', userId)
    .first();
  if (!profile) throw new NotFoundError('Student profile not found.');
  const documents = await db('StudentDocuments').where({ StudentID: profile.StudentID }).count('* as count').first();
  return studentResponse(profile, Number(documents?.count ?? 0));
}

async function assertMutableProfile(userId: number, data: UpdateStudentProfileInput): Promise<void> {
  const touchesProtectedField = Object.keys(data).some((key) => protectedProfileFields.has(key));
  if (!touchesProtectedField) return;
  const bankFields = new Set(['bankAccountNo', 'bankIFSC', 'bankName', 'bankBranch', 'isAadhaarLinkedToBank']);
  const active = await db('Applications as a')
    .join('Students as s', 's.StudentID', 'a.StudentID')
    .where('s.UserID', userId)
    .whereNotIn('a.Status', CLOSED_STATUSES)
    .whereNot('a.Status', 'Draft')
    .first('a.ApplicationID', 'a.Status');
  if (active && !(active.Status === 'PaymentFailed' && Object.keys(data).every((key) => bankFields.has(key)))) {
    throw new ConflictError('Identity, eligibility, or bank details cannot change during active verification.');
  }
}

export async function updateStudentProfile(userId: number, data: UpdateStudentProfileInput) {
  await assertMutableProfile(userId, data);
  const payload = profileUpdatePayload(data);
  if (!Object.keys(payload).length && data.phone === undefined) return getStudentProfile(userId);

  await db.transaction(async (trx) => {
    const student = await trx('Students').where({ UserID: userId }).first();
    if (!student) throw new NotFoundError('Student profile not found.');
    if (Object.keys(payload).length) {
      payload.UpdatedAt = new Date();
      await trx('Students').where({ UserID: userId }).update(payload);
    }
    if (data.phone !== undefined) {
      await trx('Users').where({ UserID: userId }).update({ Phone: data.phone, UpdatedAt: new Date() });
    }
    await writeAudit(trx, {
      userId,
      action: 'STUDENT_PROFILE_UPDATED',
      entityType: 'Student',
      entityId: student.StudentID,
      oldValue: { fields: [...Object.keys(payload).filter((key) => key !== 'UpdatedAt'), ...(data.phone !== undefined ? ['Phone'] : [])] },
      newValue: { fields: [...Object.keys(payload).filter((key) => key !== 'UpdatedAt'), ...(data.phone !== undefined ? ['Phone'] : [])] },
    });
  });
  return getStudentProfile(userId);
}

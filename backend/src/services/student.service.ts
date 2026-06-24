import db from '../config/database';
import { IStudent } from '../types';
import { NotFoundError } from '../utils/errors';
import { UpdateStudentProfileInput } from '../validators/student.validator';

// ─── Get Student by UserID ──────────────────────────────────────────────────

export async function getStudentByUserId(userId: number): Promise<IStudent | undefined> {
  return db<IStudent>('Students').where({ UserID: userId }).first();
}

// ─── Get Student Profile (joined with User) ────────────────────────────────

export async function getStudentProfile(userId: number) {
  const profile = await db('Students as s')
    .join('Users as u', 'u.UserID', 's.UserID')
    .leftJoin('Institutions as i', 'i.InstitutionID', 's.InstitutionID')
    .select(
      's.StudentID', 's.UserID', 's.AadharNumber', 's.DOB',
      's.Gender', 's.Category', 's.Address', 's.City',
      's.State', 's.Pincode', 's.AnnualFamilyIncome', 's.FamilySize',
      's.Course', 's.InstitutionID', 's.EnrollmentYear',
      's.BankAccountNo', 's.BankIFSC', 's.BankName', 's.CreatedAt',
      'u.FullName', 'u.Email', 'u.Phone', 'u.Role',
      'i.Name as InstitutionName'
    )
    .where('s.UserID', userId)
    .first();

  if (!profile) {
    throw new NotFoundError('Student profile not found.');
  }

  return profile;
}

// ─── Update Student Profile ─────────────────────────────────────────────────

export async function updateStudentProfile(
  userId: number,
  data: UpdateStudentProfileInput
) {
  const student = await getStudentByUserId(userId);
  if (!student) {
    throw new NotFoundError('Student profile not found.');
  }

  // Map camelCase input to PascalCase DB columns
  const updatePayload: Record<string, unknown> = {};

  if (data.aadharNumber !== undefined) updatePayload.AadharNumber = data.aadharNumber;
  if (data.dob !== undefined) updatePayload.DOB = data.dob;
  if (data.gender !== undefined) updatePayload.Gender = data.gender;
  if (data.category !== undefined) updatePayload.Category = data.category;
  if (data.address !== undefined) updatePayload.Address = data.address;
  if (data.city !== undefined) updatePayload.City = data.city;
  if (data.state !== undefined) updatePayload.State = data.state;
  if (data.pincode !== undefined) updatePayload.Pincode = data.pincode;
  if (data.annualFamilyIncome !== undefined) updatePayload.AnnualFamilyIncome = data.annualFamilyIncome;
  if (data.familySize !== undefined) updatePayload.FamilySize = data.familySize;
  if (data.course !== undefined) updatePayload.Course = data.course;
  if (data.institutionId !== undefined) updatePayload.InstitutionID = data.institutionId;
  if (data.enrollmentYear !== undefined) updatePayload.EnrollmentYear = data.enrollmentYear;
  if (data.bankAccountNo !== undefined) updatePayload.BankAccountNo = data.bankAccountNo;
  if (data.bankIFSC !== undefined) updatePayload.BankIFSC = data.bankIFSC;
  if (data.bankName !== undefined) updatePayload.BankName = data.bankName;

  if (Object.keys(updatePayload).length === 0) {
    return student;
  }

  await db('Students')
    .where({ UserID: userId })
    .update(updatePayload);

  return getStudentProfile(userId);
}

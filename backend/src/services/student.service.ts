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
      's.*',
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
  if (data.otherInstitutionName !== undefined) updatePayload.OtherInstitutionName = data.otherInstitutionName;
  if (data.enrollmentYear !== undefined) updatePayload.EnrollmentYear = data.enrollmentYear;
  if (data.bankAccountNo !== undefined) updatePayload.BankAccountNo = data.bankAccountNo;
  if (data.bankIFSC !== undefined) updatePayload.BankIFSC = data.bankIFSC;
  if (data.bankName !== undefined) updatePayload.BankName = data.bankName;

  // Extended Mapping
  if (data.previousYearMarks !== undefined) updatePayload.PreviousYearMarks = data.previousYearMarks;
  if (data.tenthBoardName !== undefined) updatePayload.TenthBoardName = data.tenthBoardName;
  if (data.tenthPassingYear !== undefined) updatePayload.TenthPassingYear = data.tenthPassingYear;
  if (data.tenthMarks !== undefined) updatePayload.TenthMarks = data.tenthMarks;
  if (data.twelfthBoardName !== undefined) updatePayload.TwelfthBoardName = data.twelfthBoardName;
  if (data.twelfthPassingYear !== undefined) updatePayload.TwelfthPassingYear = data.twelfthPassingYear;
  if (data.twelfthMarks !== undefined) updatePayload.TwelfthMarks = data.twelfthMarks;
  if (data.currentSemesterOrYear !== undefined) updatePayload.CurrentSemesterOrYear = data.currentSemesterOrYear;
  if (data.admissionRegistrationNo !== undefined) updatePayload.AdmissionRegistrationNo = data.admissionRegistrationNo;

  if (data.fatherName !== undefined) updatePayload.FatherName = data.fatherName;
  if (data.fatherOccupation !== undefined) updatePayload.FatherOccupation = data.fatherOccupation;
  if (data.motherName !== undefined) updatePayload.MotherName = data.motherName;
  if (data.motherOccupation !== undefined) updatePayload.MotherOccupation = data.motherOccupation;

  if (data.religion !== undefined) updatePayload.Religion = data.religion;
  if (data.isDisabled !== undefined) updatePayload.IsDisabled = data.isDisabled;
  if (data.disabilityPercentage !== undefined) updatePayload.DisabilityPercentage = data.disabilityPercentage;
  if (data.domicileState !== undefined) updatePayload.DomicileState = data.domicileState;
  if (data.domicileDistrict !== undefined) updatePayload.DomicileDistrict = data.domicileDistrict;

  if (data.tuitionFee !== undefined) updatePayload.TuitionFee = data.tuitionFee;

  // Real-World Mapping
  if (data.casteCertificateNumber !== undefined) updatePayload.CasteCertificateNumber = data.casteCertificateNumber;
  if (data.casteCertificateIssueDate !== undefined) updatePayload.CasteCertificateIssueDate = data.casteCertificateIssueDate;
  if (data.domicileCertificateNumber !== undefined) updatePayload.DomicileCertificateNumber = data.domicileCertificateNumber;
  if (data.alternatePhone !== undefined) updatePayload.AlternatePhone = data.alternatePhone;

  if (data.isHosteller !== undefined) updatePayload.IsHosteller = data.isHosteller;
  if (data.distanceFromHome !== undefined) updatePayload.DistanceFromHome = data.distanceFromHome;
  if (data.hasGapYear !== undefined) updatePayload.HasGapYear = data.hasGapYear;
  if (data.gapYearExplanation !== undefined) updatePayload.GapYearExplanation = data.gapYearExplanation;

  if (data.receivedPreviousScholarship !== undefined) updatePayload.ReceivedPreviousScholarship = data.receivedPreviousScholarship;
  if (data.previousScholarshipName !== undefined) updatePayload.PreviousScholarshipName = data.previousScholarshipName;
  if (data.previousScholarshipAmount !== undefined) updatePayload.PreviousScholarshipAmount = data.previousScholarshipAmount;
  if (data.previousScholarshipYear !== undefined) updatePayload.PreviousScholarshipYear = data.previousScholarshipYear;

  if (data.isAadhaarLinkedToBank !== undefined) updatePayload.IsAadhaarLinkedToBank = data.isAadhaarLinkedToBank;
  if (data.isEKYCVerified !== undefined) updatePayload.IsEKYCVerified = data.isEKYCVerified;

  if (data.statementOfPurpose !== undefined) updatePayload.StatementOfPurpose = data.statementOfPurpose;
  if (data.extracurricularActivities !== undefined) updatePayload.ExtracurricularActivities = data.extracurricularActivities;

  // New Family, Address & Document Mapping
  if (data.permanentAddress !== undefined) updatePayload.PermanentAddress = data.permanentAddress;
  if (data.permanentCity !== undefined) updatePayload.PermanentCity = data.permanentCity;
  if (data.permanentState !== undefined) updatePayload.PermanentState = data.permanentState;
  if (data.permanentPincode !== undefined) updatePayload.PermanentPincode = data.permanentPincode;
  if (data.isPermanentSameAsCurrent !== undefined) updatePayload.IsPermanentSameAsCurrent = data.isPermanentSameAsCurrent;
  if (data.currentAddressDurationMonths !== undefined) updatePayload.CurrentAddressDurationMonths = data.currentAddressDurationMonths;
  if (data.numberOfSiblings !== undefined) updatePayload.NumberOfSiblings = data.numberOfSiblings;
  if (data.siblingDetails !== undefined) updatePayload.SiblingDetails = data.siblingDetails ? JSON.stringify(data.siblingDetails) : null;
  if (data.fatherAadharFileURL !== undefined) updatePayload.FatherAadharFileURL = data.fatherAadharFileURL;
  if (data.motherAadharFileURL !== undefined) updatePayload.MotherAadharFileURL = data.motherAadharFileURL;
  if (data.fatherPayslipFileURL !== undefined) updatePayload.FatherPayslipFileURL = data.fatherPayslipFileURL;
  if (data.bankStatement6MonthsFileURL !== undefined) updatePayload.BankStatement6MonthsFileURL = data.bankStatement6MonthsFileURL;

  if (Object.keys(updatePayload).length === 0) {
    return student;
  }

  await db('Students')
    .where({ UserID: userId })
    .update(updatePayload);

  return getStudentProfile(userId);
}

import { UpdateStudentProfileInput } from '../validators/student.validator';
import { encryptPii, hashPii } from '../utils/piiCrypto';

const fieldMap: Record<string, string> = {
  dob: 'DOB', gender: 'Gender', category: 'Category', address: 'Address', city: 'City', state: 'State',
  pincode: 'Pincode', annualFamilyIncome: 'AnnualFamilyIncome', familySize: 'FamilySize', course: 'Course',
  otherInstitutionName: 'OtherInstitutionName', enrollmentYear: 'EnrollmentYear', bankName: 'BankName',
  bankBranch: 'BankBranch',
  previousYearMarks: 'PreviousYearMarks', tenthBoardName: 'TenthBoardName', tenthPassingYear: 'TenthPassingYear',
  tenthMarks: 'TenthMarks', twelfthBoardName: 'TwelfthBoardName', twelfthPassingYear: 'TwelfthPassingYear',
  twelfthMarks: 'TwelfthMarks', currentSemesterOrYear: 'CurrentSemesterOrYear',
  admissionRegistrationNo: 'AdmissionRegistrationNo', fatherName: 'FatherName',
  fatherOccupation: 'FatherOccupation', motherName: 'MotherName', motherOccupation: 'MotherOccupation',
  religion: 'Religion', isDisabled: 'IsDisabled', disabilityPercentage: 'DisabilityPercentage',
  domicileState: 'DomicileState', domicileDistrict: 'DomicileDistrict', tuitionFee: 'TuitionFee',
  casteCertificateNumber: 'CasteCertificateNumber', casteCertificateIssueDate: 'CasteCertificateIssueDate',
  domicileCertificateNumber: 'DomicileCertificateNumber', alternatePhone: 'AlternatePhone',
  isHosteller: 'IsHosteller', distanceFromHome: 'DistanceFromHome', hasGapYear: 'HasGapYear',
  gapYearExplanation: 'GapYearExplanation', receivedPreviousScholarship: 'ReceivedPreviousScholarship',
  previousScholarshipName: 'PreviousScholarshipName', previousScholarshipAmount: 'PreviousScholarshipAmount',
  previousScholarshipYear: 'PreviousScholarshipYear', statementOfPurpose: 'StatementOfPurpose',
  extracurricularActivities: 'ExtracurricularActivities', permanentAddress: 'PermanentAddress',
  permanentCity: 'PermanentCity', permanentState: 'PermanentState', permanentPincode: 'PermanentPincode',
  isPermanentSameAsCurrent: 'IsPermanentSameAsCurrent',
  currentAddressDurationMonths: 'CurrentAddressDurationMonths', numberOfSiblings: 'NumberOfSiblings',
};

export const protectedProfileFields = new Set([
  'aadharNumber', 'dob', 'annualFamilyIncome', 'category', 'state', 'course', 'institutionId',
  'enrollmentYear', 'bankAccountNo', 'bankIFSC',
  'bankName', 'bankBranch', 'isAadhaarLinkedToBank',
]);

export function profileUpdatePayload(data: UpdateStudentProfileInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const input = data as Record<string, unknown>;
  for (const [source, target] of Object.entries(fieldMap)) {
    if (input[source] !== undefined) payload[target] = input[source];
  }
  if (data.institutionId !== undefined) {
    payload.InstitutionID = data.institutionId === 'other' ? null : data.institutionId;
  }
  if (data.siblingDetails !== undefined) payload.SiblingDetails = JSON.stringify(data.siblingDetails);
  if (data.aadharNumber !== undefined) {
    payload.AadharCiphertext = encryptPii(data.aadharNumber);
    payload.AadharHash = hashPii(data.aadharNumber);
    payload.AadharNumber = null;
  }
  if (data.bankAccountNo !== undefined) {
    payload.BankAccountCiphertext = encryptPii(data.bankAccountNo);
    payload.BankAccountNo = null;
  }
  if (data.bankIFSC !== undefined) {
    payload.BankIFSCCiphertext = encryptPii(data.bankIFSC);
    payload.BankIFSC = null;
  }
  return payload;
}

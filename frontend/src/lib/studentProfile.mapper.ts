import type { Institution, StudentProfile } from '@/types';

type Raw = Record<string, unknown>;
const text = (raw: Raw, pascal: string, camel: string) => (raw[pascal] ?? raw[camel]) as string | undefined;
const number = (raw: Raw, pascal: string, camel: string) => Number(raw[pascal] ?? raw[camel] ?? 0) || undefined;
const bool = (raw: Raw, pascal: string, camel: string) => Boolean(raw[pascal] ?? raw[camel]);

export function mapStudentProfile(raw: Raw): StudentProfile {
  return {
    studentId: Number(raw.StudentID ?? raw.studentId), userId: Number(raw.UserID ?? raw.userId),
    fullName: String(raw.FullName ?? raw.fullName ?? ''), email: String(raw.Email ?? raw.email ?? ''),
    phone: text(raw, 'Phone', 'phone'), aadharNumber: text(raw, 'AadharNumber', 'aadharNumber'),
    dob: text(raw, 'DOB', 'dob'), gender: text(raw, 'Gender', 'gender'), category: text(raw, 'Category', 'category'),
    address: text(raw, 'Address', 'address'), city: text(raw, 'City', 'city'), state: text(raw, 'State', 'state'),
    pincode: text(raw, 'Pincode', 'pincode'), annualFamilyIncome: number(raw, 'AnnualFamilyIncome', 'annualFamilyIncome'),
    familySize: number(raw, 'FamilySize', 'familySize'), course: text(raw, 'Course', 'course'),
    institutionId: number(raw, 'InstitutionID', 'institutionId'),
    otherInstitutionName: text(raw, 'OtherInstitutionName', 'otherInstitutionName'),
    institutionName: text(raw, 'InstitutionName', 'institutionName'), enrollmentYear: number(raw, 'EnrollmentYear', 'enrollmentYear'),
    bankAccountNo: text(raw, 'BankAccountNo', 'bankAccountNo'), bankIFSC: text(raw, 'BankIFSC', 'bankIFSC'),
    bankName: text(raw, 'BankName', 'bankName'), bankBranch: text(raw, 'BankBranch', 'bankBranch'),
    previousYearMarks: number(raw, 'PreviousYearMarks', 'previousYearMarks'),
    tenthBoardName: text(raw, 'TenthBoardName', 'tenthBoardName'), tenthPassingYear: number(raw, 'TenthPassingYear', 'tenthPassingYear'),
    tenthMarks: number(raw, 'TenthMarks', 'tenthMarks'), twelfthBoardName: text(raw, 'TwelfthBoardName', 'twelfthBoardName'),
    twelfthPassingYear: number(raw, 'TwelfthPassingYear', 'twelfthPassingYear'), twelfthMarks: number(raw, 'TwelfthMarks', 'twelfthMarks'),
    currentSemesterOrYear: text(raw, 'CurrentSemesterOrYear', 'currentSemesterOrYear'),
    admissionRegistrationNo: text(raw, 'AdmissionRegistrationNo', 'admissionRegistrationNo'),
    fatherName: text(raw, 'FatherName', 'fatherName'), fatherOccupation: text(raw, 'FatherOccupation', 'fatherOccupation'),
    motherName: text(raw, 'MotherName', 'motherName'), motherOccupation: text(raw, 'MotherOccupation', 'motherOccupation'),
    religion: text(raw, 'Religion', 'religion'), isDisabled: bool(raw, 'IsDisabled', 'isDisabled'),
    disabilityPercentage: number(raw, 'DisabilityPercentage', 'disabilityPercentage'),
    domicileState: text(raw, 'DomicileState', 'domicileState'), domicileDistrict: text(raw, 'DomicileDistrict', 'domicileDistrict'),
    tuitionFee: number(raw, 'TuitionFee', 'tuitionFee'), casteCertificateNumber: text(raw, 'CasteCertificateNumber', 'casteCertificateNumber'),
    casteCertificateIssueDate: text(raw, 'CasteCertificateIssueDate', 'casteCertificateIssueDate'),
    domicileCertificateNumber: text(raw, 'DomicileCertificateNumber', 'domicileCertificateNumber'),
    alternatePhone: text(raw, 'AlternatePhone', 'alternatePhone'), isHosteller: bool(raw, 'IsHosteller', 'isHosteller'),
    distanceFromHome: number(raw, 'DistanceFromHome', 'distanceFromHome'), hasGapYear: bool(raw, 'HasGapYear', 'hasGapYear'),
    gapYearExplanation: text(raw, 'GapYearExplanation', 'gapYearExplanation'),
    receivedPreviousScholarship: bool(raw, 'ReceivedPreviousScholarship', 'receivedPreviousScholarship'),
    previousScholarshipName: text(raw, 'PreviousScholarshipName', 'previousScholarshipName'),
    previousScholarshipAmount: number(raw, 'PreviousScholarshipAmount', 'previousScholarshipAmount'),
    previousScholarshipYear: number(raw, 'PreviousScholarshipYear', 'previousScholarshipYear'),
    isAadhaarLinkedToBank: bool(raw, 'IsAadhaarLinkedToBank', 'isAadhaarLinkedToBank'),
    isEKYCVerified: bool(raw, 'IsEKYCVerified', 'isEKYCVerified'), statementOfPurpose: text(raw, 'StatementOfPurpose', 'statementOfPurpose'),
    extracurricularActivities: text(raw, 'ExtracurricularActivities', 'extracurricularActivities'),
    permanentAddress: text(raw, 'PermanentAddress', 'permanentAddress'), permanentCity: text(raw, 'PermanentCity', 'permanentCity'),
    permanentState: text(raw, 'PermanentState', 'permanentState'), permanentPincode: text(raw, 'PermanentPincode', 'permanentPincode'),
    isPermanentSameAsCurrent: bool(raw, 'IsPermanentSameAsCurrent', 'isPermanentSameAsCurrent'),
    currentAddressDurationMonths: number(raw, 'CurrentAddressDurationMonths', 'currentAddressDurationMonths'),
    numberOfSiblings: number(raw, 'NumberOfSiblings', 'numberOfSiblings'), siblingDetails: raw.SiblingDetails ?? raw.siblingDetails,
    profileCompletion: number(raw, 'ProfileCompletion', 'profileCompletion') ?? 0,
    profileSections: (raw.ProfileSections ?? raw.profileSections) as Array<{ label: string; complete: boolean }> | undefined,
    missingProfileSections: (raw.MissingProfileSections ?? raw.missingProfileSections) as string[] | undefined,
  };
}

export function mapInstitution(raw: Raw): Institution {
  return { institutionId: Number(raw.InstitutionID ?? raw.institutionId), name: String(raw.Name ?? raw.name ?? ''),
    type: String(raw.Type ?? raw.type ?? ''), district: String(raw.District ?? raw.district ?? ''),
    state: String(raw.State ?? raw.state ?? '') };
}

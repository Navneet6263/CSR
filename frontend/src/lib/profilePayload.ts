import type { StudentProfile } from '@/types';
import { INITIAL_FORM, type ProfileFormState } from './profileForm';

const value = (input: string) => input.trim() || undefined;
const number = (input: string) => input.trim() ? Number(input) : undefined;
const title = (input: string) => input ? `${input[0].toUpperCase()}${input.slice(1).toLowerCase()}` : undefined;

export function studentToForm(data: StudentProfile): ProfileFormState {
  return {
    ...INITIAL_FORM,
    phone: data.phone ?? '', altPhone: data.alternatePhone ?? '', aadhaar: data.aadharNumber ?? '',
    dob: data.dob ? new Date(data.dob).toISOString().slice(0, 10) : '', gender: data.gender?.toLowerCase() ?? '',
    category: data.category ?? '', curHouse: data.address ?? '', curCity: data.city ?? '', curState: data.state ?? '',
    curPincode: data.pincode ?? '', curMonths: String(data.currentAddressDurationMonths ?? ''),
    sameAddress: data.isPermanentSameAsCurrent ?? false, permHouse: data.permanentAddress ?? '',
    permCity: data.permanentCity ?? '', permState: data.permanentState ?? '', permPincode: data.permanentPincode ?? '',
    fatherName: data.fatherName ?? '', fatherOccupation: data.fatherOccupation ?? '', motherName: data.motherName ?? '',
    motherOccupation: data.motherOccupation ?? '', siblings: String(data.numberOfSiblings ?? 0),
    familySize: String(data.familySize ?? ''), annualIncome: String(data.annualFamilyIncome ?? ''), religion: data.religion ?? '',
    disability: data.isDisabled ? 'yes' : 'no', disabilityPercent: String(data.disabilityPercentage ?? ''),
    domicileState: data.domicileState ?? '', domicileDistrict: data.domicileDistrict ?? '',
    casteCertNo: data.casteCertificateNumber ?? '', casteCertDate: data.casteCertificateIssueDate?.slice(0, 10) ?? '',
    domicileCertNo: data.domicileCertificateNumber ?? '', board10: data.tenthBoardName ?? '',
    year10: String(data.tenthPassingYear ?? ''), marks10: String(data.tenthMarks ?? ''), board12: data.twelfthBoardName ?? '',
    year12: String(data.twelfthPassingYear ?? ''), marks12: String(data.twelfthMarks ?? ''),
    college: String(data.institutionId ?? ''), course: data.course ?? '', semester: data.currentSemesterOrYear ?? '',
    regNo: data.admissionRegistrationNo ?? '', prevMarks: String(data.previousYearMarks ?? ''),
    accommodation: data.isHosteller ? 'hostel' : 'home', distanceKm: String(data.distanceFromHome ?? ''),
    gapYear: data.hasGapYear ? 'yes' : 'no', gapReason: data.gapYearExplanation ?? '',
    prevScholarship: data.receivedPreviousScholarship ? 'yes' : 'no',
    prevScholarshipName: data.previousScholarshipName ?? '',
    prevScholarshipAmount: String(data.previousScholarshipAmount ?? ''),
    prevScholarshipYear: String(data.previousScholarshipYear ?? ''), bankAccount: data.bankAccountNo ?? '',
    ifsc: data.bankIFSC ?? '', bankName: data.bankName ?? '', branch: data.bankBranch ?? '', sop: data.statementOfPurpose ?? '',
  };
}

export function profileUpdatePayload(form: ProfileFormState): Partial<StudentProfile> {
  return {
    phone: value(form.phone), alternatePhone: value(form.altPhone), aadharNumber: value(form.aadhaar),
    dob: value(form.dob), gender: title(form.gender), category: value(form.category), address: value(form.curHouse),
    city: value(form.curCity), state: value(form.curState), pincode: value(form.curPincode),
    currentAddressDurationMonths: number(form.curMonths), isPermanentSameAsCurrent: form.sameAddress,
    permanentAddress: value(form.permHouse), permanentCity: value(form.permCity), permanentState: value(form.permState),
    permanentPincode: value(form.permPincode), fatherName: value(form.fatherName),
    fatherOccupation: value(form.fatherOccupation), motherName: value(form.motherName), motherOccupation: value(form.motherOccupation),
    numberOfSiblings: number(form.siblings), familySize: number(form.familySize), annualFamilyIncome: number(form.annualIncome),
    religion: value(form.religion), isDisabled: form.disability === 'yes', disabilityPercentage: number(form.disabilityPercent),
    domicileState: value(form.domicileState), domicileDistrict: value(form.domicileDistrict),
    casteCertificateNumber: value(form.casteCertNo), casteCertificateIssueDate: value(form.casteCertDate),
    domicileCertificateNumber: value(form.domicileCertNo), tenthBoardName: value(form.board10),
    tenthPassingYear: number(form.year10), tenthMarks: number(form.marks10), twelfthBoardName: value(form.board12),
    twelfthPassingYear: number(form.year12), twelfthMarks: number(form.marks12),
    institutionId: form.college ? Number(form.college) : undefined, course: value(form.course),
    currentSemesterOrYear: value(form.semester), admissionRegistrationNo: value(form.regNo),
    previousYearMarks: number(form.prevMarks), isHosteller: form.accommodation === 'hostel',
    distanceFromHome: number(form.distanceKm), hasGapYear: form.gapYear === 'yes',
    gapYearExplanation: value(form.gapReason), receivedPreviousScholarship: form.prevScholarship === 'yes',
    previousScholarshipName: value(form.prevScholarshipName), previousScholarshipAmount: number(form.prevScholarshipAmount),
    previousScholarshipYear: number(form.prevScholarshipYear), bankAccountNo: value(form.bankAccount),
    bankIFSC: value(form.ifsc), bankName: value(form.bankName), bankBranch: value(form.branch),
    statementOfPurpose: value(form.sop),
  };
}

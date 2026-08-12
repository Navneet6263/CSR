// Profile completion form schema, state shape, and helpers.
import { DOC_LIST, type DocKey } from './profileDocuments';
export { DOC_LIST } from './profileDocuments';
export type { DocKey } from './profileDocuments';

export type SectionId =
  | "personal"
  | "family"
  | "education"
  | "bank"
  | "sop"
  | "documents";

export interface SectionMeta {
  id: SectionId;
  title: string;
  subtitle: string;
  weight: number; // contribution to total completion (sums to 100)
}

export const SECTIONS: SectionMeta[] = [
  { id: "personal", title: "Personal Details", subtitle: "Identity & address", weight: 18 },
  { id: "family", title: "Family & Demographics", subtitle: "Background check", weight: 18 },
  { id: "education", title: "Education Background", subtitle: "Academic merit", weight: 18 },
  { id: "bank", title: "Bank Details", subtitle: "For DBT transfer", weight: 12 },
  { id: "sop", title: "Statement of Purpose", subtitle: "Your story for sponsors", weight: 10 },
  { id: "documents", title: "Documents", subtitle: "Upload all required proofs", weight: 24 },
];

export interface ProfileFormState {
  // Personal
  phone: string;
  altPhone: string;
  aadhaar: string;
  dob: string;
  gender: string;
  category: string;
  curHouse: string;
  curCity: string;
  curState: string;
  curPincode: string;
  curMonths: string;
  sameAddress: boolean;
  permHouse: string;
  permCity: string;
  permState: string;
  permPincode: string;

  // Family
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  siblings: string;
  familySize: string;
  annualIncome: string;
  religion: string;
  disability: string;
  disabilityPercent: string;
  domicileState: string;
  domicileDistrict: string;
  casteCertNo: string;
  casteCertDate: string;
  domicileCertNo: string;

  // Education
  board10: string;
  year10: string;
  marks10: string;
  board12: string;
  year12: string;
  marks12: string;
  college: string;
  course: string;
  semester: string;
  regNo: string;
  prevMarks: string;
  accommodation: string;
  distanceKm: string;
  gapYear: string;
  gapReason: string;
  prevScholarship: string;
  prevScholarshipName: string;
  prevScholarshipAmount: string;
  prevScholarshipYear: string;

  // Bank
  bankAccount: string;
  ifsc: string;
  bankName: string;
  branch: string;

  // SOP
  sop: string;

  // Documents — boolean uploaded map
  documents: Record<DocKey, boolean>;
}

export const INITIAL_FORM: ProfileFormState = {
  phone: "",
  altPhone: "",
  aadhaar: "",
  dob: "",
  gender: "",
  category: "",
  curHouse: "",
  curCity: "",
  curState: "",
  curPincode: "",
  curMonths: "",
  sameAddress: false,
  permHouse: "",
  permCity: "",
  permState: "",
  permPincode: "",
  fatherName: "",
  fatherOccupation: "",
  motherName: "",
  motherOccupation: "",
  siblings: "",
  familySize: "",
  annualIncome: "",
  religion: "",
  disability: "",
  disabilityPercent: "",
  domicileState: "",
  domicileDistrict: "",
  casteCertNo: "",
  casteCertDate: "",
  domicileCertNo: "",
  board10: "",
  year10: "",
  marks10: "",
  board12: "",
  year12: "",
  marks12: "",
  college: "",
  course: "",
  semester: "",
  regNo: "",
  prevMarks: "",
  accommodation: "",
  distanceKm: "",
  gapYear: "",
  gapReason: "",
  prevScholarship: "",
  prevScholarshipName: "",
  prevScholarshipAmount: "",
  prevScholarshipYear: "",
  bankAccount: "",
  ifsc: "",
  bankName: "",
  branch: "",
  sop: "",
  documents: {
    aadhaar_card: false,
    photo: false,
    income_cert: false,
    caste_cert: false,
    domicile_cert: false,
    marksheet_10: false,
    marksheet_12: false,
    bonafide: false,
    passbook: false,
    recommendation: false,
    father_aadhaar: false,
    mother_aadhaar: false,
    father_payslip: false,
    bank_statement: false,
  },
};

const SECTION_FIELDS: Record<Exclude<SectionId, "documents">, (keyof ProfileFormState)[]> = {
  personal: ["phone", "altPhone", "aadhaar", "dob", "gender", "category", "curHouse", "curCity", "curState", "curPincode", "curMonths"],
  family: ["fatherName", "fatherOccupation", "motherName", "motherOccupation", "siblings", "familySize", "annualIncome", "religion", "domicileState", "domicileDistrict"],
  education: ["board10", "year10", "marks10", "board12", "year12", "marks12", "college", "course", "semester", "regNo", "prevMarks", "accommodation", "distanceKm"],
  bank: ["bankAccount", "ifsc", "bankName", "branch"],
  sop: ["sop"],
};

export function sectionCompletion(form: ProfileFormState, id: SectionId): number {
  if (id === "documents") {
    const required = DOC_LIST.filter((d) => d.required);
    const done = required.filter((d) => form.documents[d.id]).length;
    return Math.round((done / required.length) * 100);
  }
  const fields = SECTION_FIELDS[id];
  const filled = fields.filter((f) => {
    const v = form[f];
    return typeof v === "string" ? v.trim().length > 0 : Boolean(v);
  }).length;
  return Math.round((filled / fields.length) * 100);
}

export function overallCompletion(form: ProfileFormState): number {
  const total = SECTIONS.reduce((sum, s) => sum + (sectionCompletion(form, s.id) / 100) * s.weight, 0);
  return Math.round(total);
}

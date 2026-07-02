// Profile completion form schema, state shape, and helpers.

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
  prevScholarshipDetails: string;

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

export type DocKey =
  | "aadhaar_card"
  | "photo"
  | "income_cert"
  | "caste_cert"
  | "domicile_cert"
  | "marksheet_10"
  | "marksheet_12"
  | "bonafide"
  | "passbook"
  | "recommendation"
  | "father_aadhaar"
  | "mother_aadhaar"
  | "father_payslip"
  | "bank_statement";

export const DOC_LIST: { id: DocKey; name: string; hint: string; required: boolean }[] = [
  { id: "aadhaar_card", name: "Aadhaar Card", hint: "Front + back, clear scan", required: true },
  { id: "photo", name: "Passport Photo", hint: "Recent colour, white bg", required: true },
  { id: "income_cert", name: "Income Certificate", hint: "BPL / Ration / ITR", required: true },
  { id: "caste_cert", name: "Caste Certificate", hint: "SC / ST / OBC if applicable", required: false },
  { id: "domicile_cert", name: "Domicile Certificate", hint: "State proof", required: true },
  { id: "marksheet_10", name: "10th Marksheet", hint: "Board issued", required: true },
  { id: "marksheet_12", name: "12th Marksheet", hint: "Board issued", required: true },
  { id: "bonafide", name: "Bonafide Certificate", hint: "From current college", required: true },
  { id: "passbook", name: "Bank Passbook / Cheque", hint: "Front page with IFSC", required: true },
  { id: "recommendation", name: "Recommendation Letter", hint: "Principal / teacher", required: false },
  { id: "father_aadhaar", name: "Father's Aadhaar", hint: "Clear scan", required: true },
  { id: "mother_aadhaar", name: "Mother's Aadhaar", hint: "Clear scan", required: true },
  { id: "father_payslip", name: "Father's Payslip", hint: "If salaried", required: false },
  { id: "bank_statement", name: "6 Months Bank Statement", hint: "PDF from bank", required: false },
];

export const INITIAL_FORM: ProfileFormState = {
  phone: "9876543210",
  altPhone: "",
  aadhaar: "",
  dob: "2003-06-14",
  gender: "male",
  category: "OBC",
  curHouse: "",
  curCity: "Pune",
  curState: "Maharashtra",
  curPincode: "",
  curMonths: "",
  sameAddress: true,
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
  annualIncome: "240000",
  religion: "",
  disability: "no",
  disabilityPercent: "",
  domicileState: "Maharashtra",
  domicileDistrict: "",
  casteCertNo: "",
  casteCertDate: "",
  domicileCertNo: "",
  board10: "CBSE",
  year10: "2019",
  marks10: "88",
  board12: "CBSE",
  year12: "2021",
  marks12: "82",
  college: "COEP Pune",
  course: "B.Tech",
  semester: "5",
  regNo: "",
  prevMarks: "",
  accommodation: "",
  distanceKm: "",
  gapYear: "no",
  gapReason: "",
  prevScholarship: "no",
  prevScholarshipDetails: "",
  bankAccount: "",
  ifsc: "",
  bankName: "",
  branch: "",
  sop: "",
  documents: {
    aadhaar_card: true,
    photo: true,
    income_cert: false,
    caste_cert: true,
    domicile_cert: false,
    marksheet_10: true,
    marksheet_12: true,
    bonafide: true,
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

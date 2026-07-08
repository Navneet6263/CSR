export type DocStatus = "Pending" | "Verified" | "ReUploadRequested" | "Rejected";

export interface Student {
  id: string;
  fullName: string;
  dob: string;
  gender: string;
  category: "Gen" | "SC" | "ST" | "OBC";
  aadhar: string;
  income: string;
  bank: { acc: string; ifsc: string; name: string };
  scores: { tenth: string; twelfth: string; current: string };
  disability?: string;
  state: string;
  district: string;
}

export interface DocItem {
  key: string;
  label: string;
  verifies: string;
  status: DocStatus;
  reason?: string;
  required: boolean;
}

export interface Application {
  id: string;
  scholarship: string;
  submitted: string;
  status: "DocAuditInProgress" | "BGCheckInProgress" | "Verified";
  student: Student;
  documents: DocItem[];
}

const baseDocs = (cat: Student["category"]): DocItem[] => [
  { key: "aadhaar_s", label: "Student Aadhaar Card", verifies: "Name, DOB, Aadhar Number", status: "Pending", required: true },
  { key: "aadhaar_p", label: "Father / Mother Aadhaar Card", verifies: "Parent identity", status: "Pending", required: true },
  { key: "income", label: "Income Certificate / Payslip", verifies: "Annual Family Income", status: "Pending", required: true },
  { key: "tenth", label: "10th Class Marksheet", verifies: "10th Marks", status: "Pending", required: true },
  { key: "twelfth", label: "12th Class Marksheet", verifies: "12th Marks", status: "Pending", required: true },
  { key: "bank", label: "Bank Statement / Passbook", verifies: "Account No & IFSC", status: "Pending", required: true },
  { key: "caste", label: "Caste Certificate", verifies: "Category proof", status: "Pending", required: cat !== "Gen" },
  { key: "domicile", label: "Domicile Certificate", verifies: "State / District", status: "Pending", required: true },
  { key: "fee", label: "College Fee Receipt / Admission Letter", verifies: "Current enrollment", status: "Pending", required: true },
];

const s = (over: Partial<Student> & { id: string; fullName: string; category: Student["category"] }): Student => ({
  dob: "2004-08-14", gender: "Male", aadhar: "5421 8834 9021",
  income: "₹2,40,000", bank: { acc: "50100XXXXXX21", ifsc: "HDFC0001234", name: "HDFC Bank" },
  scores: { tenth: "94.2%", twelfth: "89.6%", current: "B.Tech · Sem 3" },
  state: "Maharashtra", district: "Pune", ...over,
});

export const applications: Application[] = [
  { id: "APP-2041", scholarship: "Tata Rising Stars", submitted: "2026-06-28", status: "DocAuditInProgress",
    student: s({ id: "STU-991", fullName: "Aarav Sharma", category: "OBC" }), documents: baseDocs("OBC") },
  { id: "APP-2042", scholarship: "Infosys Merit Grant", submitted: "2026-06-28", status: "DocAuditInProgress",
    student: s({ id: "STU-992", fullName: "Priya Iyer", category: "Gen", gender: "Female", income: "₹3,10,000" }), documents: baseDocs("Gen") },
  { id: "APP-2043", scholarship: "Reliance Foundation", submitted: "2026-06-27", status: "DocAuditInProgress",
    student: s({ id: "STU-993", fullName: "Rohan Verma", category: "SC", disability: "42%" }), documents: baseDocs("SC") },
  { id: "APP-2044", scholarship: "Tata Rising Stars", submitted: "2026-06-27", status: "DocAuditInProgress",
    student: s({ id: "STU-994", fullName: "Meera Nair", category: "ST", gender: "Female", state: "Kerala", district: "Kochi" }), documents: baseDocs("ST") },
  { id: "APP-2045", scholarship: "Wipro Cares", submitted: "2026-06-26", status: "DocAuditInProgress",
    student: s({ id: "STU-995", fullName: "Kabir Khan", category: "Gen" }), documents: baseDocs("Gen") },
  { id: "APP-2046", scholarship: "Infosys Merit Grant", submitted: "2026-06-26", status: "DocAuditInProgress",
    student: s({ id: "STU-996", fullName: "Ananya Rao", category: "OBC", gender: "Female" }), documents: baseDocs("OBC") },
  { id: "APP-2047", scholarship: "Reliance Foundation", submitted: "2026-06-25", status: "DocAuditInProgress",
    student: s({ id: "STU-997", fullName: "Vikram Singh", category: "Gen" }), documents: baseDocs("Gen") },
];

export const stats = {
  pending: 42, verifiedToday: 18, reuploads: 6, avgTime: "4m 12s",
};

export const scholarships = ["All Scholarships", "Tata Rising Stars", "Infosys Merit Grant", "Reliance Foundation", "Wipro Cares"];

export const auditHistory = [
  { id: "AUD-8821", app: "APP-2033", student: "Ishaan Gupta", action: "Verified", doc: "All", by: "You", at: "2026-07-01 16:24" },
  { id: "AUD-8820", app: "APP-2032", student: "Neha Kapoor", action: "Re-upload", doc: "Income Cert.", by: "You", at: "2026-07-01 15:58" },
  { id: "AUD-8819", app: "APP-2031", student: "Arjun Mehta", action: "Verified", doc: "All", by: "You", at: "2026-07-01 15:12" },
  { id: "AUD-8818", app: "APP-2030", student: "Sara Ali", action: "Rejected", doc: "Caste Cert.", by: "You", at: "2026-07-01 14:41" },
  { id: "AUD-8817", app: "APP-2029", student: "Dev Patel", action: "Verified", doc: "All", by: "You", at: "2026-07-01 13:19" },
];

export type ScreeningStatus = "ScreeningPending" | "Approved" | "Rejected";

export interface Application {
  id: string;
  name: string;
  scholarship: string;
  meritScore: number;
  income: number;
  marks10: number;
  marks12: number;
  status: ScreeningStatus;
  submittedAt: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  category: "GEN" | "SC" | "ST" | "OBC";
  aadhar: string;
  phone: string;
  altPhone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  fatherName: string;
  motherName: string;
  familySize: number;
  board10: string;
  board12: string;
  course: string;
  enrollmentYear: number;
  currentSemester: string;
  semesterMarks: number;
  tuitionFee: number;
  cutoff: { minMarks12: number; maxIncome: number };
  fieldReport: {
    houseVisited: boolean;
    familyMet: boolean;
    collegeIdMatched: boolean;
    notes: string;
    officer: string;
  };
  documents: { name: string; verified: boolean }[];
}

const DOCS = [
  "Student Aadhaar Card",
  "Father / Mother Aadhaar Card",
  "Income Certificate / Father's Payslip",
  "10th Class Marksheet",
  "12th Class Marksheet",
  "Bank Statement (6 Months)",
  "Caste Certificate",
  "Domicile Certificate",
  "Current College Fee Receipt",
].map((name) => ({ name, verified: true }));

export const APPLICATIONS: Application[] = [
  {
    id: "TB-2026-00841", name: "Aarav Sharma", scholarship: "Tata CSR Merit Grant",
    meritScore: 92, income: 185000, marks10: 94, marks12: 91, status: "ScreeningPending",
    submittedAt: "2026-07-02", dob: "2005-03-14", gender: "Male", category: "OBC",
    aadhar: "5421 8834 1092", phone: "+91 98211 44012", altPhone: "+91 98765 11223",
    email: "aarav.sharma@student.in", address: "H.No 214, Gali No. 7, Sector 12",
    city: "Jaipur", state: "Rajasthan", pincode: "302017",
    fatherName: "Ramesh Sharma", motherName: "Sunita Sharma", familySize: 5,
    board10: "CBSE", board12: "CBSE", course: "B.Tech Computer Science",
    enrollmentYear: 2024, currentSemester: "Sem 4", semesterMarks: 88, tuitionFee: 95000,
    cutoff: { minMarks12: 75, maxIncome: 300000 },
    fieldReport: { houseVisited: true, familyMet: true, collegeIdMatched: true,
      notes: "Student lives in a kutcha house, income claim is genuine.", officer: "R. Meena" },
    documents: DOCS,
  },
  {
    id: "TB-2026-00842", name: "Priya Reddy", scholarship: "Infosys Foundation STEM",
    meritScore: 85, income: 240000, marks10: 88, marks12: 84, status: "ScreeningPending",
    submittedAt: "2026-07-02", dob: "2004-11-02", gender: "Female", category: "SC",
    aadhar: "6612 8890 4451", phone: "+91 90123 55611", altPhone: "+91 87788 22110",
    email: "priya.reddy@student.in", address: "Plot 88, Banjara Hills Road No. 3",
    city: "Hyderabad", state: "Telangana", pincode: "500034",
    fatherName: "Krishna Reddy", motherName: "Lakshmi Reddy", familySize: 4,
    board10: "TS SSC", board12: "TS Intermediate", course: "B.Sc Biotechnology",
    enrollmentYear: 2023, currentSemester: "Sem 6", semesterMarks: 82, tuitionFee: 72000,
    cutoff: { minMarks12: 75, maxIncome: 300000 },
    fieldReport: { houseVisited: true, familyMet: true, collegeIdMatched: true,
      notes: "Family cooperative, documents cross-verified with panchayat.", officer: "S. Kumar" },
    documents: DOCS,
  },
  {
    id: "TB-2026-00843", name: "Mohammed Iqbal", scholarship: "Wipro Cares Engineering",
    meritScore: 78, income: 155000, marks10: 82, marks12: 79, status: "ScreeningPending",
    submittedAt: "2026-07-01", dob: "2005-06-21", gender: "Male", category: "GEN",
    aadhar: "7781 2245 9012", phone: "+91 99887 12009", altPhone: "+91 98876 55231",
    email: "m.iqbal@student.in", address: "22-A, Nagpada, Byculla",
    city: "Mumbai", state: "Maharashtra", pincode: "400008",
    fatherName: "Salim Ahmed", motherName: "Fatima Begum", familySize: 6,
    board10: "Maharashtra Board", board12: "Maharashtra Board", course: "B.E. Mechanical",
    enrollmentYear: 2024, currentSemester: "Sem 4", semesterMarks: 75, tuitionFee: 68000,
    cutoff: { minMarks12: 75, maxIncome: 300000 },
    fieldReport: { houseVisited: true, familyMet: true, collegeIdMatched: true,
      notes: "Single earner household. Father works as a tailor.", officer: "A. Khan" },
    documents: DOCS,
  },
  {
    id: "TB-2026-00844", name: "Ananya Nair", scholarship: "Tata CSR Merit Grant",
    meritScore: 88, income: 275000, marks10: 90, marks12: 87, status: "ScreeningPending",
    submittedAt: "2026-07-01", dob: "2004-09-30", gender: "Female", category: "GEN",
    aadhar: "3312 7788 1145", phone: "+91 97400 33221", altPhone: "+91 88991 00112",
    email: "ananya.nair@student.in", address: "Flat 3B, Palm Grove Apts, MG Road",
    city: "Kochi", state: "Kerala", pincode: "682016",
    fatherName: "Rajeev Nair", motherName: "Meera Nair", familySize: 4,
    board10: "Kerala Board", board12: "Kerala Board", course: "B.Com Honors",
    enrollmentYear: 2023, currentSemester: "Sem 6", semesterMarks: 84, tuitionFee: 55000,
    cutoff: { minMarks12: 75, maxIncome: 300000 },
    fieldReport: { houseVisited: true, familyMet: true, collegeIdMatched: true,
      notes: "Rented single-room accommodation. Verified via landlord.", officer: "L. Pillai" },
    documents: DOCS,
  },
  {
    id: "TB-2026-00845", name: "Vikram Singh", scholarship: "Reliance Foundation Undergrad",
    meritScore: 71, income: 140000, marks10: 76, marks12: 72, status: "ScreeningPending",
    submittedAt: "2026-06-30", dob: "2005-01-11", gender: "Male", category: "ST",
    aadhar: "9921 4478 3312", phone: "+91 91123 88400", altPhone: "+91 87001 22345",
    email: "vikram.singh@student.in", address: "Village Kanota, Tehsil Amber",
    city: "Jaipur", state: "Rajasthan", pincode: "303012",
    fatherName: "Balbir Singh", motherName: "Kaushalya Devi", familySize: 7,
    board10: "RBSE", board12: "RBSE", course: "B.A. Political Science",
    enrollmentYear: 2024, currentSemester: "Sem 4", semesterMarks: 70, tuitionFee: 32000,
    cutoff: { minMarks12: 75, maxIncome: 300000 },
    fieldReport: { houseVisited: true, familyMet: true, collegeIdMatched: true,
      notes: "First graduate in the family. Genuine case, low income.", officer: "R. Meena" },
    documents: DOCS,
  },
  {
    id: "TB-2026-00846", name: "Sneha Kulkarni", scholarship: "Infosys Foundation STEM",
    meritScore: 95, income: 210000, marks10: 96, marks12: 94, status: "ScreeningPending",
    submittedAt: "2026-06-30", dob: "2004-12-18", gender: "Female", category: "GEN",
    aadhar: "1122 8899 6633", phone: "+91 90045 77812", altPhone: "+91 91100 44520",
    email: "sneha.k@student.in", address: "Row House 12, Kothrud Depot",
    city: "Pune", state: "Maharashtra", pincode: "411038",
    fatherName: "Anil Kulkarni", motherName: "Vaishali Kulkarni", familySize: 4,
    board10: "SSC Maharashtra", board12: "HSC Maharashtra", course: "B.Tech AI & DS",
    enrollmentYear: 2023, currentSemester: "Sem 6", semesterMarks: 93, tuitionFee: 110000,
    cutoff: { minMarks12: 75, maxIncome: 300000 },
    fieldReport: { houseVisited: true, familyMet: true, collegeIdMatched: true,
      notes: "Top rank in college. Father recently lost job.", officer: "P. Deshmukh" },
    documents: DOCS,
  },
];

export const DECISIONS_HISTORY = [
  { id: "TB-2026-00812", name: "Rohan Verma", decision: "Approved", score: 89, date: "2026-06-28", remarks: "Excellent academic record, genuine need." },
  { id: "TB-2026-00815", name: "Kavya Iyer", decision: "Approved", score: 91, date: "2026-06-28", remarks: "Meets all criteria." },
  { id: "TB-2026-00819", name: "Deepak Yadav", decision: "Rejected", score: 62, date: "2026-06-27", remarks: "12th marks below cutoff (72%)." },
  { id: "TB-2026-00821", name: "Ishita Bose", decision: "Approved", score: 87, date: "2026-06-27", remarks: "Strong background verification." },
  { id: "TB-2026-00824", name: "Arjun Patel", decision: "Rejected", score: 55, date: "2026-06-26", remarks: "Income exceeds threshold." },
];

export const findApplication = (id: string) => APPLICATIONS.find((a) => a.id === id);

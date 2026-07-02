import type { StudentProfile } from "./mockData";

export type ScholarshipCategory =
  | "Merit"
  | "STEM"
  | "Women"
  | "Rural"
  | "Arts"
  | "Need-based"
  | "Minority";

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: number; // INR
  deadline: string; // ISO date
  category: ScholarshipCategory;
  classLevels: Array<StudentProfile["classLevel"]>;
  streams?: Array<StudentProfile["stream"]>;
  genders?: Array<StudentProfile["gender"]>;
  maxIncome?: number;
  categories?: Array<StudentProfile["category"]>;
  tags: string[];
  description: string;
}

export const scholarships: Scholarship[] = [
  {
    id: "sc-001",
    title: "Merit Excellence Grant",
    provider: "TalentBridge Foundation",
    amount: 25000,
    deadline: "2026-08-15",
    category: "Merit",
    classLevels: ["12", "UG", "PG"],
    tags: ["Top 10%", "All streams"],
    description: "For students with consistent academic excellence across all streams.",
  },
  {
    id: "sc-002",
    title: "STEM Future Leaders",
    provider: "InnovateIndia CSR",
    amount: 50000,
    deadline: "2026-07-30",
    category: "STEM",
    classLevels: ["UG", "PG"],
    streams: ["Engineering", "Science"],
    tags: ["Engineering", "Research"],
    description: "Supports undergraduate and postgraduate STEM scholars pursuing research.",
  },
  {
    id: "sc-003",
    title: "Women in Tech Scholarship",
    provider: "She Codes Trust",
    amount: 35000,
    deadline: "2026-09-10",
    category: "Women",
    classLevels: ["UG", "PG"],
    streams: ["Engineering", "Science"],
    genders: ["female"],
    tags: ["Women-only", "Tech"],
    description: "Empowering women pursuing engineering and computer science degrees.",
  },
  {
    id: "sc-004",
    title: "Rural Empowerment Award",
    provider: "Bharat Rural Mission",
    amount: 15000,
    deadline: "2026-08-05",
    category: "Rural",
    classLevels: ["10", "12", "UG"],
    maxIncome: 300000,
    tags: ["Rural", "Low income"],
    description: "Financial aid for students from rural backgrounds with limited income.",
  },
  {
    id: "sc-005",
    title: "Arts & Culture Fund",
    provider: "Kala Bharti Trust",
    amount: 10000,
    deadline: "2026-10-01",
    category: "Arts",
    classLevels: ["12", "UG"],
    streams: ["Arts"],
    tags: ["Arts", "Culture"],
    description: "Encouraging students pursuing fine arts, music, and performing arts.",
  },
  {
    id: "sc-006",
    title: "OBC Higher Education Grant",
    provider: "Equal Access Foundation",
    amount: 22000,
    deadline: "2026-09-25",
    category: "Need-based",
    classLevels: ["UG", "PG"],
    categories: ["OBC", "SC", "ST"],
    maxIncome: 350000,
    tags: ["Reserved category"],
    description: "Supports OBC/SC/ST students enrolled in higher education programs.",
  },
  {
    id: "sc-007",
    title: "Commerce Champions Bursary",
    provider: "FinScholar India",
    amount: 18000,
    deadline: "2026-08-20",
    category: "Merit",
    classLevels: ["12", "UG"],
    streams: ["Commerce"],
    tags: ["Commerce", "Finance"],
    description: "Awarded to top commerce students aspiring to careers in finance.",
  },
  {
    id: "sc-008",
    title: "Class 10 Toppers Award",
    provider: "Pratibha Trust",
    amount: 8000,
    deadline: "2026-07-15",
    category: "Merit",
    classLevels: ["10"],
    tags: ["School", "Merit"],
    description: "A starter scholarship for outstanding Class 10 board exam performers.",
  },
];

export interface MatchResult {
  matched: boolean;
  score: number; // 0-100
  reasons: string[];
  blockers: string[];
}

export function evaluateMatch(s: Scholarship, p: StudentProfile): MatchResult {
  const reasons: string[] = [];
  const blockers: string[] = [];

  if (s.classLevels.includes(p.classLevel)) reasons.push(`Open to ${p.classLevel}`);
  else blockers.push(`Requires ${s.classLevels.join("/")}`);

  if (s.streams) {
    if (s.streams.includes(p.stream)) reasons.push(`${p.stream} eligible`);
    else blockers.push(`Stream: ${s.streams.join(", ")}`);
  }
  if (s.genders) {
    if (s.genders.includes(p.gender)) reasons.push("Gender criteria met");
    else blockers.push(`Open to ${s.genders.join("/")}`);
  }
  if (s.maxIncome !== undefined) {
    if (p.annualIncome <= s.maxIncome) reasons.push("Income within limit");
    else blockers.push(`Income must be ≤ ₹${s.maxIncome.toLocaleString("en-IN")}`);
  }
  if (s.categories) {
    if (s.categories.includes(p.category)) reasons.push(`${p.category} eligible`);
    else blockers.push(`Category: ${s.categories.join(", ")}`);
  }

  const matched = blockers.length === 0;
  const score = matched ? Math.min(100, 60 + reasons.length * 10) : 0;
  return { matched, score, reasons, blockers };
}

export const scholarshipCategories: ScholarshipCategory[] = [
  "Merit",
  "STEM",
  "Women",
  "Rural",
  "Arts",
  "Need-based",
  "Minority",
];

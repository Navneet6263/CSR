export const stats = [
  { value: "12,400+", label: "Students Funded" },
  { value: "₹48Cr", label: "Disbursed" },
  { value: "96%", label: "Approval Rate" },
  { value: "200+", label: "Partner Companies" },
];

export type Scholarship = {
  company: string;
  logo: string;
  name: string;
  amount: string;
  tags: string[];
  category: "Engineering" | "Medical" | "Arts" | "ITI/Diploma";
  deadline: string;
  urgent?: boolean;
};

export const scholarships: Scholarship[] = [
  {
    company: "TCS", logo: "TCS",
    name: "TCS Scholar Program",
    amount: "₹1,20,000",
    tags: ["B.Tech", "Merit-cum-Means"],
    category: "Engineering",
    deadline: "Closes in 12 days",
    urgent: true,
  },
  {
    company: "Reliance Foundation", logo: "RF",
    name: "Reliance UG Scholarship",
    amount: "₹2,00,000",
    tags: ["MBBS", "Girls Priority"],
    category: "Medical",
    deadline: "Closes in 28 days",
  },
  {
    company: "Infosys Foundation", logo: "IF",
    name: "Infosys STEM Grant",
    amount: "₹80,000",
    tags: ["B.E.", "Rural"],
    category: "Engineering",
    deadline: "Closes in 6 days",
    urgent: true,
  },
  {
    company: "Tata Trusts", logo: "TT",
    name: "Tata Arts Fellowship",
    amount: "₹60,000",
    tags: ["B.A.", "B.F.A."],
    category: "Arts",
    deadline: "Closes in 34 days",
  },
  {
    company: "L&T", logo: "L&T",
    name: "L&T Build India Scholarship",
    amount: "₹45,000",
    tags: ["ITI", "Diploma"],
    category: "ITI/Diploma",
    deadline: "Closes in 19 days",
  },
  {
    company: "HDFC Bank", logo: "HDFC",
    name: "HDFC Parivartan ECSS",
    amount: "₹75,000",
    tags: ["All Streams", "Income < 2.5L"],
    category: "Engineering",
    deadline: "Closes in 41 days",
  },
];

export const filters = ["All", "Engineering", "Medical", "Arts", "ITI/Diploma"] as const;

export const stories = [
  {
    name: "Ananya Sharma",
    course: "B.Tech Computer Science",
    college: "IIT Kharagpur",
    amount: "₹2,00,000",
    quote: "TalentBridge matched me with 3 scholarships in a week. I graduated debt-free.",
    initials: "AS",
  },
  {
    name: "Rahul Verma",
    course: "MBBS",
    college: "AIIMS Delhi",
    amount: "₹4,50,000",
    quote: "As a first-gen student from Bihar, this platform truly changed my life.",
    initials: "RV",
  },
  {
    name: "Priya Nair",
    course: "B.F.A. Design",
    college: "NID Ahmedabad",
    amount: "₹1,80,000",
    quote: "The auto-match saved months of searching. Every rupee reached my account on time.",
    initials: "PN",
  },
];

export const partners = [
  "TCS", "Reliance Foundation", "ITC", "HDFC Bank", "Infosys Foundation",
  "Tata Trusts", "Wipro", "L&T", "Mahindra Foundation", "ONGC",
];

export const steps = [
  { n: 1, title: "Register & Fill Profile", desc: "Create your account and share your academic details in under 5 minutes." },
  { n: 2, title: "Auto-Match Scholarships", desc: "Our engine surfaces every scholarship you're eligible for — instantly." },
  { n: 3, title: "Submit Documents", desc: "Upload once, apply everywhere. Documents are verified digitally." },
  { n: 4, title: "Receive Funds", desc: "Funds land directly in your bank account. Transparent tracking end-to-end." },
];

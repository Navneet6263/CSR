export const mockZones = [
  { state: "Maharashtra", count: 2840, zone: "West" },
  { state: "Uttar Pradesh", count: 2310, zone: "North" },
  { state: "Karnataka", count: 1620, zone: "South" },
  { state: "Delhi", count: 1240, zone: "North" },
  { state: "Tamil Nadu", count: 1180, zone: "South" },
  { state: "West Bengal", count: 980, zone: "East" },
];

export const mockMetrics = {
  financials: {
    totalBudget: 100000000,
    fundDisbursed: 48200000,
    fundsInPipeline: 11600000
  },
  funnel: {
    applied: 12480,
    docsVerified: 800,
    bgVerified: 600,
    screened: 480,
    approved: 400
  },
  workload: {
    docCheckers: 184,
    bgCheckers: 156,
    screeners: 92,
    csrPartners: 48
  },
  alerts: {
    heldApplications: 12,
    stuckAtBGCheck: 150
  }
};

export const mockReviewerQueue = [
  { id: "APP-1042", name: "Ananya Sharma", college: "Fergusson College", assigned: "Rohan", waiting: "12m" },
  { id: "APP-1041", name: "Karthik Nair", college: "IIT Madras", assigned: "Priya", waiting: "28m" },
  { id: "APP-1040", name: "Meera Joshi", college: "St. Xavier's", assigned: "Arjun", waiting: "1h 04m" },
  { id: "APP-1039", name: "Rahul Verma", college: "DU North Campus", assigned: "Unassigned", waiting: "5h 12m" },
  { id: "APP-1038", name: "Divya Patel", college: "VJTI Mumbai", assigned: "Sneha", waiting: "1d 4h" },
  { id: "APP-1037", name: "Aman Gupta", college: "BITS Pilani", assigned: "Rohan", waiting: "2d 6h" },
];

export const mockBgCheckerQueue = [
  { id: "APP-1042", name: "Ananya Sharma", city: "Pune, MH", assigned: "Amit", waiting: "34m", status: "address_pending" },
  { id: "APP-1041", name: "Karthik Nair", city: "Chennai, TN", assigned: "Pooja", waiting: "1h 12m", status: "college_pending" },
  { id: "APP-1040", name: "Meera Joshi", city: "Mumbai, MH", assigned: "Manish", waiting: "2h 04m", status: "in_review" },
  { id: "APP-1039", name: "Rahul Verma", city: "Delhi, DL", assigned: "Unassigned", waiting: "3h 22m", status: "address_pending" },
  { id: "APP-1038", name: "Divya Patel", city: "Mumbai, MH", assigned: "Ritu", waiting: "4h 50m", status: "in_review" },
  { id: "APP-1037", name: "Aman Gupta", city: "Pilani, RJ", assigned: "Amit", waiting: "6h 10m", status: "flagged" },
];

export const mockScreenerQueue = [
  { id: "APP-1042", name: "Ananya Sharma", score: 94, assigned: "Neha", waiting: "45m", status: "ready" },
  { id: "APP-1041", name: "Karthik Nair", score: 88, assigned: "Karan", waiting: "1h 30m", status: "ready" },
  { id: "APP-1040", name: "Meera Joshi", score: 91, assigned: "Neha", waiting: "3h 15m", status: "needs_info" },
  { id: "APP-1039", name: "Rahul Verma", score: 76, assigned: "Unassigned", waiting: "5h 45m", status: "ready" },
  { id: "APP-1038", name: "Divya Patel", score: 82, assigned: "Karan", waiting: "1d 2h", status: "needs_info" },
  { id: "APP-1037", name: "Aman Gupta", score: 95, assigned: "Neha", waiting: "1d 8h", status: "flagged" },
];

export const mockCsrQueue = [
  { id: "APP-1042", name: "Ananya Sharma", amount: "₹85,000", partner: "Tech Mahindra", waiting: "1h 15m", status: "pending_approval" },
  { id: "APP-1041", name: "Karthik Nair", amount: "₹45,000", partner: "Infosys", waiting: "3h 40m", status: "pending_approval" },
  { id: "APP-1040", name: "Meera Joshi", amount: "₹1,20,000", partner: "Reliance Foundation", waiting: "1d 2h", status: "in_review" },
  { id: "APP-1039", name: "Rahul Verma", amount: "₹60,000", partner: "Tata Trusts", waiting: "1d 6h", status: "pending_approval" },
  { id: "APP-1038", name: "Divya Patel", amount: "₹50,000", partner: "Wipro Cares", waiting: "2d 1h", status: "in_review" },
];

export const mockScholarships = [
  {
    name: "Tata Merit-cum-Means 2026",
    sponsor: "Tata CSR Foundation",
    budget: 5000000,
    seats: 100,
    filled: 64,
    status: "Live",
    closes: "30 Sep 2026",
  },
  {
    name: "Infosys STEM Excellence",
    sponsor: "Infosys Foundation",
    budget: 3000000,
    seats: 60,
    filled: 41,
    status: "Live",
    closes: "15 Oct 2026",
  },
  {
    name: "Reliance Rural Engineers",
    sponsor: "Reliance Foundation",
    budget: 2500000,
    seats: 50,
    filled: 0,
    status: "Draft",
    closes: "—",
  },
];

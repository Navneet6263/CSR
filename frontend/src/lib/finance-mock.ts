export type Sponsor = "ITC Foundation" | "HDFC CSR" | "Tata Trusts" | "Infosys Foundation" | "Wipro Cares";
export type PayoutStatus = "CSRApproved" | "MakerEntered" | "PaymentCompleted" | "Failed";

export type Payout = {
  id: string;
  applicationId: string;
  fullName: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  aadhaarLinked: "Yes" | "No";
  sponsor: Sponsor;
  approvedAt: string; // ISO date
  status: PayoutStatus;
  makerUtr?: string;
  makerName?: string;
  makerAt?: string;
  checkerUtr?: string;
  checkerName?: string;
  checkerAt?: string;
  checkerNotes?: string;
  failureReason?: string;
  failedAt?: string;
};

export type Completed = {
  txnId: string;
  applicationId: string;
  fullName: string;
  bankName: string;
  amount: number;
  sponsor: Sponsor;
  date: string;
  maker: string;
  checker: string;
};

export type AuditEvent = {
  id: string;
  ts: string; // ISO
  actor: string;
  role: "Maker" | "Checker" | "Admin" | "System";
  action: string;
  target: string;
  meta?: string;
};

export type FailedPayment = {
  id: string;
  applicationId: string;
  fullName: string;
  amount: number;
  bankName: string;
  sponsor: Sponsor;
  reason: string;
  failedAt: string;
  studentNotified: boolean;
  detailsUpdated: boolean;
};

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export const daysBetween = (isoDate: string, now = new Date()) => {
  const ms = now.getTime() - new Date(isoDate).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
};

// ----- Seed data (written out manually, no .map shortcuts) -----

export const initialPending: Payout[] = [
  {
    id: "PYT-1001", applicationId: "APP-2026-0417", fullName: "Ananya Sharma", amount: 50000,
    bankName: "State Bank of India", accountNumber: "34567890123", ifsc: "SBIN0001234",
    aadhaarLinked: "Yes", sponsor: "ITC Foundation", approvedAt: "2026-07-02", status: "CSRApproved",
  },
  {
    id: "PYT-1002", applicationId: "APP-2026-0418", fullName: "Rahul Verma", amount: 75000,
    bankName: "HDFC Bank", accountNumber: "50100234567890", ifsc: "HDFC0000456",
    aadhaarLinked: "Yes", sponsor: "HDFC CSR", approvedAt: "2026-07-06", status: "CSRApproved",
  },
  {
    id: "PYT-1003", applicationId: "APP-2026-0421", fullName: "Priya Krishnan", amount: 40000,
    bankName: "ICICI Bank", accountNumber: "62890012345678", ifsc: "ICIC0006289",
    aadhaarLinked: "No", sponsor: "Infosys Foundation", approvedAt: "2026-07-08", status: "CSRApproved",
  },
  {
    id: "PYT-1004", applicationId: "APP-2026-0425", fullName: "Mohammed Irfan", amount: 60000,
    bankName: "Punjab National Bank", accountNumber: "22110045678901", ifsc: "PUNB0221100",
    aadhaarLinked: "Yes", sponsor: "Tata Trusts", approvedAt: "2026-07-01", status: "CSRApproved",
  },
  {
    id: "PYT-1005", applicationId: "APP-2026-0429", fullName: "Sneha Patil", amount: 55000,
    bankName: "Axis Bank", accountNumber: "91201004567823", ifsc: "UTIB0000912",
    aadhaarLinked: "Yes", sponsor: "ITC Foundation", approvedAt: "2026-07-09", status: "CSRApproved",
  },
  {
    id: "PYT-1006", applicationId: "APP-2026-0431", fullName: "Karthik Iyer", amount: 45000,
    bankName: "Kotak Mahindra", accountNumber: "70051234567890", ifsc: "KKBK0000700",
    aadhaarLinked: "Yes", sponsor: "HDFC CSR", approvedAt: "2026-07-10", status: "CSRApproved",
  },
  {
    id: "PYT-1007", applicationId: "APP-2026-0433", fullName: "Neha Bansal", amount: 65000,
    bankName: "Yes Bank", accountNumber: "00212345678901", ifsc: "YESB0000002",
    aadhaarLinked: "Yes", sponsor: "Wipro Cares", approvedAt: "2026-07-05", status: "CSRApproved",
  },
];

// A couple already entered by Maker, awaiting Checker verification.
export const initialMakerEntered: Payout[] = [
  {
    id: "PYT-0998", applicationId: "APP-2026-0410", fullName: "Devansh Kapoor", amount: 50000,
    bankName: "State Bank of India", accountNumber: "31112223334", ifsc: "SBIN0009911",
    aadhaarLinked: "Yes", sponsor: "ITC Foundation", approvedAt: "2026-07-07", status: "MakerEntered",
    makerUtr: "SBIN026070900000123456", makerName: "Arjun Rao", makerAt: "2026-07-10T09:12:00Z",
  },
  {
    id: "PYT-0999", applicationId: "APP-2026-0413", fullName: "Meghna Joshi", amount: 40000,
    bankName: "HDFC Bank", accountNumber: "50100987654321", ifsc: "HDFC0000123",
    aadhaarLinked: "Yes", sponsor: "HDFC CSR", approvedAt: "2026-07-08", status: "MakerEntered",
    makerUtr: "HDFC026070900000987654", makerName: "Arjun Rao", makerAt: "2026-07-10T10:44:00Z",
  },
];

export const completedHistory: Completed[] = [
  { txnId: "SBIN026070400000345601", applicationId: "APP-2026-0388", fullName: "Kavya Reddy", bankName: "Canara Bank", amount: 45000, sponsor: "Tata Trusts", date: "2026-07-04", maker: "Arjun Rao", checker: "Meera Iyer" },
  { txnId: "SBIN026070400000345602", applicationId: "APP-2026-0391", fullName: "Arjun Nair", bankName: "State Bank of India", amount: 50000, sponsor: "ITC Foundation", date: "2026-07-04", maker: "Arjun Rao", checker: "Meera Iyer" },
  { txnId: "HDFC026070500000345603", applicationId: "APP-2026-0396", fullName: "Diya Mehta", bankName: "HDFC Bank", amount: 70000, sponsor: "HDFC CSR", date: "2026-07-05", maker: "Arjun Rao", checker: "Meera Iyer" },
  { txnId: "KKBK026070500000345604", applicationId: "APP-2026-0402", fullName: "Vikram Singh", bankName: "Kotak Mahindra", amount: 65000, sponsor: "Infosys Foundation", date: "2026-07-05", maker: "Arjun Rao", checker: "Meera Iyer" },
  { txnId: "BARB026070600000345605", applicationId: "APP-2026-0409", fullName: "Ishita Ghosh", bankName: "Bank of Baroda", amount: 40000, sponsor: "Wipro Cares", date: "2026-07-06", maker: "Arjun Rao", checker: "Meera Iyer" },
  { txnId: "UTIB026070600000345606", applicationId: "APP-2026-0412", fullName: "Rohan Desai", bankName: "Axis Bank", amount: 55000, sponsor: "ITC Foundation", date: "2026-07-06", maker: "Arjun Rao", checker: "Meera Iyer" },
];

export const initialFailed: FailedPayment[] = [
  {
    id: "FAIL-2001", applicationId: "APP-2026-0400", fullName: "Suresh Menon", amount: 30000,
    bankName: "Federal Bank", sponsor: "Tata Trusts",
    reason: "Beneficiary account closed", failedAt: "2026-07-08",
    studentNotified: true, detailsUpdated: false,
  },
  {
    id: "FAIL-2002", applicationId: "APP-2026-0406", fullName: "Ritika Chowdhury", amount: 20000,
    bankName: "IDBI Bank", sponsor: "HDFC CSR",
    reason: "IFSC code invalid — bank return", failedAt: "2026-07-09",
    studentNotified: true, detailsUpdated: true,
  },
];

export const initialAudit: AuditEvent[] = [
  { id: "AUD-9001", ts: "2026-07-10T10:44:00Z", actor: "Arjun Rao", role: "Maker", action: "UTR recorded", target: "PYT-0999", meta: "₹40,000 · HDFC026070900000987654" },
  { id: "AUD-9002", ts: "2026-07-10T09:12:00Z", actor: "Arjun Rao", role: "Maker", action: "UTR recorded", target: "PYT-0998", meta: "₹50,000 · SBIN026070900000123456" },
  { id: "AUD-9003", ts: "2026-07-09T15:30:00Z", actor: "System", role: "System", action: "Payment marked Failed", target: "FAIL-2001", meta: "Beneficiary account closed" },
  { id: "AUD-9004", ts: "2026-07-06T14:10:00Z", actor: "Meera Iyer", role: "Checker", action: "Payment verified & completed", target: "APP-2026-0412", meta: "UTIB026070600000345606" },
  { id: "AUD-9005", ts: "2026-07-06T14:08:00Z", actor: "Arjun Rao", role: "Maker", action: "UTR recorded", target: "APP-2026-0412", meta: "₹55,000" },
  { id: "AUD-9006", ts: "2026-07-05T11:00:00Z", actor: "Priya Nair", role: "Admin", action: "Withdrawal limit reviewed", target: "SYS", meta: "Daily cap ₹10L confirmed" },
];

// Monthly disbursement trend (last 6 months) — written out, no map shortcuts
export const monthlyTrend: { month: string; amount: number }[] = [
  { month: "Feb", amount: 4200000 },
  { month: "Mar", amount: 5100000 },
  { month: "Apr", amount: 4800000 },
  { month: "May", amount: 6300000 },
  { month: "Jun", amount: 7100000 },
  { month: "Jul", amount: 3250000 },
];

export const CURRENT_MAKER = "Arjun Rao";
export const CURRENT_CHECKER = "Meera Iyer";
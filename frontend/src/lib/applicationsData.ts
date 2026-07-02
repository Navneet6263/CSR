// Extended application data with per-stage timeline, documents, and notes.
import type { Application, StageKey } from "./mockData";
import { applications as baseApps } from "./mockData";

export interface TimelineEvent {
  key: StageKey;
  label: string;
  status: "complete" | "current" | "pending" | "rejected";
  date?: string;
  note?: string;
}

export interface AppDocument {
  name: string;
  status: "verified" | "pending" | "rejected";
  reason?: string;
}

export interface ApplicationDetail extends Application {
  provider: string;
  category: string;
  submittedDocs: AppDocument[];
  timeline: TimelineEvent[];
  disbursedOn?: string;
  reviewer?: string;
  nextAction?: string;
  progressPct: number;
}

const STAGE_LABELS: Record<StageKey, string> = {
  registration: "Registration",
  documents: "Documents",
  auto_match: "Auto-Match",
  doc_audit: "Doc Audit",
  bg_check: "BG Check",
  screening: "Screening",
  csr_approval: "CSR Approval",
  funded: "Funded",
};
const ORDER: StageKey[] = [
  "registration",
  "documents",
  "auto_match",
  "doc_audit",
  "bg_check",
  "screening",
  "csr_approval",
  "funded",
];

function buildTimeline(currentStage: string, status: Application["status"]): TimelineEvent[] {
  const currentKey = (ORDER.find((k) => STAGE_LABELS[k] === currentStage) ?? "documents") as StageKey;
  const idx = ORDER.indexOf(currentKey);
  return ORDER.map((k, i) => {
    if (status === "Rejected" && i === idx) {
      return { key: k, label: STAGE_LABELS[k], status: "rejected" };
    }
    if (status === "Funded") return { key: k, label: STAGE_LABELS[k], status: "complete" };
    if (i < idx) return { key: k, label: STAGE_LABELS[k], status: "complete" };
    if (i === idx) return { key: k, label: STAGE_LABELS[k], status: "current" };
    return { key: k, label: STAGE_LABELS[k], status: "pending" };
  });
}

const PROVIDER_META: Record<string, { provider: string; category: string }> = {
  "Merit Excellence Grant": { provider: "TalentBridge Foundation", category: "Merit" },
  "STEM Future Leaders": { provider: "InnovateIndia CSR", category: "STEM" },
  "Rural Empowerment Award": { provider: "Bharat Rural Mission", category: "Rural" },
  "Women in Tech Scholarship": { provider: "She Codes Trust", category: "Women" },
  "Arts & Culture Fund": { provider: "Kala Bharti Trust", category: "Arts" },
};

const DEFAULT_DOCS: AppDocument[] = [
  { name: "Aadhaar Card", status: "verified" },
  { name: "10th Marksheet", status: "verified" },
  { name: "12th Marksheet", status: "verified" },
  { name: "Income Certificate", status: "pending" },
  { name: "Bonafide", status: "verified" },
];

function progressFor(current: string, status: Application["status"]): number {
  if (status === "Funded") return 100;
  if (status === "Rejected") return 40;
  const idx = ORDER.findIndex((k) => STAGE_LABELS[k] === current);
  return Math.round(((idx + 1) / ORDER.length) * 100);
}

const EXTRA_APPS: Application[] = Array.from({ length: 20 }, (_, i) => {
  const templates: Array<Omit<Application, "id" | "appliedOn">> = [
    { scholarship: "Merit Excellence Grant", currentStage: "Screening", amount: "₹25,000", status: "Under Review" },
    { scholarship: "STEM Future Leaders", currentStage: "CSR Approval", amount: "₹50,000", status: "Under Review" },
    { scholarship: "Women in Tech Scholarship", currentStage: "Documents", amount: "₹35,000", status: "Pending" },
    { scholarship: "Rural Empowerment Award", currentStage: "Funded", amount: "₹15,000", status: "Funded" },
    { scholarship: "Arts & Culture Fund", currentStage: "Doc Audit", amount: "₹10,000", status: "Rejected" },
  ];
  const t = templates[i % templates.length];
  const day = 5 + (i % 25);
  return {
    ...t,
    id: `TB${47000 + i}`,
    appliedOn: `May ${String(day).padStart(2, "0")}, 2026`,
  };
});

export const allApplications: Application[] = [...baseApps, ...EXTRA_APPS];

export function getApplicationDetail(id: string): ApplicationDetail | null {
  const app = allApplications.find((a) => a.id === id);
  if (!app) return null;
  const meta = PROVIDER_META[app.scholarship] ?? {
    provider: "CSR Partner",
    category: "General",
  };
  const timeline = buildTimeline(app.currentStage, app.status);
  const docs: AppDocument[] =
    app.status === "Rejected"
      ? DEFAULT_DOCS.map((d) =>
          d.name === "Income Certificate"
            ? { ...d, status: "rejected", reason: "Scan unclear — please re-upload." }
            : d,
        )
      : DEFAULT_DOCS;
  return {
    ...app,
    ...meta,
    submittedDocs: docs,
    timeline,
    progressPct: progressFor(app.currentStage, app.status),
    disbursedOn: app.status === "Funded" ? "Jun 25, 2026" : undefined,
    reviewer: "Priya Menon (CSR Officer)",
    nextAction:
      app.status === "Funded"
        ? "Amount credited to your bank account."
        : app.status === "Rejected"
          ? "Re-upload the flagged document to reopen."
          : "Sit tight — our team is reviewing your application.",
  };
}

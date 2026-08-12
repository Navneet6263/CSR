export interface ScreenerStats {
  pending: number;
  assigned: number;
  available: number;
  approved: number;
  rejected: number;
  returned: number;
  totalReviewed: number;
  today: number;
  overdue: number;
  approvalRate: number;
}

export type ScreeningReturnTarget = 'DocumentReviewer' | 'BGCheckOfficer' | 'CloseApplication';

export interface ScreeningDecisionRequest {
  decision: 'Approve' | 'Reject';
  notes: string;
  returnTo?: ScreeningReturnTarget;
  affectedItems?: string[];
}

export interface ScreeningDocument {
  ChecklistID: number;
  DocumentType: string;
  Status: string;
  RejectionReason?: string;
  ReviewedAt?: string;
  FileURL: string;
}

export interface ScreeningBGCheck {
  CheckType: string;
  Result: string;
  Notes?: string;
  EvidenceURL?: string;
  CompletedAt?: string;
}

export interface EligibilityRuleView {
  RuleID: number;
  RuleType: string;
  Operator: string;
  ValueMin?: string;
  ValueMax?: string;
  ValueList?: string;
  IsRequired: boolean;
}

export interface ScreeningDetail {
  application: Record<string, unknown>;
  documents: ScreeningDocument[];
  bgChecks: ScreeningBGCheck[];
  decisions: Record<string, unknown>[];
  eligibilityRules: EligibilityRuleView[];
  statusHistory: Record<string, unknown>[];
  evaluation: { isEligible: boolean; evaluatedAt?: string; rulesVersion?: number } | null;
}

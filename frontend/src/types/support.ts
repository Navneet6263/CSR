export interface SupportOverview {
  metrics: { activeToday: number; pendingApplications: number; incompleteProfiles: number; resolvedToday: number };
  ticketSummary: Array<{ status: string; priority: string; count: number }>;
  recentLogins: Array<{ userId: number; name: string; email: string; role: string; lastUsedAt?: string }>;
}

export interface SupportStudentRow {
  studentId: number; userId: number; name: string; email: string; phone: string; state?: string; course?: string;
  registeredAt: string; applicationId?: number; status: string; stageEnteredAt?: string;
  completion: number; missing: string[];
}

export interface SupportTicket {
  TicketID: number; UserID: number; Subject: string; Message: string; Category: string; Priority: string;
  Status: string; AssignedTo?: number; AssigneeName?: string; RequesterName: string; RequesterEmail: string;
  State?: string; DueAt?: string; LastActivityAt?: string; CreatedAt: string; Version: number;
}

export interface SupportStudentDetail {
  student: { studentId: number; name: string; email: string; phone: string; state?: string; city?: string;
    course?: string; registeredAt: string; completion: number; sections: Array<{ label: string; complete: boolean }> };
  applications: Array<Record<string, unknown>>; documents: Array<Record<string, unknown>>;
  tickets: Array<Record<string, unknown>>; activity: Array<Record<string, unknown>>;
}

export interface SupportActivity {
  ActivityID: number; UserID: number; FullName: string; PageCode: string; StepCode?: string;
  EventType: string; ErrorCode?: string; OccurredAt: string;
}

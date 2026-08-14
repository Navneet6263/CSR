import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  await db.raw(`
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_users_search_name')
      CREATE INDEX idx_users_search_name ON Users(FullName, UserID)
      INCLUDE (Email, Role, IsActive, SponsorID, CreatedAt);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_scholarships_search_name')
      CREATE INDEX idx_scholarships_search_name ON Scholarships(Name, ScholarshipID)
      INCLUDE (SponsorID, Status, ApplicationCloseDate, PerStudentAmount);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_sponsors_search_name')
      CREATE INDEX idx_sponsors_search_name ON Sponsors(SponsorName, SponsorID)
      INCLUDE (Status, TotalFund, FundAllocated, FundUtilized);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_institutions_search_name')
      CREATE INDEX idx_institutions_search_name ON Institutions(Name, InstitutionID);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_students_course_search')
      CREATE INDEX idx_students_course_search ON Students(Course, StudentID)
      INCLUDE (UserID, State, City, InstitutionID);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_support_ticket_search')
      CREATE INDEX idx_support_ticket_search ON SupportTickets(Subject, TicketID)
      INCLUDE (Status, Priority, AssignedTo, UserID, DueAt, CreatedAt, LastActivityAt);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_announcement_search')
      CREATE INDEX idx_announcement_search ON AdminAnnouncements(Title, AnnouncementID)
      INCLUDE (Status, Audience, PublishedAt, ExpiresAt, CreatedAt);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_broadcast_search')
      CREATE INDEX idx_broadcast_search ON AdminBroadcasts(Title, BroadcastID)
      INCLUDE (Audience, RecipientCount, CreatedAt, CreatedBy);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_decision_actor_history')
      CREATE INDEX idx_decision_actor_history ON ApplicationDecisions(ActorUserID, Stage, CreatedAt DESC, DecisionID)
      INCLUDE (ApplicationID, Decision, Reason);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_docs_reviewer_type_history')
      CREATE INDEX idx_docs_reviewer_type_history ON DocumentChecklist(ReviewedBy, DocumentType, ReviewedAt DESC, ChecklistID)
      INCLUDE (ApplicationID, Status, RejectionReason);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_bg_officer_type_history')
      CREATE INDEX idx_bg_officer_type_history ON BackgroundChecks(OfficerID, CheckType, CompletedAt DESC, CheckID)
      INCLUDE (ApplicationID, Result, EvidenceURL);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_audit_action_time')
      CREATE INDEX idx_audit_action_time ON AuditLogs(Action, CreatedAt DESC, LogID)
      INCLUDE (UserID, EntityType, EntityID, RequestID);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_audit_request_time')
      CREATE INDEX idx_audit_request_time ON AuditLogs(RequestID, CreatedAt DESC, LogID)
      INCLUDE (UserID, Action, EntityType, EntityID);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_broadcast_audience_time')
      CREATE INDEX idx_broadcast_audience_time ON AdminBroadcasts(Audience, CreatedAt DESC, BroadcastID)
      INCLUDE (Title, RecipientCount, CreatedBy);
  `);
}

export async function down(): Promise<void> {
  throw new Error('Paginated search index rollback is disabled to protect production safety.');
}

import type { Knex } from 'knex';

const statuses = [
  'Draft', 'Submitted', 'AutoMatched', 'EligibilityFailed', 'DocAuditInProgress', 'DocAuditComplete',
  'BGCheckInProgress', 'BGCheckComplete', 'ScreeningPending', 'ScreeningApproved', 'ScreeningRejected',
  'CSRPending', 'CSRApproved', 'CSRDeclined', 'PaymentPending', 'PaymentInitiated',
  'PaymentCompleted', 'PaymentFailed', 'Cancelled',
].map((value) => `'${value}'`).join(',');

export async function up(db: Knex): Promise<void> {
  await db.raw(`
    IF COL_LENGTH('EligibilityRules', 'RuleVersion') IS NULL
      ALTER TABLE EligibilityRules ADD RuleVersion INT NOT NULL
        CONSTRAINT df_eligibility_rule_version DEFAULT 1 WITH VALUES;
  `);
  await db.raw(`
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'uq_students_user')
      CREATE UNIQUE INDEX uq_students_user ON Students(UserID);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'uq_students_aadhar_hash')
      CREATE UNIQUE INDEX uq_students_aadhar_hash ON Students(AadharHash) WHERE AadharHash IS NOT NULL;
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'uq_student_document_type')
      CREATE UNIQUE INDEX uq_student_document_type ON StudentDocuments(StudentID, DocumentType);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'uq_app_student_scholarship')
      CREATE UNIQUE INDEX uq_app_student_scholarship ON Applications(StudentID, ScholarshipID);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'uq_checklist_app_type')
      CREATE UNIQUE INDEX uq_checklist_app_type ON DocumentChecklist(ApplicationID, DocumentType);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'uq_bgcheck_app_type')
      CREATE UNIQUE INDEX uq_bgcheck_app_type ON BackgroundChecks(ApplicationID, CheckType);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'uq_payment_application')
      CREATE UNIQUE INDEX uq_payment_application ON Payments(ApplicationID);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'uq_payment_reference')
      CREATE UNIQUE INDEX uq_payment_reference ON Payments(ReferenceNo) WHERE ReferenceNo IS NOT NULL;
  `);

  await db.raw(`
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_app_stage_queue')
      CREATE INDEX idx_app_stage_queue ON Applications(Status, IsHeldByAdmin, SubmissionDate, ApplicationID)
      INCLUDE (StudentID, ScholarshipID, SponsorID, ScholarshipAmount);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_app_student_history')
      CREATE INDEX idx_app_student_history ON Applications(StudentID, CreatedAt DESC, ApplicationID)
      INCLUDE (Status, ScholarshipID, ScholarshipAmount);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_app_doc_assignment')
      CREATE INDEX idx_app_doc_assignment ON Applications(AssignedDocReviewer, Status, SubmissionDate);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_app_bg_assignment')
      CREATE INDEX idx_app_bg_assignment ON Applications(AssignedBGOfficer, Status, SubmissionDate);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_app_screen_assignment')
      CREATE INDEX idx_app_screen_assignment ON Applications(AssignedScreener, Status, SubmissionDate);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_scholarships_discovery')
      CREATE INDEX idx_scholarships_discovery ON Scholarships(Status, ApplicationOpenDate, ApplicationCloseDate)
      INCLUDE (SponsorID, PerStudentAmount, MaxApplicants);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_eligibility_scholarship')
      CREATE INDEX idx_eligibility_scholarship ON EligibilityRules(ScholarshipID, RuleVersion, RuleID);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_auth_sessions_user_active')
      CREATE INDEX idx_auth_sessions_user_active ON AuthSessions(UserID, RevokedAt, ExpiresAt);
  `);

  await db.raw(`
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_docs_status_queue')
      CREATE INDEX idx_docs_status_queue ON DocumentChecklist(Status, CreatedAt, ChecklistID)
      INCLUDE (ApplicationID, DocumentType, ReviewedBy);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_docs_reviewer_history')
      CREATE INDEX idx_docs_reviewer_history ON DocumentChecklist(ReviewedBy, ReviewedAt DESC);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_bg_officer_history')
      CREATE INDEX idx_bg_officer_history ON BackgroundChecks(OfficerID, CompletedAt DESC);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_payments_status_queue')
      CREATE INDEX idx_payments_status_queue ON Payments(Status, CreatedAt, PaymentID);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_notifications_dispatch')
      CREATE INDEX idx_notifications_dispatch ON Notifications(IsSent, RetryCount, CreatedAt);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_notifications_user_history')
      CREATE INDEX idx_notifications_user_history ON Notifications(UserID, CreatedAt DESC);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_audit_entity_time')
      CREATE INDEX idx_audit_entity_time ON AuditLogs(EntityType, EntityID, CreatedAt DESC);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_status_history_app_time')
      CREATE INDEX idx_status_history_app_time ON ApplicationStatusHistory(ApplicationID, CreatedAt DESC);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_decisions_app_time')
      CREATE INDEX idx_decisions_app_time ON ApplicationDecisions(ApplicationID, CreatedAt DESC);
  `);

  await db.raw(`
    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'ck_applications_status')
      ALTER TABLE Applications WITH CHECK ADD CONSTRAINT ck_applications_status CHECK (Status IN (${statuses}));
    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'ck_sponsor_funds')
      ALTER TABLE Sponsors WITH CHECK ADD CONSTRAINT ck_sponsor_funds CHECK (
        TotalFund >= 0 AND FundAllocated >= 0 AND FundUtilized >= 0
        AND FundAllocated + FundUtilized <= TotalFund
      );
    IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'ck_payment_amount')
      ALTER TABLE Payments WITH CHECK ADD CONSTRAINT ck_payment_amount CHECK (Amount > 0);
  `);
}

export async function down(): Promise<void> {
  throw new Error('Constraint/index rollback is disabled to protect production safety.');
}

import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  if (!await db.schema.hasColumn('Students', 'BankBranch')) {
    await db.schema.alterTable('Students', (table) => table.string('BankBranch', 150));
  }
  await db.raw(`
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_app_sla_queue')
      CREATE INDEX idx_app_sla_queue ON Applications(Status, StageEnteredAt, ApplicationID)
      INCLUDE (StudentID, SubmissionDate, CreatedAt);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_students_geo')
      CREATE INDEX idx_students_geo ON Students(State, City, StudentID);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_app_geo_created')
      CREATE INDEX idx_app_geo_created ON Applications(StudentID, CreatedAt, Status)
      INCLUDE (ApplicationID);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_audit_export')
      CREATE INDEX idx_audit_export ON AuditLogs(CreatedAt DESC, LogID)
      INCLUDE (UserID, Action, EntityType, EntityID, RequestID);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_payments_report')
      CREATE INDEX idx_payments_report ON Payments(Status, UpdatedAt DESC, PaymentID)
      INCLUDE (ApplicationID, Amount, ReferenceNo);
  `);
}

export async function down(): Promise<void> {
  throw new Error('Scale index rollback is disabled to protect production safety.');
}

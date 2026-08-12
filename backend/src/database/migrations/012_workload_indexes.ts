import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  await db.raw(`
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_app_sponsor_queue')
      CREATE INDEX idx_app_sponsor_queue ON Applications(SponsorID, Status, StageEnteredAt, ApplicationID)
      INCLUDE (StudentID, ScholarshipID, ScholarshipAmount);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_users_role_active')
      CREATE INDEX idx_users_role_active ON Users(Role, IsActive, UserID)
      INCLUDE (FullName, Email, SponsorID, CreatedAt);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_students_diversity')
      CREATE INDEX idx_students_diversity ON Students(State, Category, StudentID)
      INCLUDE (City, Course);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_status_history_transition')
      CREATE INDEX idx_status_history_transition ON ApplicationStatusHistory(ToStatus, CreatedAt DESC, HistoryID)
      INCLUDE (ApplicationID, FromStatus, ActorRole);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_support_user_history')
      CREATE INDEX idx_support_user_history ON SupportTickets(UserID, CreatedAt DESC, TicketID)
      INCLUDE (Status, Category, Priority);
  `);
}

export async function down(): Promise<void> {
  throw new Error('Workload index rollback is disabled to protect production safety.');
}

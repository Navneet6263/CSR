import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  const columns: Array<[string, (table: Knex.AlterTableBuilder) => void]> = [
    ['PauseReason', (table) => table.string('PauseReason', 1000)],
    ['PausedAt', (table) => table.specificType('PausedAt', 'DATETIME2')],
    ['PausedBy', (table) => table.integer('PausedBy').references('UserID').inTable('Users').onDelete('SET NULL')],
    ['ResumeAt', (table) => table.specificType('ResumeAt', 'DATETIME2')],
    ['PublishPauseNotice', (table) => table.boolean('PublishPauseNotice').notNullable().defaultTo(false)],
    ['PauseAnnouncementID', (table) => table.bigInteger('PauseAnnouncementID')
      .references('AnnouncementID').inTable('AdminAnnouncements').onDelete('SET NULL')],
  ];

  for (const [name, add] of columns) {
    if (!await db.schema.hasColumn('Scholarships', name)) {
      await db.schema.alterTable('Scholarships', add);
    }
  }

  await db.raw(`
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_scholarship_pause_resume')
      CREATE INDEX idx_scholarship_pause_resume ON Scholarships(Status, ResumeAt)
      INCLUDE (PauseAnnouncementID, PauseReason);
  `);
}

export async function down(): Promise<void> {
  throw new Error('Scholarship pause history rollback is disabled to protect operational records.');
}

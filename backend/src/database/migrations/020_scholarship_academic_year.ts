import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  const exists = await db.schema.hasColumn('Scholarships', 'AcademicYear');
  if (!exists) {
    await db.schema.alterTable('Scholarships', (table) => {
      table.string('AcademicYear', 20);
    });
  }
}

export async function down(): Promise<void> {
  throw new Error('Scholarship schema repair rollback is disabled.');
}

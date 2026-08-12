import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  if (await db.schema.hasColumn('DocumentChecklist', 'FileURL')) {
    await db.raw('ALTER TABLE DocumentChecklist ALTER COLUMN FileURL NVARCHAR(500) NULL');
  }
}

export async function down(): Promise<void> {
  throw new Error('Document checklist compatibility rollback is disabled.');
}

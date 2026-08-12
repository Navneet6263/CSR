import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  await db.raw(`
    IF COL_LENGTH('Users', 'FinanceFunction') IS NULL
      ALTER TABLE Users ADD FinanceFunction VARCHAR(20) NULL;
  `);
  await db.raw(`
    UPDATE Users
    SET FinanceFunction = 'Maker', UpdatedAt = CURRENT_TIMESTAMP
    WHERE Role = 'Finance' AND FinanceFunction IS NULL;
  `);
  await db.raw(`
    IF NOT EXISTS (
      SELECT 1 FROM sys.check_constraints WHERE name = 'ck_users_finance_function'
    )
      ALTER TABLE Users WITH CHECK ADD CONSTRAINT ck_users_finance_function CHECK (
        (Role = 'Finance' AND FinanceFunction IN ('Maker', 'Checker'))
        OR (Role <> 'Finance' AND FinanceFunction IS NULL)
      );
  `);
}

export async function down(): Promise<void> {
  throw new Error('Finance function rollback is disabled to preserve access-control integrity.');
}

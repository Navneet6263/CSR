import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  await db.raw(`
    UPDATE account
    SET FinanceFunction = CASE
      WHEN EXISTS (
        SELECT 1 FROM Payments AS payment WHERE payment.MakerID = account.UserID
      ) THEN 'Maker'
      ELSE 'Checker'
    END,
    UpdatedAt = CURRENT_TIMESTAMP
    FROM Users AS account
    WHERE account.Role = 'Finance';
  `);
}

export async function down(): Promise<void> {
  throw new Error('Legacy Finance assignment rollback is disabled to preserve separation of duties.');
}

import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  await db.raw(`
    UPDATE account
    SET SponsorID = matched.SponsorID,
        UpdatedAt = CURRENT_TIMESTAMP
    FROM Users AS account
    CROSS APPLY (
      SELECT TOP 1 sponsor.SponsorID
      FROM Sponsors AS sponsor
      WHERE LOWER(sponsor.Email) = LOWER(account.Email)
        AND sponsor.Status = 'Active'
      ORDER BY sponsor.SponsorID
    ) AS matched
    WHERE account.Role = 'CSRPartner'
      AND account.SponsorID IS NULL;
  `);
}

export async function down(): Promise<void> {
  throw new Error('CSR sponsor binding rollback is disabled to protect tenant isolation.');
}

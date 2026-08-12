import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  await db.raw(`
    UPDATE application
    SET
      ScholarshipAmount = CASE
        WHEN application.ScholarshipAmount IS NULL OR application.ScholarshipAmount <= 0
          THEN scholarship.PerStudentAmount
        ELSE application.ScholarshipAmount
      END,
      SponsorID = COALESCE(application.SponsorID, scholarship.SponsorID),
      UpdatedAt = CURRENT_TIMESTAMP
    FROM Applications AS application
    INNER JOIN Scholarships AS scholarship
      ON scholarship.ScholarshipID = application.ScholarshipID
    WHERE application.ScholarshipAmount IS NULL
       OR application.ScholarshipAmount <= 0
       OR application.SponsorID IS NULL;
  `);

  await db.raw(`
    IF NOT EXISTS (
      SELECT 1 FROM sys.check_constraints
      WHERE name = 'ck_application_scholarship_amount'
    )
      ALTER TABLE Applications WITH CHECK ADD CONSTRAINT ck_application_scholarship_amount
        CHECK (ScholarshipAmount IS NULL OR ScholarshipAmount > 0);
  `);
}

export async function down(): Promise<void> {
  throw new Error('Award backfill rollback is disabled to protect financial data integrity.');
}

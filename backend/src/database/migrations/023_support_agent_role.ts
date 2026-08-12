import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  await db.raw(`
    DECLARE @dropSql NVARCHAR(MAX) = N'';

    SELECT @dropSql = @dropSql
      + N'ALTER TABLE dbo.Users DROP CONSTRAINT ' + QUOTENAME(cc.name) + N';'
    FROM sys.check_constraints cc
    WHERE cc.parent_object_id = OBJECT_ID('dbo.Users')
      AND cc.name <> 'ck_users_finance_function'
      AND cc.definition LIKE '%Role%';

    IF LEN(@dropSql) > 0 EXEC sp_executesql @dropSql;

    ALTER TABLE dbo.Users WITH CHECK ADD CONSTRAINT ck_users_role CHECK (
      [Role] IN (
        'Student', 'Agent', 'DocReviewer', 'BGCheckOfficer',
        'ScreeningOfficer', 'CSRPartner', 'Admin', 'Finance', 'SupportAgent'
      )
    );
  `);
}

export async function down(): Promise<void> {
  throw new Error('Support Agent role rollback is disabled to preserve valid staff accounts.');
}

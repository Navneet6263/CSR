import type { Knex } from 'knex';

const applicationTables = [
  'Sponsors', 'Institutions', 'Users', 'Agents', 'Students', 'AuthSessions',
  'Scholarships', 'EligibilityRules', 'Applications', 'ApplicationStatusHistory',
  'EligibilityEvaluations', 'StudentDocuments', 'DocumentVersions', 'DocumentChecklist',
  'ScholarshipDocumentRequirements', 'BackgroundChecks', 'Payments', 'AuditLogs',
  'Notifications', 'IdempotencyKeys', 'ApplicationDecisions', 'PaymentAttempts',
  'PasswordResetTokens', 'EmailOutbox', 'Announcements', 'SupportTickets', 'Broadcasts',
  'UserConsents', 'SupportTicketEvents', 'SupportContactLogs', 'StudentActivityEvents',
];

export async function up(db: Knex): Promise<void> {
  const placeholders = applicationTables.map(() => '?').join(',');
  await db.raw(`
    DECLARE @table SYSNAME, @column SYSNAME, @constraint SYSNAME, @sql NVARCHAR(MAX);
    DECLARE utc_defaults CURSOR LOCAL FAST_FORWARD FOR
      SELECT tables.name, columns.name, defaults.name
      FROM sys.default_constraints defaults
      JOIN sys.tables tables ON tables.object_id = defaults.parent_object_id
      JOIN sys.schemas schemas ON schemas.schema_id = tables.schema_id
      JOIN sys.columns columns ON columns.object_id = tables.object_id
        AND columns.column_id = defaults.parent_column_id
      WHERE schemas.name = 'dbo' AND tables.name IN (${placeholders})
        AND (LOWER(defaults.definition) LIKE '%getdate%'
          OR LOWER(defaults.definition) LIKE '%current_timestamp%'
          OR LOWER(defaults.definition) LIKE '%sysdatetime()%');
    OPEN utc_defaults;
    FETCH NEXT FROM utc_defaults INTO @table, @column, @constraint;
    WHILE @@FETCH_STATUS = 0
    BEGIN
      SET @sql = N'ALTER TABLE dbo.' + QUOTENAME(@table) + N' DROP CONSTRAINT ' + QUOTENAME(@constraint)
        + N'; ALTER TABLE dbo.' + QUOTENAME(@table) + N' ADD CONSTRAINT '
        + QUOTENAME(LEFT(N'DF_UTC_' + @table + N'_' + @column, 128))
        + N' DEFAULT SYSUTCDATETIME() FOR ' + QUOTENAME(@column) + N';';
      EXEC sp_executesql @sql;
      FETCH NEXT FROM utc_defaults INTO @table, @column, @constraint;
    END
    CLOSE utc_defaults;
    DEALLOCATE utc_defaults;
  `, applicationTables);
}

export async function down(): Promise<void> {
  throw new Error('UTC timestamp normalization rollback is disabled.');
}

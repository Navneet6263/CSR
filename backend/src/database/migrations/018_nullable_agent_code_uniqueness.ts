import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  await db.raw(`
    DECLARE @constraintName SYSNAME;

    SELECT TOP (1) @constraintName = kc.name
    FROM sys.key_constraints kc
    JOIN sys.index_columns ic
      ON ic.object_id = kc.parent_object_id
      AND ic.index_id = kc.unique_index_id
    JOIN sys.columns c
      ON c.object_id = ic.object_id
      AND c.column_id = ic.column_id
    WHERE kc.parent_object_id = OBJECT_ID('dbo.Users')
      AND kc.type = 'UQ'
    GROUP BY kc.name
    HAVING COUNT(*) = 1 AND MAX(c.name) = 'AgentCode';

    IF @constraintName IS NOT NULL
    BEGIN
      DECLARE @dropSql NVARCHAR(500);
      SET @dropSql = N'ALTER TABLE dbo.Users DROP CONSTRAINT ' + QUOTENAME(@constraintName);
      EXEC sp_executesql @dropSql;
    END;

    IF NOT EXISTS (
      SELECT 1 FROM sys.indexes
      WHERE object_id = OBJECT_ID('dbo.Users')
        AND name = 'uq_users_agent_code_not_null'
    )
      CREATE UNIQUE INDEX uq_users_agent_code_not_null
        ON dbo.Users(AgentCode)
        WHERE AgentCode IS NOT NULL;
  `);
}

export async function down(): Promise<void> {
  throw new Error('Agent code uniqueness rollback is disabled to protect staff account creation.');
}

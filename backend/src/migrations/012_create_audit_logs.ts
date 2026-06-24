import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('AuditLogs', (table) => {
    table.increments('LogID').primary();
    table.integer('UserID').unsigned().notNullable()
      .references('UserID').inTable('Users').onDelete('CASCADE');
    table.string('Action', 100).notNullable();
    table.string('EntityType', 50).notNullable();
    table.integer('EntityID');
    table.specificType('OldValue', 'NVARCHAR(MAX)');
    table.specificType('NewValue', 'NVARCHAR(MAX)');
    table.string('IPAddress', 50);
    table.specificType('CreatedAt', 'DATETIME2').defaultTo(knex.fn.now());

    table.index(['EntityType', 'EntityID'], 'idx_audit_entity');
    table.index(['UserID'], 'idx_audit_userid');
    table.index(['CreatedAt'], 'idx_audit_createdat');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('AuditLogs');
}

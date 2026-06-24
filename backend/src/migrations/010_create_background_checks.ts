import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('BackgroundChecks', (table) => {
    table.increments('CheckID').primary();
    table.integer('ApplicationID').unsigned().notNullable()
      .references('ApplicationID').inTable('Applications').onDelete('CASCADE');
    table.integer('OfficerID').unsigned().notNullable()
      .references('UserID').inTable('Users').onDelete('CASCADE');
    table.string('CheckType', 50).notNullable();
    table.string('Result', 20).notNullable().defaultTo('Pending')
      .checkIn(['Pass', 'Fail', 'Inconclusive', 'Pending']);
    table.specificType('Notes', 'NVARCHAR(MAX)');
    table.string('EvidenceURL', 500);
    table.specificType('CompletedAt', 'DATETIME2').nullable();
    table.specificType('CreatedAt', 'DATETIME2').defaultTo(knex.fn.now());

    table.index(['ApplicationID'], 'idx_bgchecks_appid');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('BackgroundChecks');
}

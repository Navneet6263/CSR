import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('Institutions', (table) => {
    table.increments('InstitutionID').primary();
    table.string('Name', 200).notNullable();
    table.string('Type', 50).notNullable()
      .checkIn(['School', 'College', 'University']);
    table.string('District', 100);
    table.string('State', 100);
    table.specificType('Address', 'NVARCHAR(MAX)');
    table.string('BankAccountNo', 50);
    table.string('BankIFSC', 20);
    table.boolean('IsVerified').notNullable().defaultTo(false);
    table.specificType('CreatedAt', 'DATETIME2').defaultTo(knex.fn.now());
    table.specificType('UpdatedAt', 'DATETIME2').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('Institutions');
}

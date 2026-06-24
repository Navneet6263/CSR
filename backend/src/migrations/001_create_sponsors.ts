import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('Sponsors', (table) => {
    table.increments('SponsorID').primary();
    table.string('SponsorName', 150).notNullable();
    table.string('ContactPerson', 150).notNullable();
    table.string('Email', 200).notNullable();
    table.string('Phone', 20);
    table.decimal('TotalFund', 15, 2).notNullable().defaultTo(0);
    table.decimal('FundAllocated', 15, 2).notNullable().defaultTo(0);
    table.decimal('FundUtilized', 15, 2).notNullable().defaultTo(0);
    table.string('ApprovalPolicy', 20).notNullable().defaultTo('Manual')
      .checkIn(['Auto', 'Manual']);
    table.string('Status', 20).notNullable().defaultTo('Active');
    table.specificType('CreatedAt', 'DATETIME2').defaultTo(knex.fn.now());
    table.specificType('UpdatedAt', 'DATETIME2').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('Sponsors');
}

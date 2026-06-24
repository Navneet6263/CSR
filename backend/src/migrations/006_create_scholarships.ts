import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('Scholarships', (table) => {
    table.increments('ScholarshipID').primary();
    table.string('Name', 200).notNullable();
    table.specificType('Description', 'NVARCHAR(MAX)');
    table.integer('SponsorID').unsigned().notNullable()
      .references('SponsorID').inTable('Sponsors').onDelete('CASCADE');
    table.decimal('TotalBudget', 15, 2).notNullable().defaultTo(0);
    table.decimal('PerStudentAmount', 10, 2).notNullable().defaultTo(0);
    table.specificType('ApplicationOpenDate', 'DATETIME2');
    table.specificType('ApplicationCloseDate', 'DATETIME2');
    table.integer('MaxApplicants');
    table.string('Status', 20).notNullable().defaultTo('Active');
    table.specificType('CreatedAt', 'DATETIME2').defaultTo(knex.fn.now());
    table.specificType('UpdatedAt', 'DATETIME2').defaultTo(knex.fn.now());

    table.index(['SponsorID'], 'idx_scholarships_sponsorid');
    table.index(['Status'], 'idx_scholarships_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('Scholarships');
}

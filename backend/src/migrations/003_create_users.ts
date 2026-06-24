import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('Users', (table) => {
    table.increments('UserID').primary();
    table.string('FullName', 150).notNullable();
    table.string('Email', 200).notNullable().unique();
    table.string('Phone', 20);
    table.string('PasswordHash', 255).notNullable();
    table.string('Role', 30).notNullable()
      .checkIn([
        'Student', 'Agent', 'DocReviewer', 'BGCheckOfficer',
        'ScreeningOfficer', 'CSRPartner', 'Admin', 'Finance',
      ]);
    table.string('AgentCode', 20).unique().nullable();
    table.integer('SponsorID').unsigned().nullable()
      .references('SponsorID').inTable('Sponsors').onDelete('SET NULL');
    table.boolean('IsActive').notNullable().defaultTo(true);
    table.specificType('CreatedAt', 'DATETIME2').defaultTo(knex.fn.now());
    table.specificType('UpdatedAt', 'DATETIME2').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('Users');
}

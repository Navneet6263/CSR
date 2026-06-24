import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('Payments', (table) => {
    table.increments('PaymentID').primary();
    table.integer('ApplicationID').unsigned().notNullable()
      .references('ApplicationID').inTable('Applications').onDelete('CASCADE');
    table.integer('StudentID').unsigned().nullable()
      .references('StudentID').inTable('Students').onDelete('SET NULL');
    table.integer('InstitutionID').unsigned().nullable()
      .references('InstitutionID').inTable('Institutions').onDelete('SET NULL');
    table.integer('SponsorID').unsigned().notNullable()
      .references('SponsorID').inTable('Sponsors').onDelete('CASCADE');
    table.decimal('Amount', 10, 2).notNullable();
    table.string('PaymentType', 20).notNullable()
      .checkIn(['Direct', 'Institution']);
    table.string('Status', 20).notNullable().defaultTo('Pending')
      .checkIn(['Pending', 'Initiated', 'Completed', 'Failed']);
    table.string('ReferenceNo', 100);
    table.integer('MakerID').unsigned().notNullable()
      .references('UserID').inTable('Users').onDelete('CASCADE');
    table.integer('CheckerID').unsigned().nullable()
      .references('UserID').inTable('Users').onDelete('SET NULL');
    table.specificType('MakerNotes', 'NVARCHAR(MAX)');
    table.specificType('CheckerNotes', 'NVARCHAR(MAX)');
    table.specificType('CreatedAt', 'DATETIME2').defaultTo(knex.fn.now());
    table.specificType('UpdatedAt', 'DATETIME2').defaultTo(knex.fn.now());

    table.index(['ApplicationID'], 'idx_payments_appid');
    table.index(['Status'], 'idx_payments_status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('Payments');
}

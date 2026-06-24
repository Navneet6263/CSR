import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('Students', (table) => {
    table.increments('StudentID').primary();
    table.integer('UserID').unsigned().notNullable()
      .references('UserID').inTable('Users').onDelete('CASCADE');
    table.string('AadharNumber', 20);
    table.date('DOB');
    table.string('Gender', 10);
    table.string('Category', 50);
    table.specificType('Address', 'NVARCHAR(MAX)');
    table.string('City', 100);
    table.string('State', 100);
    table.string('Pincode', 10);
    table.decimal('AnnualFamilyIncome', 15, 2);
    table.integer('FamilySize');
    table.string('Course', 200);
    table.integer('InstitutionID').unsigned().nullable()
      .references('InstitutionID').inTable('Institutions').onDelete('SET NULL');
    table.string('OtherInstitutionName', 200);
    table.integer('EnrollmentYear');
    table.string('BankAccountNo', 50);
    table.string('BankIFSC', 20);
    table.string('BankName', 100);
    table.specificType('CreatedAt', 'DATETIME2').defaultTo(knex.fn.now());

    table.index(['UserID'], 'idx_students_userid');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('Students');
}

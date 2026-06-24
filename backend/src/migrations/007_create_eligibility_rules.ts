import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('EligibilityRules', (table) => {
    table.increments('RuleID').primary();
    table.integer('ScholarshipID').unsigned().notNullable()
      .references('ScholarshipID').inTable('Scholarships').onDelete('CASCADE');
    table.string('RuleType', 50).notNullable()
      .checkIn([
        'Income', 'Age', 'Gender', 'Category', 'State',
        'Course', 'Institution', 'Enrollment', 'FamilySize',
      ]);
    table.string('Operator', 10);
    table.string('ValueMin', 200);
    table.string('ValueMax', 200);
    table.specificType('ValueList', 'NVARCHAR(MAX)');
    table.boolean('IsRequired').notNullable().defaultTo(true);
    table.specificType('CreatedAt', 'DATETIME2').defaultTo(knex.fn.now());

    table.index(['ScholarshipID'], 'idx_eligibility_scholarshipid');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('EligibilityRules');
}

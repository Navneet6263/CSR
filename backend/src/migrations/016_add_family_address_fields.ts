import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('Students', (table) => {
    table.text('PermanentAddress').nullable();
    table.integer('CurrentAddressDurationMonths').nullable();
    
    table.integer('NumberOfSiblings').notNullable().defaultTo(0);
    // SiblingDetails will store JSON array of objects: { age, gender, occupation, salary }
    table.json('SiblingDetails').nullable();
    
    table.string('FatherOccupation', 100).nullable();
    table.string('MotherOccupation', 100).nullable();

    // New Document URL fields
    table.string('FatherAadharFileURL', 500).nullable();
    table.string('MotherAadharFileURL', 500).nullable();
    table.string('FatherPayslipFileURL', 500).nullable();
    table.string('BankStatement6MonthsFileURL', 500).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('Students', (table) => {
    table.dropColumn('PermanentAddress');
    table.dropColumn('CurrentAddressDurationMonths');
    table.dropColumn('NumberOfSiblings');
    table.dropColumn('SiblingDetails');
    table.dropColumn('FatherOccupation');
    table.dropColumn('MotherOccupation');
    table.dropColumn('FatherAadharFileURL');
    table.dropColumn('MotherAadharFileURL');
    table.dropColumn('FatherPayslipFileURL');
    table.dropColumn('BankStatement6MonthsFileURL');
  });
}

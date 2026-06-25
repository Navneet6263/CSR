import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('Students', (table) => {
    // Academic Details
    table.decimal('PreviousYearMarks', 5, 2).nullable(); // e.g. 95.50
    table.string('TenthBoardName', 100).nullable();
    table.integer('TenthPassingYear').nullable();
    table.decimal('TenthMarks', 5, 2).nullable();
    table.string('TwelfthBoardName', 100).nullable();
    table.integer('TwelfthPassingYear').nullable();
    table.decimal('TwelfthMarks', 5, 2).nullable();
    table.string('CurrentSemesterOrYear', 50).nullable();
    table.string('AdmissionRegistrationNo', 100).nullable();

    // Family Details
    table.string('FatherName', 100).nullable();
    table.string('FatherOccupation', 100).nullable();
    table.string('MotherName', 100).nullable();
    table.string('MotherOccupation', 100).nullable();

    // Demographics & Special Status
    table.string('Religion', 50).nullable();
    table.boolean('IsDisabled').notNullable().defaultTo(false);
    table.decimal('DisabilityPercentage', 5, 2).nullable();
    table.string('DomicileState', 100).nullable();
    table.string('DomicileDistrict', 100).nullable();

    // Financial specifics
    table.decimal('TuitionFee', 10, 2).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('Students', (table) => {
    table.dropColumn('PreviousYearMarks');
    table.dropColumn('TenthBoardName');
    table.dropColumn('TenthPassingYear');
    table.dropColumn('TenthMarks');
    table.dropColumn('TwelfthBoardName');
    table.dropColumn('TwelfthPassingYear');
    table.dropColumn('TwelfthMarks');
    table.dropColumn('CurrentSemesterOrYear');
    table.dropColumn('AdmissionRegistrationNo');
    table.dropColumn('FatherName');
    table.dropColumn('FatherOccupation');
    table.dropColumn('MotherName');
    table.dropColumn('MotherOccupation');
    table.dropColumn('Religion');
    table.dropColumn('IsDisabled');
    table.dropColumn('DisabilityPercentage');
    table.dropColumn('DomicileState');
    table.dropColumn('DomicileDistrict');
    table.dropColumn('TuitionFee');
  });
}

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('Students', (table) => {
    // Identity & Address
    table.string('CasteCertificateNumber', 100).nullable();
    table.date('CasteCertificateIssueDate').nullable();
    table.string('DomicileCertificateNumber', 100).nullable();
    table.string('AlternatePhone', 20).nullable();

    // Education / Hostel
    table.boolean('IsHosteller').notNullable().defaultTo(false);
    table.decimal('DistanceFromHome', 5, 1).nullable();
    table.boolean('HasGapYear').notNullable().defaultTo(false);
    table.text('GapYearExplanation').nullable();

    // Previous Scholarship
    table.boolean('ReceivedPreviousScholarship').notNullable().defaultTo(false);
    table.string('PreviousScholarshipName', 200).nullable();
    table.decimal('PreviousScholarshipAmount', 10, 2).nullable();
    table.integer('PreviousScholarshipYear').nullable();

    // Bank Details
    table.boolean('IsAadhaarLinkedToBank').notNullable().defaultTo(false);
    table.boolean('IsEKYCVerified').notNullable().defaultTo(false);

    // Corporate Extras
    table.text('StatementOfPurpose').nullable();
    table.text('ExtracurricularActivities').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('Students', (table) => {
    table.dropColumn('CasteCertificateNumber');
    table.dropColumn('CasteCertificateIssueDate');
    table.dropColumn('DomicileCertificateNumber');
    table.dropColumn('AlternatePhone');
    table.dropColumn('IsHosteller');
    table.dropColumn('DistanceFromHome');
    table.dropColumn('HasGapYear');
    table.dropColumn('GapYearExplanation');
    table.dropColumn('ReceivedPreviousScholarship');
    table.dropColumn('PreviousScholarshipName');
    table.dropColumn('PreviousScholarshipAmount');
    table.dropColumn('PreviousScholarshipYear');
    table.dropColumn('IsAadhaarLinkedToBank');
    table.dropColumn('IsEKYCVerified');
    table.dropColumn('StatementOfPurpose');
    table.dropColumn('ExtracurricularActivities');
  });
}

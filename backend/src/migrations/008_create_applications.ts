import type { Knex } from 'knex';

const APPLICATION_STATUSES = [
  'Draft', 'Submitted', 'AutoMatched', 'EligibilityFailed',
  'DocAuditInProgress', 'DocAuditComplete',
  'BGCheckInProgress', 'BGCheckComplete',
  'ScreeningPending', 'ScreeningApproved', 'ScreeningRejected',
  'CSRPending', 'CSRApproved', 'CSRDeclined',
  'PaymentPending', 'PaymentInitiated', 'PaymentCompleted', 'Cancelled',
];

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('Applications', (table) => {
    table.increments('ApplicationID').primary();
    table.integer('StudentID').unsigned().notNullable()
      .references('StudentID').inTable('Students').onDelete('CASCADE');
    table.integer('AgentID').unsigned().nullable()
      .references('AgentID').inTable('Agents').onDelete('SET NULL');
    table.integer('ScholarshipID').unsigned().notNullable()
      .references('ScholarshipID').inTable('Scholarships').onDelete('CASCADE');
    table.specificType('SubmissionDate', 'DATETIME2');
    table.string('Status', 40).notNullable().defaultTo('Draft')
      .checkIn(APPLICATION_STATUSES);
    table.integer('AssignedDocReviewer').unsigned().nullable()
      .references('UserID').inTable('Users').onDelete('SET NULL');
    table.integer('AssignedBGOfficer').unsigned().nullable()
      .references('UserID').inTable('Users').onDelete('SET NULL');
    table.integer('AssignedScreener').unsigned().nullable()
      .references('UserID').inTable('Users').onDelete('SET NULL');
    table.decimal('ScholarshipAmount', 10, 2);
    table.integer('SponsorID').unsigned().nullable()
      .references('SponsorID').inTable('Sponsors').onDelete('SET NULL');
    table.integer('AdminApprovedBy').unsigned().nullable()
      .references('UserID').inTable('Users').onDelete('SET NULL');
    table.specificType('AdminApprovedAt', 'DATETIME2').nullable();
    table.specificType('Notes', 'NVARCHAR(MAX)');
    table.specificType('CreatedAt', 'DATETIME2').defaultTo(knex.fn.now());

    table.index(['ScholarshipID', 'Status'], 'idx_app_scholarship_status');
    table.index(['StudentID'], 'idx_app_studentid');
    table.index(['AgentID'], 'idx_app_agentid');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('Applications');
}

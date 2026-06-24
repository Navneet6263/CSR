import type { Knex } from 'knex';

const DOCUMENT_TYPES = [
  'Aadhar', 'Income', 'Caste', 'Marksheet',
  'BankPassbook', 'Photo', 'FeeReceipt', 'Other',
];

const DOC_STATUSES = ['Pending', 'Uploaded', 'Verified', 'Rejected', 'ReUploadRequested'];

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('DocumentChecklist', (table) => {
    table.increments('ChecklistID').primary();
    table.integer('ApplicationID').unsigned().notNullable()
      .references('ApplicationID').inTable('Applications').onDelete('CASCADE');
    table.string('DocumentType', 50).notNullable()
      .checkIn(DOCUMENT_TYPES);
    table.string('FileURL', 500);
    table.specificType('UploadedAt', 'DATETIME2').nullable();
    table.integer('ReviewedBy').unsigned().nullable()
      .references('UserID').inTable('Users').onDelete('SET NULL');
    table.specificType('ReviewedAt', 'DATETIME2').nullable();
    table.string('Status', 20).notNullable().defaultTo('Pending')
      .checkIn(DOC_STATUSES);
    table.string('RejectionReason', 500);
    table.integer('ReUploadCount').notNullable().defaultTo(0);
    table.specificType('CreatedAt', 'DATETIME2').defaultTo(knex.fn.now());

    table.index(['ApplicationID'], 'idx_docchecklist_appid');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('DocumentChecklist');
}

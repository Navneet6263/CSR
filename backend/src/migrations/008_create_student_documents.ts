import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('StudentDocuments', (table) => {
    table.increments('DocumentID').primary();
    table.integer('StudentID').unsigned().notNullable()
      .references('StudentID').inTable('Students').onDelete('CASCADE');
    table.string('DocumentType', 50).notNullable(); // aadhar, pan, income, education, bank, photo
    table.string('FileURL', 500).notNullable();
    table.specificType('UploadedAt', 'DATETIME2').defaultTo(knex.fn.now());

    // A student should only have one active document of each type
    table.unique(['StudentID', 'DocumentType'], { indexName: 'idx_student_document_unique' });
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('StudentDocuments');
}

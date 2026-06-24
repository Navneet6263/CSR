import db from './src/config/database';

async function run() {
  try {
    const exists = await db.schema.hasTable('StudentDocuments');
    if (!exists) {
      await db.schema.createTable('StudentDocuments', (table) => {
        table.increments('DocumentID').primary();
        table.integer('StudentID').unsigned().notNullable()
          .references('StudentID').inTable('Students').onDelete('CASCADE');
        table.string('DocumentType', 50).notNullable(); 
        table.string('FileURL', 500).notNullable();
        table.specificType('UploadedAt', 'DATETIME2').defaultTo(db.fn.now());
    
        // A student should only have one active document of each type
        table.unique(['StudentID', 'DocumentType'], { indexName: 'idx_student_document_unique' });
      });
      console.log('StudentDocuments table created');
    } else {
      console.log('StudentDocuments already exists');
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();

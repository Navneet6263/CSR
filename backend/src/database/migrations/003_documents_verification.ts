import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  if (!await db.schema.hasTable('StudentDocuments')) {
    await db.schema.createTable('StudentDocuments', (t) => {
      t.increments('DocumentID').primary();
      t.integer('StudentID').notNullable().references('StudentID').inTable('Students').onDelete('CASCADE');
      t.string('DocumentType', 50).notNullable(); t.string('FileURL', 500).notNullable();
      t.string('StorageKey', 500); t.string('OriginalName', 255); t.string('MimeType', 100);
      t.bigInteger('SizeBytes'); t.string('Sha256', 64); t.string('ScanStatus', 20).defaultTo('Pending');
      t.integer('CurrentVersion').notNullable().defaultTo(1); t.boolean('IsActive').notNullable().defaultTo(true);
      t.specificType('UploadedAt', 'DATETIME2').defaultTo(db.fn.now());
      t.unique(['StudentID', 'DocumentType'], { indexName: 'uq_student_document_type' });
    });
  }

  if (!await db.schema.hasTable('DocumentVersions')) {
    await db.schema.createTable('DocumentVersions', (t) => {
      t.bigIncrements('DocumentVersionID').primary();
      t.integer('DocumentID').notNullable().references('DocumentID').inTable('StudentDocuments').onDelete('CASCADE');
      t.integer('VersionNumber').notNullable(); t.string('StorageKey', 500).notNullable();
      t.string('OriginalName', 255).notNullable(); t.string('MimeType', 100).notNullable();
      t.bigInteger('SizeBytes').notNullable(); t.string('Sha256', 64).notNullable();
      t.string('ScanStatus', 20).notNullable().defaultTo('Pending');
      t.integer('UploadedBy').notNullable().references('UserID').inTable('Users');
      t.specificType('UploadedAt', 'DATETIME2').defaultTo(db.fn.now());
      t.unique(['DocumentID', 'VersionNumber'], { indexName: 'uq_document_version' });
    });
  }

  if (!await db.schema.hasTable('DocumentChecklist')) {
    await db.schema.createTable('DocumentChecklist', (t) => {
      t.increments('ChecklistID').primary();
      t.integer('ApplicationID').notNullable().references('ApplicationID').inTable('Applications').onDelete('CASCADE');
      t.string('DocumentType', 50).notNullable(); t.string('FileURL', 500);
      t.bigInteger('DocumentVersionID').references('DocumentVersionID').inTable('DocumentVersions');
      t.specificType('UploadedAt', 'DATETIME2');
      t.integer('ReviewedBy').references('UserID').inTable('Users'); t.specificType('ReviewedAt', 'DATETIME2');
      t.string('Status', 20).notNullable().defaultTo('Pending'); t.string('RejectionReason', 500);
      t.integer('ReUploadCount').notNullable().defaultTo(0); t.integer('Version').notNullable().defaultTo(0);
      t.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
      t.unique(['ApplicationID', 'DocumentType'], { indexName: 'uq_checklist_app_type' });
    });
  }

  if (!await db.schema.hasTable('ScholarshipDocumentRequirements')) {
    await db.schema.createTable('ScholarshipDocumentRequirements', (t) => {
      t.increments('RequirementID').primary();
      t.integer('ScholarshipID').notNullable().references('ScholarshipID').inTable('Scholarships').onDelete('CASCADE');
      t.string('DocumentType', 50).notNullable(); t.boolean('IsRequired').notNullable().defaultTo(true);
      t.unique(['ScholarshipID', 'DocumentType'], { indexName: 'uq_scholarship_doc_requirement' });
    });
  }

  if (!await db.schema.hasTable('BackgroundChecks')) {
    await db.schema.createTable('BackgroundChecks', (t) => {
      t.increments('CheckID').primary();
      t.integer('ApplicationID').notNullable().references('ApplicationID').inTable('Applications').onDelete('CASCADE');
      t.integer('OfficerID').notNullable().references('UserID').inTable('Users');
      t.string('CheckType', 50).notNullable(); t.string('Result', 20).notNullable();
      t.text('Notes'); t.string('EvidenceURL', 500); t.specificType('CompletedAt', 'DATETIME2');
      t.integer('Version').notNullable().defaultTo(1);
      t.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
      t.specificType('UpdatedAt', 'DATETIME2').defaultTo(db.fn.now());
      t.unique(['ApplicationID', 'CheckType'], { indexName: 'uq_bgcheck_app_type' });
    });
  }
}

export async function down(): Promise<void> {
  throw new Error('Document baseline rollback is disabled to protect existing data.');
}

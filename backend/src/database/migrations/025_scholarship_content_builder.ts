import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  if (!await db.schema.hasColumn('Sponsors', 'LogoStorageKey')) {
    await db.schema.alterTable('Sponsors', (table) => {
      table.string('LogoStorageKey', 500);
      table.string('LogoOriginalName', 255);
      table.string('LogoMimeType', 100);
      table.specificType('LogoUpdatedAt', 'DATETIME2');
    });
  }

  if (!await db.schema.hasTable('ScholarshipContents')) {
    await db.schema.createTable('ScholarshipContents', (table) => {
      table.increments('ContentID').primary();
      table.integer('ScholarshipID').notNullable().unique('uq_scholarship_content')
        .references('ScholarshipID').inTable('Scholarships').onDelete('CASCADE');
      table.specificType('DraftJSON', 'NVARCHAR(MAX)').notNullable();
      table.specificType('PublishedJSON', 'NVARCHAR(MAX)');
      table.string('ReviewStatus', 20).notNullable().defaultTo('Draft');
      table.integer('DraftVersion').notNullable().defaultTo(1);
      table.integer('PublishedVersion');
      table.string('SourceType', 20).notNullable().defaultTo('Generated');
      table.string('SourceStorageKey', 500);
      table.string('SourceOriginalName', 255);
      table.string('SourceMimeType', 150);
      table.specificType('ExtractedText', 'NVARCHAR(MAX)');
      table.integer('ReviewedBy').references('UserID').inTable('Users').onDelete('SET NULL');
      table.specificType('ReviewedAt', 'DATETIME2');
      table.specificType('PublishedAt', 'DATETIME2');
      table.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
      table.specificType('UpdatedAt', 'DATETIME2').defaultTo(db.fn.now());
      table.index(['ReviewStatus', 'UpdatedAt'], 'idx_scholarship_content_review');
    });
  }

  if (!await db.schema.hasTable('ScholarshipContentVersions')) {
    await db.schema.createTable('ScholarshipContentVersions', (table) => {
      table.increments('VersionID').primary();
      table.integer('ContentID').notNullable().references('ContentID')
        .inTable('ScholarshipContents').onDelete('CASCADE');
      table.integer('VersionNumber').notNullable();
      table.specificType('ContentJSON', 'NVARCHAR(MAX)').notNullable();
      table.string('SourceType', 20).notNullable();
      table.string('SourceStorageKey', 500);
      table.string('SourceOriginalName', 255);
      table.integer('EditedBy').references('UserID').inTable('Users').onDelete('SET NULL');
      table.string('ChangeNote', 500);
      table.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
      table.unique(['ContentID', 'VersionNumber'], 'uq_scholarship_content_version');
      table.index(['ContentID', 'CreatedAt'], 'idx_scholarship_content_history');
    });
  }
}

export async function down(): Promise<void> {
  throw new Error('Scholarship content rollback is disabled to protect published program terms.');
}

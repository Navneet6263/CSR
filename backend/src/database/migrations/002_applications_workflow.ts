import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  if (!await db.schema.hasTable('Scholarships')) {
    await db.schema.createTable('Scholarships', (t) => {
      t.increments('ScholarshipID').primary();
      t.string('Name', 200).notNullable(); t.text('Description');
      t.integer('SponsorID').notNullable().references('SponsorID').inTable('Sponsors');
      t.decimal('TotalBudget', 15, 2).notNullable().defaultTo(0);
      t.decimal('PerStudentAmount', 10, 2).notNullable();
      t.specificType('ApplicationOpenDate', 'DATETIME2').notNullable();
      t.specificType('ApplicationCloseDate', 'DATETIME2').notNullable();
      t.integer('MaxApplicants'); t.string('Status', 20).notNullable().defaultTo('Active');
      t.string('AcademicYear', 20); t.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
      t.specificType('UpdatedAt', 'DATETIME2').defaultTo(db.fn.now());
    });
  }

  if (!await db.schema.hasTable('EligibilityRules')) {
    await db.schema.createTable('EligibilityRules', (t) => {
      t.increments('RuleID').primary();
      t.integer('ScholarshipID').notNullable().references('ScholarshipID').inTable('Scholarships').onDelete('CASCADE');
      t.string('RuleType', 50).notNullable(); t.string('Operator', 10).notNullable();
      t.string('ValueMin', 200); t.string('ValueMax', 200); t.text('ValueList');
      t.boolean('IsRequired').notNullable().defaultTo(true); t.integer('RuleVersion').notNullable().defaultTo(1);
      t.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
    });
  }

  if (!await db.schema.hasTable('Applications')) {
    await db.schema.createTable('Applications', (t) => {
      t.increments('ApplicationID').primary();
      t.integer('StudentID').notNullable().references('StudentID').inTable('Students');
      t.integer('AgentID').references('AgentID').inTable('Agents');
      t.integer('ScholarshipID').notNullable().references('ScholarshipID').inTable('Scholarships');
      t.specificType('SubmissionDate', 'DATETIME2'); t.string('Status', 40).notNullable().defaultTo('Draft');
      t.integer('AssignedDocReviewer').references('UserID').inTable('Users');
      t.integer('AssignedBGOfficer').references('UserID').inTable('Users');
      t.integer('AssignedScreener').references('UserID').inTable('Users');
      t.decimal('ScholarshipAmount', 10, 2); t.integer('SponsorID').references('SponsorID').inTable('Sponsors');
      t.text('Notes'); t.boolean('IsHeldByAdmin').notNullable().defaultTo(false); t.text('AdminHoldReason');
      t.integer('Version').notNullable().defaultTo(0); t.text('SubmittedSnapshot'); t.text('EligibilitySnapshot');
      t.specificType('StageEnteredAt', 'DATETIME2').defaultTo(db.fn.now());
      t.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
      t.specificType('UpdatedAt', 'DATETIME2').defaultTo(db.fn.now());
    });
  }

  if (!await db.schema.hasTable('ApplicationStatusHistory')) {
    await db.schema.createTable('ApplicationStatusHistory', (t) => {
      t.bigIncrements('HistoryID').primary();
      t.integer('ApplicationID').notNullable().references('ApplicationID').inTable('Applications').onDelete('CASCADE');
      t.string('FromStatus', 40); t.string('ToStatus', 40).notNullable();
      t.integer('ActorUserID').references('UserID').inTable('Users'); t.string('ActorRole', 30);
      t.string('Reason', 1000); t.string('RequestID', 100); t.integer('Version').notNullable();
      t.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
    });
  }

  if (!await db.schema.hasTable('EligibilityEvaluations')) {
    await db.schema.createTable('EligibilityEvaluations', (t) => {
      t.bigIncrements('EvaluationID').primary();
      t.integer('StudentID').notNullable().references('StudentID').inTable('Students');
      t.integer('ScholarshipID').notNullable().references('ScholarshipID').inTable('Scholarships');
      t.integer('ApplicationID').references('ApplicationID').inTable('Applications').onDelete('SET NULL');
      t.boolean('IsEligible').notNullable(); t.text('ResultJSON').notNullable();
      t.string('ProfileFingerprint', 64).notNullable(); t.integer('RulesVersion').notNullable().defaultTo(1);
      t.specificType('EvaluatedAt', 'DATETIME2').defaultTo(db.fn.now());
    });
  }
}

export async function down(): Promise<void> {
  throw new Error('Application baseline rollback is disabled to protect existing data.');
}

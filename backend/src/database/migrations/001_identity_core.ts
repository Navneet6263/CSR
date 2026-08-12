import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  if (!await db.schema.hasTable('Sponsors')) {
    await db.schema.createTable('Sponsors', (t) => {
      t.increments('SponsorID').primary();
      t.string('SponsorName', 150).notNullable();
      t.string('ContactPerson', 150).notNullable();
      t.string('Email', 200).notNullable();
      t.string('Phone', 20);
      t.decimal('TotalFund', 15, 2).notNullable().defaultTo(0);
      t.decimal('FundAllocated', 15, 2).notNullable().defaultTo(0);
      t.decimal('FundUtilized', 15, 2).notNullable().defaultTo(0);
      t.string('ApprovalPolicy', 20).notNullable().defaultTo('Manual');
      t.string('Status', 20).notNullable().defaultTo('Active');
      t.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
      t.specificType('UpdatedAt', 'DATETIME2').defaultTo(db.fn.now());
    });
  }

  if (!await db.schema.hasTable('Institutions')) {
    await db.schema.createTable('Institutions', (t) => {
      t.increments('InstitutionID').primary();
      t.string('Name', 200).notNullable();
      t.string('Type', 50).notNullable();
      t.string('District', 100);
      t.string('State', 100);
      t.text('Address');
      t.string('BankAccountNo', 50);
      t.string('BankIFSC', 20);
      t.boolean('IsVerified').notNullable().defaultTo(false);
      t.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
      t.specificType('UpdatedAt', 'DATETIME2').defaultTo(db.fn.now());
    });
  }

  if (!await db.schema.hasTable('Users')) {
    await db.schema.createTable('Users', (t) => {
      t.increments('UserID').primary();
      t.string('FullName', 150).notNullable();
      t.string('Email', 200).notNullable().unique('uq_users_email');
      t.string('Phone', 20);
      t.string('PasswordHash', 255).notNullable();
      t.string('Role', 30).notNullable();
      t.string('AgentCode', 20);
      t.integer('SponsorID').references('SponsorID').inTable('Sponsors').onDelete('SET NULL');
      t.boolean('IsActive').notNullable().defaultTo(true);
      t.integer('TokenVersion').notNullable().defaultTo(0);
      t.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
      t.specificType('UpdatedAt', 'DATETIME2').defaultTo(db.fn.now());
    });
  }

  if (!await db.schema.hasTable('Agents')) {
    await db.schema.createTable('Agents', (t) => {
      t.increments('AgentID').primary();
      t.integer('UserID').notNullable().references('UserID').inTable('Users');
      t.string('AgentCode', 20).notNullable();
      t.string('Region', 100);
      t.decimal('CommissionRate', 5, 2).notNullable().defaultTo(0);
      t.decimal('TotalCommission', 15, 2).notNullable().defaultTo(0);
      t.boolean('IsActive').notNullable().defaultTo(true);
      t.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
    });
  }

  if (!await db.schema.hasTable('Students')) {
    await db.schema.createTable('Students', (t) => {
      t.increments('StudentID').primary();
      t.integer('UserID').notNullable().references('UserID').inTable('Users');
      t.string('AadharNumber', 20); t.date('DOB'); t.string('Gender', 10); t.string('Category', 50);
      t.text('Address'); t.string('City', 100); t.string('State', 100); t.string('Pincode', 10);
      t.decimal('AnnualFamilyIncome', 15, 2); t.integer('FamilySize'); t.string('Course', 200);
      t.integer('InstitutionID').references('InstitutionID').inTable('Institutions').onDelete('SET NULL');
      t.string('OtherInstitutionName', 200); t.integer('EnrollmentYear');
      t.string('BankAccountNo', 50); t.string('BankIFSC', 20); t.string('BankName', 100);
      t.decimal('PreviousYearMarks', 5, 2); t.string('CurrentSemesterOrYear', 50);
      t.string('AdmissionRegistrationNo', 100); t.string('FatherName', 100); t.string('MotherName', 100);
      t.string('FatherOccupation', 100); t.string('MotherOccupation', 100); t.string('Religion', 50);
      t.boolean('IsDisabled').notNullable().defaultTo(false); t.decimal('DisabilityPercentage', 5, 2);
      t.string('DomicileState', 100); t.string('DomicileDistrict', 100); t.decimal('TuitionFee', 10, 2);
      t.boolean('IsHosteller').notNullable().defaultTo(false); t.boolean('HasGapYear').notNullable().defaultTo(false);
      t.text('GapYearExplanation'); t.boolean('IsAadhaarLinkedToBank').notNullable().defaultTo(false);
      t.boolean('IsEKYCVerified').notNullable().defaultTo(false); t.text('StatementOfPurpose');
      t.text('ExtracurricularActivities'); t.text('PermanentAddress'); t.string('PermanentCity', 100);
      t.string('PermanentState', 100); t.string('PermanentPincode', 20);
      t.boolean('IsPermanentSameAsCurrent').defaultTo(false); t.integer('CurrentAddressDurationMonths');
      t.integer('NumberOfSiblings').defaultTo(0); t.text('SiblingDetails');
      t.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
      t.specificType('UpdatedAt', 'DATETIME2').defaultTo(db.fn.now());
    });
  }

  if (!await db.schema.hasTable('AuthSessions')) {
    await db.schema.createTable('AuthSessions', (t) => {
      t.string('SessionID', 64).primary();
      t.integer('UserID').notNullable().references('UserID').inTable('Users').onDelete('CASCADE');
      t.string('RefreshTokenHash', 64).notNullable();
      t.string('UserAgentHash', 64); t.string('IPAddress', 64);
      t.specificType('ExpiresAt', 'DATETIME2').notNullable();
      t.specificType('RevokedAt', 'DATETIME2'); t.specificType('LastUsedAt', 'DATETIME2');
      t.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
      t.index(['UserID', 'ExpiresAt'], 'idx_auth_sessions_user_expiry');
    });
  }
}

export async function down(): Promise<void> {
  throw new Error('Identity baseline rollback is disabled to protect existing data.');
}

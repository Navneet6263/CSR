import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  if (!await db.schema.hasTable('Payments')) {
    await db.schema.createTable('Payments', (t) => {
      t.increments('PaymentID').primary();
      t.integer('ApplicationID').notNullable().references('ApplicationID').inTable('Applications');
      t.integer('StudentID').references('StudentID').inTable('Students');
      t.integer('InstitutionID').references('InstitutionID').inTable('Institutions');
      t.integer('SponsorID').notNullable().references('SponsorID').inTable('Sponsors');
      t.decimal('Amount', 10, 2).notNullable(); t.string('PaymentType', 20).notNullable();
      t.string('Status', 20).notNullable().defaultTo('Pending'); t.string('ReferenceNo', 100);
      t.integer('MakerID').notNullable().references('UserID').inTable('Users');
      t.integer('CheckerID').references('UserID').inTable('Users');
      t.text('MakerNotes'); t.text('CheckerNotes'); t.string('IdempotencyKey', 100);
      t.text('DestinationCiphertext');
      t.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
      t.specificType('UpdatedAt', 'DATETIME2').defaultTo(db.fn.now());
    });
  }

  if (!await db.schema.hasTable('AuditLogs')) {
    await db.schema.createTable('AuditLogs', (t) => {
      t.bigIncrements('LogID').primary();
      t.integer('UserID').references('UserID').inTable('Users');
      t.string('Action', 100).notNullable(); t.string('EntityType', 50).notNullable(); t.integer('EntityID');
      t.text('OldValue'); t.text('NewValue'); t.string('IPAddress', 64); t.string('RequestID', 100);
      t.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
    });
  }

  if (!await db.schema.hasTable('Notifications')) {
    await db.schema.createTable('Notifications', (t) => {
      t.bigIncrements('NotificationID').primary();
      t.integer('UserID').notNullable().references('UserID').inTable('Users').onDelete('CASCADE');
      t.string('Type', 50).notNullable(); t.string('Channel', 20).notNullable(); t.text('Message').notNullable();
      t.text('Payload'); t.boolean('IsSent').notNullable().defaultTo(false); t.specificType('SentAt', 'DATETIME2');
      t.integer('RetryCount').notNullable().defaultTo(0); t.specificType('NextAttemptAt', 'DATETIME2');
      t.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
    });
  }

  if (!await db.schema.hasTable('IdempotencyKeys')) {
    await db.schema.createTable('IdempotencyKeys', (t) => {
      t.bigIncrements('IdempotencyID').primary();
      t.integer('UserID').notNullable().references('UserID').inTable('Users').onDelete('CASCADE');
      t.string('Scope', 80).notNullable(); t.string('IdempotencyKey', 100).notNullable();
      t.string('RequestHash', 64).notNullable(); t.integer('ResponseStatus'); t.text('ResponseBody');
      t.string('State', 20).notNullable().defaultTo('Processing');
      t.specificType('ExpiresAt', 'DATETIME2').notNullable();
      t.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
      t.unique(['UserID', 'Scope', 'IdempotencyKey'], { indexName: 'uq_idempotency_user_scope_key' });
    });
  }
}

export async function down(): Promise<void> {
  throw new Error('Finance baseline rollback is disabled to protect existing data.');
}

import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  if (!await db.schema.hasTable('PasswordResetTokens')) await db.schema.createTable('PasswordResetTokens', (table) => {
    table.bigIncrements('ResetID').primary(); table.integer('UserID').notNullable().references('UserID').inTable('Users');
    table.string('TokenHash', 64).notNullable().unique(); table.specificType('ExpiresAt', 'DATETIME2').notNullable();
    table.specificType('UsedAt', 'DATETIME2'); table.string('RequestIP', 64); table.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
    table.index(['UserID', 'ExpiresAt'], 'idx_password_reset_user_expiry');
  });
  if (!await db.schema.hasTable('EmailOutbox')) await db.schema.createTable('EmailOutbox', (table) => {
    table.bigIncrements('EmailID').primary(); table.string('RecipientEmail', 320).notNullable();
    table.string('TemplateName', 80).notNullable(); table.text('PayloadJson').notNullable();
    table.string('Status', 20).notNullable().defaultTo('Pending'); table.integer('Attempts').notNullable().defaultTo(0);
    table.specificType('AvailableAt', 'DATETIME2').defaultTo(db.fn.now()); table.specificType('SentAt', 'DATETIME2');
    table.text('LastError'); table.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
    table.specificType('UpdatedAt', 'DATETIME2').defaultTo(db.fn.now()); table.index(['Status', 'AvailableAt'], 'idx_email_outbox_pending');
  });
  if (!await db.schema.hasTable('AdminAnnouncements')) await db.schema.createTable('AdminAnnouncements', (table) => {
    table.bigIncrements('AnnouncementID').primary(); table.string('Title', 180).notNullable(); table.text('Message').notNullable();
    table.string('Audience', 30).notNullable().defaultTo('All'); table.string('Status', 20).notNullable().defaultTo('Draft');
    table.integer('CreatedBy').notNullable().references('UserID').inTable('Users'); table.specificType('PublishedAt', 'DATETIME2');
    table.specificType('ExpiresAt', 'DATETIME2'); table.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
    table.specificType('UpdatedAt', 'DATETIME2').defaultTo(db.fn.now()); table.index(['Status', 'Audience', 'PublishedAt'], 'idx_announcements_public');
  });
  if (!await db.schema.hasTable('SupportTickets')) await db.schema.createTable('SupportTickets', (table) => {
    table.bigIncrements('TicketID').primary(); table.integer('UserID').notNullable().references('UserID').inTable('Users');
    table.string('Subject', 200).notNullable(); table.text('Message').notNullable(); table.string('Category', 40).notNullable();
    table.string('Priority', 20).notNullable().defaultTo('Normal'); table.string('Status', 30).notNullable().defaultTo('Open');
    table.integer('AssignedTo').references('UserID').inTable('Users'); table.specificType('ResolvedAt', 'DATETIME2');
    table.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now()); table.specificType('UpdatedAt', 'DATETIME2').defaultTo(db.fn.now());
    table.index(['Status', 'Priority', 'CreatedAt'], 'idx_support_ticket_queue');
  });
  if (!await db.schema.hasTable('AdminBroadcasts')) await db.schema.createTable('AdminBroadcasts', (table) => {
    table.bigIncrements('BroadcastID').primary(); table.string('Title', 180).notNullable(); table.text('Message').notNullable();
    table.string('Audience', 40).notNullable(); table.integer('RecipientCount').notNullable().defaultTo(0);
    table.integer('CreatedBy').notNullable().references('UserID').inTable('Users');
    table.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now()); table.index(['CreatedAt'], 'idx_broadcast_created');
  });
}

export async function down(): Promise<void> { throw new Error('Security and communications rollback is disabled.'); }

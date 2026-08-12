import type { Knex } from 'knex';

async function hasColumn(db: Knex, table: string, column: string) {
  const info = await db(table).columnInfo();
  return Object.prototype.hasOwnProperty.call(info, column);
}

export async function up(db: Knex): Promise<void> {
  if (!await hasColumn(db, 'SupportTickets', 'Version')) {
    await db.schema.alterTable('SupportTickets', (table) => {
      table.integer('Version').notNullable().defaultTo(0);
      table.string('Source', 30).notNullable().defaultTo('Portal');
      table.specificType('DueAt', 'DATETIME2');
      table.specificType('LastActivityAt', 'DATETIME2');
      table.string('ResolutionCode', 50);
    });
  }

  if (!await db.schema.hasTable('SupportTicketEvents')) {
    await db.schema.createTable('SupportTicketEvents', (table) => {
      table.bigIncrements('EventID').primary();
      table.bigInteger('TicketID').notNullable().references('TicketID').inTable('SupportTickets');
      table.integer('ActorUserID').notNullable().references('UserID').inTable('Users');
      table.string('EventType', 30).notNullable();
      table.text('Message');
      table.string('FromValue', 100); table.string('ToValue', 100);
      table.specificType('CreatedAt', 'DATETIME2').notNullable().defaultTo(db.fn.now());
    });
  }

  if (!await db.schema.hasTable('SupportContactAttempts')) {
    await db.schema.createTable('SupportContactAttempts', (table) => {
      table.bigIncrements('ContactID').primary();
      table.bigInteger('TicketID').notNullable().references('TicketID').inTable('SupportTickets');
      table.integer('ActorUserID').notNullable().references('UserID').inTable('Users');
      table.string('Channel', 20).notNullable(); table.string('Outcome', 40).notNullable();
      table.text('Notes'); table.specificType('FollowUpAt', 'DATETIME2');
      table.specificType('CreatedAt', 'DATETIME2').notNullable().defaultTo(db.fn.now());
    });
  }

  if (!await db.schema.hasTable('UserActivityEvents')) {
    await db.schema.createTable('UserActivityEvents', (table) => {
      table.bigIncrements('ActivityID').primary();
      table.integer('UserID').notNullable().references('UserID').inTable('Users');
      table.string('PageCode', 80).notNullable(); table.string('StepCode', 80);
      table.string('EventType', 30).notNullable(); table.string('ErrorCode', 80);
      table.string('RequestID', 100); table.specificType('OccurredAt', 'DATETIME2').notNullable().defaultTo(db.fn.now());
    });
  }

  if (!await hasColumn(db, 'Notifications', 'Priority')) {
    await db.schema.alterTable('Notifications', (table) => {
      table.string('Priority', 20).notNullable().defaultTo('Normal');
      table.string('ActionURL', 300); table.boolean('RequiresAction').notNullable().defaultTo(false);
      table.string('GroupKey', 100); table.string('DedupeKey', 150);
      table.specificType('ExpiresAt', 'DATETIME2'); table.specificType('AcknowledgedAt', 'DATETIME2');
    });
  }

  await db.raw(`
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_support_assignee_queue')
      CREATE INDEX idx_support_assignee_queue ON SupportTickets(AssignedTo, Status, Priority, LastActivityAt DESC, TicketID);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_support_event_history')
      CREATE INDEX idx_support_event_history ON SupportTicketEvents(TicketID, CreatedAt DESC, EventID);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_support_contact_history')
      CREATE INDEX idx_support_contact_history ON SupportContactAttempts(TicketID, CreatedAt DESC, ContactID);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_activity_user_time')
      CREATE INDEX idx_activity_user_time ON UserActivityEvents(UserID, OccurredAt DESC, ActivityID)
      INCLUDE (PageCode, StepCode, EventType, ErrorCode);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_activity_recent_errors')
      CREATE INDEX idx_activity_recent_errors ON UserActivityEvents(EventType, OccurredAt DESC, ActivityID)
      INCLUDE (UserID, PageCode, StepCode, ErrorCode);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_auth_recent_activity')
      CREATE INDEX idx_auth_recent_activity ON AuthSessions(LastUsedAt DESC, SessionID) INCLUDE (UserID, RevokedAt, ExpiresAt);
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_notifications_action_queue')
      CREATE INDEX idx_notifications_action_queue ON Notifications(UserID, RequiresAction, IsRead, CreatedAt DESC)
      INCLUDE (Priority, ActionURL, Type);
  `);
}

export async function down(): Promise<void> {
  throw new Error('Support operations rollback is disabled to preserve audit history.');
}

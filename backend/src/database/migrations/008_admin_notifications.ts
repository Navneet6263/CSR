import type { Knex } from 'knex';

async function column(db: Knex, table: string, name: string) {
  const info = await db(table).columnInfo();
  return Object.prototype.hasOwnProperty.call(info, name);
}

export async function up(db: Knex): Promise<void> {
  if (!await column(db, 'Users', 'MustChangePassword')) {
    await db.schema.alterTable('Users', (table) => table.boolean('MustChangePassword').notNullable().defaultTo(false));
  }
  if (!await column(db, 'Notifications', 'IsRead')) {
    await db.schema.alterTable('Notifications', (table) => {
      table.boolean('IsRead').notNullable().defaultTo(false);
      table.specificType('ReadAt', 'DATETIME2');
    });
  }
  await db.raw(`
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_notifications_user_unread')
      CREATE INDEX idx_notifications_user_unread ON Notifications(UserID, IsRead, CreatedAt DESC);
  `);
}

export async function down(): Promise<void> {
  throw new Error('Security upgrade rollback is disabled.');
}

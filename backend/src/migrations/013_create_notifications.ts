import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('Notifications', (table) => {
    table.increments('NotificationID').primary();
    table.integer('UserID').unsigned().notNullable()
      .references('UserID').inTable('Users').onDelete('CASCADE');
    table.string('Type', 50).notNullable();
    table.string('Channel', 20).notNullable()
      .checkIn(['Email', 'SMS', 'InApp']);
    table.specificType('Message', 'NVARCHAR(MAX)').notNullable();
    table.boolean('IsSent').notNullable().defaultTo(false);
    table.specificType('SentAt', 'DATETIME2').nullable();
    table.integer('RetryCount').notNullable().defaultTo(0);
    table.specificType('CreatedAt', 'DATETIME2').defaultTo(knex.fn.now());

    table.index(['UserID', 'IsSent'], 'idx_notifications_user_sent');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('Notifications');
}

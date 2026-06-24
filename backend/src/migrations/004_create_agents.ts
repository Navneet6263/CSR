import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('Agents', (table) => {
    table.increments('AgentID').primary();
    table.integer('UserID').unsigned().notNullable()
      .references('UserID').inTable('Users').onDelete('CASCADE');
    table.string('AgentCode', 20).notNullable().unique();
    table.string('Region', 100);
    table.decimal('CommissionRate', 5, 2).notNullable().defaultTo(0);
    table.decimal('TotalCommission', 15, 2).notNullable().defaultTo(0);
    table.boolean('IsActive').notNullable().defaultTo(true);
    table.specificType('CreatedAt', 'DATETIME2').defaultTo(knex.fn.now());

    table.index(['UserID'], 'idx_agents_userid');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('Agents');
}

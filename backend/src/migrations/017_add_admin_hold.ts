import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('Applications', (table) => {
    table.boolean('IsHeldByAdmin').defaultTo(false);
    table.text('AdminHoldReason').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('Applications', (table) => {
    table.dropColumn('IsHeldByAdmin');
    table.dropColumn('AdminHoldReason');
  });
}

import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  if (await db.schema.hasTable('UserConsents')) return;
  await db.schema.createTable('UserConsents', (table) => {
    table.bigIncrements('ConsentID').primary();
    table.integer('UserID').notNullable().references('UserID').inTable('Users').onDelete('CASCADE');
    table.string('ConsentType', 40).notNullable();
    table.string('DocumentVersion', 64).notNullable();
    table.string('IPAddressHash', 64);
    table.string('UserAgentHash', 64);
    table.specificType('AcceptedAt', 'DATETIME2').notNullable().defaultTo(db.fn.now());
    table.unique(['UserID', 'ConsentType', 'DocumentVersion'], { indexName: 'uq_user_consent_version' });
    table.index(['UserID', 'AcceptedAt'], 'idx_user_consents_history');
  });
}

export async function down(): Promise<void> {
  throw new Error('Consent history rollback is disabled to protect legal audit records.');
}

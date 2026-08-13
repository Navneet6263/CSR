import type { Knex } from 'knex';

export async function up(db: Knex): Promise<void> {
  if (await db.schema.hasTable('LoginOtpChallenges')) return;
  await db.schema.createTable('LoginOtpChallenges', (table) => {
    table.string('ChallengeID', 64).primary();
    table.integer('UserID').notNullable().references('UserID').inTable('Users').onDelete('CASCADE');
    table.string('CodeHash', 64).notNullable();
    table.integer('Attempts').notNullable().defaultTo(0);
    table.integer('MaxAttempts').notNullable().defaultTo(5);
    table.specificType('ExpiresAt', 'DATETIME2').notNullable();
    table.specificType('UsedAt', 'DATETIME2');
    table.string('RequestIP', 64); table.string('UserAgentHash', 64);
    table.specificType('CreatedAt', 'DATETIME2').notNullable().defaultTo(db.raw('SYSUTCDATETIME()'));
    table.index(['UserID', 'ExpiresAt'], 'idx_login_otp_user_expiry');
  });
}

export async function down(): Promise<void> {
  throw new Error('Staff login OTP rollback is disabled to protect authentication integrity.');
}

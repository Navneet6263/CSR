import knex, { Knex } from 'knex';
import { config } from './env';

export const knexConfig: Knex.Config = {
  client: 'mssql',
  connection: {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    requestTimeout: 30_000,
    options: {
      encrypt: config.db.encrypt,
      trustServerCertificate: config.db.trustServerCertificate,
      enableArithAbort: true,
    },
  },
  pool: {
    min: config.db.poolMin,
    max: config.db.poolMax,
    acquireTimeoutMillis: 15_000,
    idleTimeoutMillis: 30_000,
    createTimeoutMillis: 15_000,
    propagateCreateError: false,
  },
  migrations: {
    directory: '../database/migrations',
    tableName: 'app_schema_migrations',
    extension: 'ts',
  },
};

const db: Knex = knex(knexConfig);

export async function checkDatabase(): Promise<void> {
  await db.raw('SELECT 1 AS healthy');
}

export async function closeDatabase(): Promise<void> {
  await db.destroy();
}

export default db;

import knex, { Knex } from 'knex';
import { config } from './env';

const knexConfig: Knex.Config = {
  client: 'mssql',
  connection: {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
    },
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
  },
  migrations: {
    directory: '../migrations',
    tableName: 'knex_migrations',
    extension: 'ts',
  },
};

const db: Knex = knex(knexConfig);

export { knexConfig };
export default db;

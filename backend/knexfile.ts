import type { Knex } from 'knex';
import { config } from './src/config/env';

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
    },
  },
  migrations: {
    directory: './src/migrations',
    tableName: 'knex_migrations',
    extension: 'ts',
  },
};

export default knexConfig;

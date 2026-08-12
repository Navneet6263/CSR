import type { Knex } from 'knex';
import path from 'path';
import { knexConfig } from './src/config/database';

const config: Knex.Config = {
  ...knexConfig,
  migrations: {
    directory: path.join(__dirname, 'src', 'database', 'migrations'),
    tableName: 'app_schema_migrations',
    extension: 'ts',
  },
};

export default config;

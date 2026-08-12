import path from 'path';
import db from './src/config/database';

async function run(): Promise<void> {
  try {
    const [batch, migrations] = await db.migrate.latest({
      directory: path.join(__dirname, 'src', 'database', 'migrations'),
      tableName: 'app_schema_migrations',
    });
    console.info(`Migration batch ${batch}: ${migrations.length} migration(s) applied.`);
  } finally {
    await db.destroy();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import db from './src/config/database';
import path from 'path';

async function run() {
  try {
    await db.migrate.latest({
      directory: path.join(__dirname, 'src', 'migrations')
    });
    console.log('Migrations complete');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();

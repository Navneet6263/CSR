import db from './src/config/database';

async function run() {
  console.log('Running force migration for Admin Hold fields on MSSQL...');
  try {
    const hasIsHeld = await db.schema.hasColumn('Applications', 'IsHeldByAdmin');
    if (!hasIsHeld) {
      await db.schema.alterTable('Applications', (table) => {
        table.boolean('IsHeldByAdmin').defaultTo(false);
      });
      console.log('Added IsHeldByAdmin column successfully.');
    } else {
      console.log('Column IsHeldByAdmin already exists.');
    }

    const hasReason = await db.schema.hasColumn('Applications', 'AdminHoldReason');
    if (!hasReason) {
      await db.schema.alterTable('Applications', (table) => {
        table.text('AdminHoldReason').nullable();
      });
      console.log('Added AdminHoldReason column successfully.');
    } else {
      console.log('Column AdminHoldReason already exists.');
    }
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    process.exit(0);
  }
}

run();

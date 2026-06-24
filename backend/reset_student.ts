import db from './src/config/database';

async function reset() {
  try {
    await db('DocumentChecklist').del();
    await db('Applications').del();
    console.log('Reset complete. You can submit a fresh application now.');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
reset();

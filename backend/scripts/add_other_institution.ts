import db from '../src/config/database';

async function run() {
  const exists = await db.schema.hasColumn('Students', 'OtherInstitutionName');
  if (!exists) {
    await db.schema.table('Students', (t) => {
      t.string('OtherInstitutionName', 200).nullable();
    });
    console.log('OtherInstitutionName column added.');
  } else {
    console.log('Column already exists.');
  }
  process.exit(0);
}

run().catch(e => { console.error(e.message); process.exit(1); });

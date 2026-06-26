import db from '../src/config/database';

async function migrate() {
  try {
    console.log('Adding specific permanent address columns to Students table...');
    await db.raw(`
      ALTER TABLE Students ADD 
        PermanentCity NVARCHAR(100),
        PermanentState NVARCHAR(100),
        PermanentPincode NVARCHAR(20),
        IsPermanentSameAsCurrent BIT DEFAULT 0;
    `);
    console.log('Columns added successfully.');
  } catch (error: any) {
    if (error.message.includes('already exists') || error.message.includes('more than once')) {
      console.log('Columns already exist.');
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    process.exit(0);
  }
}

migrate();

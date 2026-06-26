import db from '../src/config/database';

async function migrate() {
  try {
    console.log('Adding new columns to Students table...');
    await db.raw(`
      ALTER TABLE Students ADD 
        PermanentAddress NVARCHAR(MAX),
        CurrentAddressDurationMonths INT,
        NumberOfSiblings INT DEFAULT 0,
        SiblingDetails NVARCHAR(MAX),
        FatherAadharFileURL NVARCHAR(500),
        MotherAadharFileURL NVARCHAR(500),
        FatherPayslipFileURL NVARCHAR(500),
        BankStatement6MonthsFileURL NVARCHAR(500);
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

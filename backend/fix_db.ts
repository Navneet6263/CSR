import db from './src/config/database';

async function fix() {
  await db('Applications').whereIn('ScholarshipID', [2, 3]).del();
  await db('EligibilityRules').whereIn('ScholarshipID', [2, 3]).del();
  await db('Scholarships').whereIn('ScholarshipID', [2, 3]).del();
  console.log('Deleted duplicate scholarships');
  process.exit(0);
}
fix();

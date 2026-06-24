import db from './src/config/database';

async function check() {
  const apps = await db('Applications').where({ StudentID: 1 }).select('*');
  console.log("Applications:", apps);

  const schs = await db('Scholarships').select('*');
  console.log("Scholarships count:", schs.length);
  schs.forEach(s => console.log(s.ScholarshipID, s.Name));
  
  process.exit(0);
}
check();

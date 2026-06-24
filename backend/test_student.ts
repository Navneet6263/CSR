import db from '../src/config/database';

async function check() {
  const student = await db('Students').where({ StudentID: 1 }).first();
  console.log("Student:", student);
  
  const apps = await db('Applications').where({ StudentID: 1 });
  console.log("Applications:", apps);
  process.exit(0);
}
check();

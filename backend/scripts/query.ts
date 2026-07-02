import db from '../src/config/database';

async function run() {
  const users = await db('Users').where('FullName', 'like', '%test%').orWhere('Email', 'like', '%test%');
  console.log('--- TEST USERS ---');
  console.log(users);

  for (const user of users) {
    const student = await db('Students').where({ UserID: user.UserID }).first();
    console.log(`Student for User ${user.UserID}:`, student ? student.StudentID : 'None');
    
    if (student) {
      const apps = await db('Applications').where({ StudentID: student.StudentID });
      console.log(`Applications for Student ${student.StudentID}:`, apps);
    }
  }

  process.exit(0);
}

run();

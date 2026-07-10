import db from './src/config/database';

async function run() {
  const user = await db('Users').where({ Email: 'bgcheckofficer@test.com' }).first();
  console.log('--- BGCHECKOFFICER ---');
  console.log(user);

  const admin = await db('Users').where({ Email: 'admin@test.com' }).first();
  console.log('--- ADMIN ---');
  console.log(admin);

  process.exit(0);
}

run().catch(console.error);

import db from '../src/config/database';

async function updateSeed() {
  console.log('Updating seeded data...');
  await db('Users').where('Role', 'Student').update({ Phone: '9876543210' });
  await db('Students').update({ Religion: 'Hindu' });
  console.log('Update complete!');
  process.exit(0);
}

updateSeed().catch(err => {
  console.error(err);
  process.exit(1);
});

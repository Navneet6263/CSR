import bcrypt from 'bcrypt';
import db from '../src/config/database';

async function seed() {
  const roles = [
    'Student',
    'Agent',
    'Admin',
    'Finance',
    'DocReviewer',
    'BGCheckOfficer',
    'ScreeningOfficer',
    'CSRPartner',
  ];

  const passwordHash = await bcrypt.hash('12345678', 12);

  for (const role of roles) {
    const email = `${role.toLowerCase()}@test.com`;
    
    // Check if exists
    const existing = await db('Users').where({ Email: email }).first();
    if (existing) {
      console.log(`User ${email} already exists.`);
      continue;
    }

    const [inserted] = await db('Users').insert({
      FullName: `Test ${role}`,
      Email: email,
      PasswordHash: passwordHash,
      Role: role,
      AgentCode: role === 'Student' ? null : `${role.substring(0,3)}_${Math.floor(Math.random() * 10000)}`,
      IsActive: true,
    }).returning('*');

    console.log(`Created user: ${email} (Role: ${role})`);

    // Create student placeholder if student
    if (role === 'Student') {
      await db('Students').insert({ UserID: inserted.UserID });
      console.log(`Created student profile for: ${email}`);
    }
  }

  console.log('Seed completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

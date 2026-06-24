import bcrypt from 'bcrypt';
import db from '../src/config/database';

async function seed() {
  // Top 10 Institutions (IITs, NITs, etc.)
  const topInstitutions = [
    { Name: 'IIT Bombay', Type: 'University', District: 'Mumbai', State: 'Maharashtra', Address: 'Powai, Mumbai', BankAccountNo: '1234567890', BankIFSC: 'SBIN0001234', IsVerified: true },
    { Name: 'IIT Delhi', Type: 'University', District: 'New Delhi', State: 'Delhi', Address: 'Hauz Khas, New Delhi', BankAccountNo: '2345678901', BankIFSC: 'SBIN0002345', IsVerified: true },
    { Name: 'IIT Madras', Type: 'University', District: 'Chennai', State: 'Tamil Nadu', Address: 'Sardar Patel Road, Chennai', BankAccountNo: '3456789012', BankIFSC: 'SBIN0003456', IsVerified: true },
    { Name: 'IIT Kanpur', Type: 'University', District: 'Kanpur', State: 'Uttar Pradesh', Address: 'Kalyanpur, Kanpur', BankAccountNo: '4567890123', BankIFSC: 'SBIN0004567', IsVerified: true },
    { Name: 'IIT Kharagpur', Type: 'University', District: 'Kharagpur', State: 'West Bengal', Address: 'Kharagpur', BankAccountNo: '5678901234', BankIFSC: 'SBIN0005678', IsVerified: true },
    { Name: 'NIT Trichy', Type: 'University', District: 'Tiruchirappalli', State: 'Tamil Nadu', Address: 'Tanjore Main Road, Trichy', BankAccountNo: '6789012345', BankIFSC: 'SBIN0006789', IsVerified: true },
    { Name: 'BITS Pilani', Type: 'University', District: 'Pilani', State: 'Rajasthan', Address: 'Vidya Vihar, Pilani', BankAccountNo: '7890123456', BankIFSC: 'SBIN0007890', IsVerified: true },
    { Name: 'Delhi University', Type: 'University', District: 'New Delhi', State: 'Delhi', Address: 'University Enclave, Delhi', BankAccountNo: '8901234567', BankIFSC: 'SBIN0008901', IsVerified: true },
    { Name: 'Mumbai University', Type: 'University', District: 'Mumbai', State: 'Maharashtra', Address: 'Fort, Mumbai', BankAccountNo: '9012345678', BankIFSC: 'SBIN0009012', IsVerified: true },
    { Name: 'Anna University', Type: 'University', District: 'Chennai', State: 'Tamil Nadu', Address: 'Guindy, Chennai', BankAccountNo: '0123456789', BankIFSC: 'SBIN0000123', IsVerified: true },
  ];

  console.log('Seeding top institutions...');
  for (const inst of topInstitutions) {
    const existing = await db('Institutions').where({ Name: inst.Name }).first();
    if (!existing) {
      await db('Institutions').insert(inst);
      console.log(`Created institution: ${inst.Name}`);
    } else {
      console.log(`Institution ${inst.Name} already exists.`);
    }
  }

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

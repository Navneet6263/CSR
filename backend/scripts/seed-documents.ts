import db from '../src/config/database';
import bcrypt from 'bcrypt';

async function seedDocs() {
  console.log('Starting document seed...');

  // 1. Create a DocReviewer user if it doesn't exist
  const commonPassword = await bcrypt.hash('Student@123', 10);
  let docReviewer = await db('Users').where('Email', 'docreviewer@test.com').first();
  if (!docReviewer) {
    const [insertedUser] = await db('Users').insert({
      FullName: 'Document Review Team',
      Email: 'docreviewer@test.com',
      PasswordHash: commonPassword,
      Role: 'DocReviewer',
      AgentCode: 'DOC_REV_1',
      IsActive: true
    }).returning('*');
    docReviewer = insertedUser;
  }

  // 2. Fetch all applications
  const applications = await db('Applications').select('*');

  // 3. For each application, insert 2 documents
  console.log(`Seeding documents for ${applications.length} applications...`);
  const docsToInsert = [];
  
  for (const app of applications) {
    // Aadhar Card
    docsToInsert.push({
      ApplicationID: app.ApplicationID,
      DocumentType: 'Aadhar',
      FileURL: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      UploadedAt: new Date(),
      Status: 'Uploaded',
      ReUploadCount: 0
    });
    
    // Income Certificate
    docsToInsert.push({
      ApplicationID: app.ApplicationID,
      DocumentType: 'Income',
      FileURL: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      UploadedAt: new Date(),
      Status: 'Uploaded',
      ReUploadCount: 0
    });
  }

  // Bulk insert documents in chunks to avoid query parameter limits
  const chunkSize = 100;
  for (let i = 0; i < docsToInsert.length; i += chunkSize) {
    const chunk = docsToInsert.slice(i, i + chunkSize);
    await db('DocumentChecklist').insert(chunk);
  }

  console.log('Document seeding complete!');
  console.log('DocReviewer Account: docreviewer@test.com (Password: Student@123)');
  process.exit(0);
}

seedDocs().catch(err => {
  console.error(err);
  process.exit(1);
});

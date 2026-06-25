import db from '../src/config/database';

async function testUpload() {
  try {
    const userId = 101; // student1
    const student = await db('Students').where({ UserID: userId }).first();
    const docType = 'Aadhar';
    const fileUrl = 'http://localhost/dummy.pdf';
    
    // Simulate student API
    const existing = await db('StudentDocuments')
      .where({ StudentID: student.StudentID, DocumentType: docType })
      .first();

    if (existing) {
      await db('StudentDocuments')
        .where({ DocumentID: existing.DocumentID })
        .update({ FileURL: fileUrl, UploadedAt: db.fn.now() });
    } else {
      await db('StudentDocuments').insert({
        StudentID: student.StudentID,
        DocumentType: docType,
        FileURL: fileUrl
      });
    }
    console.log('StudentDocuments OK');

    // Simulate verification API
    const app = await db('Applications').where({ StudentID: student.StudentID }).first();
    const doc = await db('DocumentChecklist')
      .where({ ApplicationID: app.ApplicationID, DocumentType: docType })
      .first();

    if (doc) {
      await db('DocumentChecklist')
        .where({ ChecklistID: doc.ChecklistID })
        .update({
          FileURL: fileUrl,
          Status: 'Uploaded',
          UploadedAt: db.fn.now(),
        });
    } else {
      await db('DocumentChecklist').insert({
        ApplicationID: app.ApplicationID,
        DocumentType: docType,
        FileURL: fileUrl,
        Status: 'Uploaded',
        UploadedAt: db.fn.now(),
      });
    }
    console.log('DocumentChecklist OK');
    
  } catch (err) {
    console.error('ERROR OCCURRED:', err);
  } finally {
    process.exit(0);
  }
}

testUpload();

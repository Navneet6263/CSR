import db from './src/config/database';

async function fix() {
  const apps = await db('Applications');
  const docsToTrack = ['aadhar', 'pan', 'income', 'education', 'bank', 'photo'];
  
  for (const app of apps) {
    const existing = await db('DocumentChecklist').where({ ApplicationID: app.ApplicationID });
    if (existing.length === 0) {
      const checklistItems = docsToTrack.map((docType) => ({
        ApplicationID: app.ApplicationID,
        DocumentType: docType,
        Status: 'Uploaded',
        FileURL: `https://mock-storage.com/${app.StudentID}/${docType}.pdf`,
      }));
      await db('DocumentChecklist').insert(checklistItems);
      console.log(`Inserted docs for App ${app.ApplicationID}`);
    }
  }
  process.exit(0);
}
fix();

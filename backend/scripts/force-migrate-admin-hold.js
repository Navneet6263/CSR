const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/scholarship.db');
const db = new sqlite3.Database(dbPath);

console.log('Running force migration for Admin Hold fields...');

db.serialize(() => {
  db.run(`ALTER TABLE Applications ADD COLUMN IsHeldByAdmin BOOLEAN DEFAULT 0;`, (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('Column IsHeldByAdmin already exists.');
      } else {
        console.error('Error adding IsHeldByAdmin:', err);
      }
    } else {
      console.log('Added IsHeldByAdmin column successfully.');
    }
  });

  db.run(`ALTER TABLE Applications ADD COLUMN AdminHoldReason TEXT;`, (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('Column AdminHoldReason already exists.');
      } else {
        console.error('Error adding AdminHoldReason:', err);
      }
    } else {
      console.log('Added AdminHoldReason column successfully.');
    }
  });
});

db.close(() => {
  console.log('Migration finished.');
});

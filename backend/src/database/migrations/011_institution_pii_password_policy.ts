import type { Knex } from 'knex';
import { encryptPii } from '../../utils/piiCrypto';

export async function up(db: Knex): Promise<void> {
  if (!await db.schema.hasColumn('Institutions', 'BankAccountCiphertext')) {
    await db.schema.alterTable('Institutions', (table) => {
      table.text('BankAccountCiphertext'); table.text('BankIFSCCiphertext');
    });
  }
  await db.raw(`
    ALTER TABLE Institutions ALTER COLUMN BankAccountNo NVARCHAR(50) NULL;
    ALTER TABLE Institutions ALTER COLUMN BankIFSC NVARCHAR(20) NULL;
  `);
  const rows = await db('Institutions').select('InstitutionID', 'BankAccountNo', 'BankIFSC',
    'BankAccountCiphertext', 'BankIFSCCiphertext');
  for (const row of rows) {
    const account = String(row.BankAccountNo ?? '').trim(); const ifsc = String(row.BankIFSC ?? '').trim();
    if (!account && !ifsc) continue;
    await db('Institutions').where({ InstitutionID: row.InstitutionID }).update({
      BankAccountCiphertext: row.BankAccountCiphertext ?? (account ? encryptPii(account) : null),
      BankIFSCCiphertext: row.BankIFSCCiphertext ?? (ifsc ? encryptPii(ifsc) : null),
      BankAccountNo: null, BankIFSC: null, UpdatedAt: db.fn.now(),
    });
  }
  await db('Users').where({ MustChangePassword: false }).update({ MustChangePassword: true });
}

export async function down(): Promise<void> {
  throw new Error('Institution PII encryption rollback is disabled.');
}

import type { Knex } from 'knex';
import { encryptPii, hashPii } from '../../utils/piiCrypto';

const documentTypes: Record<string, string> = {
  Aadhar: 'aadhaar_card',
  Aadhaar: 'aadhaar_card',
  Identity: 'aadhaar_card',
  Income: 'income_cert',
  Marksheet: 'marksheet_10',
  BankPassbook: 'passbook',
  bank: 'passbook',
  Photo: 'photo',
  Caste: 'caste_cert',
  FeeReceipt: 'fee_receipt',
};

export async function up(db: Knex): Promise<void> {
  const students = await db('Students').select(
    'StudentID', 'AadharNumber', 'AadharCiphertext', 'AadharHash', 'BankAccountNo',
    'BankAccountCiphertext', 'BankIFSC', 'BankIFSCCiphertext',
  );
  const encryptedRows = students.map((student) => {
    const aadhaar = String(student.AadharNumber ?? '').trim();
    const bankAccount = String(student.BankAccountNo ?? '').trim();
    const ifsc = String(student.BankIFSC ?? '').trim().toUpperCase();
    return [
      student.StudentID,
      student.AadharCiphertext ?? (aadhaar ? encryptPii(aadhaar) : null),
      student.AadharHash ?? (aadhaar ? hashPii(aadhaar) : null),
      student.BankAccountCiphertext ?? (bankAccount ? encryptPii(bankAccount) : null),
      student.BankIFSCCiphertext ?? (ifsc ? encryptPii(ifsc) : null),
      aadhaar || student.AadharCiphertext ? 1 : 0,
      bankAccount || student.BankAccountCiphertext ? 1 : 0,
      ifsc || student.BankIFSCCiphertext ? 1 : 0,
    ];
  });
  if (encryptedRows.length) {
    const placeholders = encryptedRows.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(',');
    await db.raw(`
      MERGE Students AS target
      USING (VALUES ${placeholders}) AS source
        (StudentID, AadharCiphertext, AadharHash, BankAccountCiphertext, BankIFSCCiphertext,
         ClearAadhar, ClearBankAccount, ClearIFSC)
      ON target.StudentID = source.StudentID
      WHEN MATCHED THEN UPDATE SET
        AadharCiphertext = source.AadharCiphertext,
        AadharHash = source.AadharHash,
        BankAccountCiphertext = source.BankAccountCiphertext,
        BankIFSCCiphertext = source.BankIFSCCiphertext,
        AadharNumber = CASE WHEN source.ClearAadhar = 1 THEN NULL ELSE target.AadharNumber END,
        BankAccountNo = CASE WHEN source.ClearBankAccount = 1 THEN NULL ELSE target.BankAccountNo END,
        BankIFSC = CASE WHEN source.ClearIFSC = 1 THEN NULL ELSE target.BankIFSC END;
    `, encryptedRows.flat());
  }
  const typeEntries = Object.entries(documentTypes);
  const cases = typeEntries.map(() => 'WHEN ? THEN ?').join(' ');
  const values = typeEntries.flat();
  const legacyTypes = typeEntries.map(([type]) => type);
  const inClause = legacyTypes.map(() => '?').join(',');
  for (const table of ['StudentDocuments', 'DocumentChecklist']) {
    await db.raw(`UPDATE ${table} SET DocumentType = CASE DocumentType ${cases} ELSE DocumentType END
      WHERE DocumentType IN (${inClause})`, [...values, ...legacyTypes]);
  }
}

export async function down(): Promise<void> {
  throw new Error('PII encryption rollback is disabled to prevent plaintext restoration.');
}

import { Knex } from 'knex';
import { IStudent } from '../types';
import { ValidationError } from '../utils/errors';
import { decryptPii, maskValue } from '../utils/piiCrypto';

const defaultRequirements = ['aadhaar_card', 'photo', 'income_cert', 'marksheet_10', 'passbook'];

function missingProfileFields(student: Record<string, any>, user: Record<string, any>): string[] {
  const values: Record<string, unknown> = {
    fullName: user.FullName,
    email: user.Email,
    aadhaar: student.AadharCiphertext ?? student.AadharNumber,
    dateOfBirth: student.DOB,
    gender: student.Gender,
    address: student.Address,
    city: student.City,
    state: student.State,
    pincode: student.Pincode,
    familyIncome: student.AnnualFamilyIncome,
    familySize: student.FamilySize,
    course: student.Course,
    enrollmentYear: student.EnrollmentYear,
    bankAccount: student.BankAccountCiphertext ?? student.BankAccountNo,
    bankIFSC: student.BankIFSCCiphertext ?? student.BankIFSC,
  };
  return Object.entries(values)
    .filter(([, value]) => value === null || value === undefined || value === '')
    .map(([field]) => field);
}

export async function buildSubmissionSnapshot(
  trx: Knex.Transaction,
  application: Record<string, any>,
) {
  const student = await trx<IStudent & Record<string, any>>('Students')
    .where({ StudentID: application.StudentID })
    .first();
  const user = student ? await trx('Users').where({ UserID: student.UserID }).first() : undefined;
  if (!student || !user) throw new ValidationError('Student profile is incomplete.');

  const missingFields = missingProfileFields(student, user);
  if (missingFields.length) {
    throw new ValidationError(`Complete these profile fields before submission: ${missingFields.join(', ')}.`);
  }

  const configured = await trx('ScholarshipDocumentRequirements')
    .where({ ScholarshipID: application.ScholarshipID, IsRequired: true })
    .select('DocumentType');
  const requiredTypes = configured.length
    ? configured.map((item) => String(item.DocumentType).toLowerCase())
    : defaultRequirements;

  const documents = await trx('StudentDocuments as d')
    .leftJoin('DocumentVersions as v', function joinVersion() {
      this.on('v.DocumentID', '=', 'd.DocumentID').andOn('v.VersionNumber', '=', 'd.CurrentVersion');
    })
    .where({ 'd.StudentID': application.StudentID, 'd.IsActive': true })
    .select('d.*', 'v.DocumentVersionID', 'v.Sha256 as VersionSha256', 'v.ScanStatus as VersionScanStatus');
  const available = new Map(documents.map((doc) => [String(doc.DocumentType).toLowerCase(), doc]));
  const missingDocs = requiredTypes.filter((type) => {
    const doc = available.get(type);
    const scan = doc?.VersionScanStatus ?? doc?.ScanStatus;
    return !doc || !['Clean', 'Validated'].includes(scan);
  });
  if (missingDocs.length) {
    throw new ValidationError(`Upload valid required documents: ${missingDocs.join(', ')}.`);
  }

  const aadhaar = student.AadharNumber ?? decryptPii(student.AadharCiphertext);
  const bankAccount = student.BankAccountNo ?? decryptPii(student.BankAccountCiphertext);
  const requiredDocuments = requiredTypes.map((type) => available.get(type)!);
  const snapshot = {
    capturedAt: new Date().toISOString(),
    profile: {
      fullName: user.FullName, email: user.Email, phone: user.Phone,
      aadhaarMasked: maskValue(aadhaar), aadhaarHash: student.AadharHash,
      dob: student.DOB, gender: student.Gender, category: student.Category,
      address: student.Address, city: student.City, state: student.State, pincode: student.Pincode,
      annualFamilyIncome: student.AnnualFamilyIncome, familySize: student.FamilySize,
      course: student.Course, institutionId: student.InstitutionID, enrollmentYear: student.EnrollmentYear,
      bankAccountLast4: maskValue(bankAccount), bankName: student.BankName,
    },
    documents: requiredDocuments.map((doc) => ({
      type: doc.DocumentType,
      documentId: doc.DocumentID,
      versionId: doc.DocumentVersionID,
      sha256: doc.VersionSha256 ?? doc.Sha256,
    })),
  };
  return { snapshot, documents: requiredDocuments };
}

export async function initializeChecklist(
  trx: Knex.Transaction,
  applicationId: number,
  documents: Array<Record<string, any>>,
): Promise<void> {
  const existing = await trx('DocumentChecklist').where({ ApplicationID: applicationId }).select('DocumentType');
  const existingTypes = new Set(existing.map((item) => String(item.DocumentType).toLowerCase()));
  const rows = documents.filter((doc) => !existingTypes.has(String(doc.DocumentType).toLowerCase())).map((doc) => ({
    ApplicationID: applicationId,
    DocumentType: doc.DocumentType,
    FileURL: null,
    DocumentVersionID: doc.DocumentVersionID ?? null,
    UploadedAt: doc.UploadedAt,
    Status: 'Uploaded',
  }));
  if (rows.length) await trx('DocumentChecklist').insert(rows);
}

import type { Knex } from 'knex';

async function missing(db: Knex, table: string, columns: string[]): Promise<Set<string>> {
  const pairs = await Promise.all(columns.map(async (name) => [name, await db.schema.hasColumn(table, name)] as const));
  return new Set(pairs.filter(([, exists]) => !exists).map(([name]) => name));
}

export async function up(db: Knex): Promise<void> {
  const userMissing = await missing(db, 'Users', ['TokenVersion']);
  if (userMissing.size) await db.schema.alterTable('Users', (t) => {
    if (userMissing.has('TokenVersion')) t.integer('TokenVersion').notNullable().defaultTo(0);
  });

  const studentColumns = [
    'UpdatedAt', 'TenthBoardName', 'TenthPassingYear', 'TenthMarks', 'TwelfthBoardName',
    'TwelfthPassingYear', 'TwelfthMarks', 'CasteCertificateNumber', 'CasteCertificateIssueDate',
    'DomicileCertificateNumber', 'AlternatePhone', 'DistanceFromHome', 'ReceivedPreviousScholarship',
    'PreviousScholarshipName', 'PreviousScholarshipAmount', 'PreviousScholarshipYear',
    'FatherAadharFileURL', 'MotherAadharFileURL', 'FatherPayslipFileURL',
    'BankStatement6MonthsFileURL', 'PermanentCity', 'PermanentState', 'PermanentPincode',
    'IsPermanentSameAsCurrent', 'AadharCiphertext', 'AadharHash', 'BankAccountCiphertext',
    'BankIFSCCiphertext',
  ];
  const sm = await missing(db, 'Students', studentColumns);
  if (sm.size) await db.schema.alterTable('Students', (t) => {
    if (sm.has('UpdatedAt')) t.specificType('UpdatedAt', 'DATETIME2').defaultTo(db.fn.now());
    for (const name of ['TenthBoardName', 'TwelfthBoardName']) if (sm.has(name)) t.string(name, 100);
    for (const name of ['TenthPassingYear', 'TwelfthPassingYear', 'PreviousScholarshipYear']) {
      if (sm.has(name)) t.integer(name);
    }
    for (const name of ['TenthMarks', 'TwelfthMarks']) if (sm.has(name)) t.decimal(name, 5, 2);
    if (sm.has('CasteCertificateNumber')) t.string('CasteCertificateNumber', 100);
    if (sm.has('CasteCertificateIssueDate')) t.date('CasteCertificateIssueDate');
    if (sm.has('DomicileCertificateNumber')) t.string('DomicileCertificateNumber', 100);
    if (sm.has('AlternatePhone')) t.string('AlternatePhone', 20);
    if (sm.has('DistanceFromHome')) t.decimal('DistanceFromHome', 8, 1);
    if (sm.has('ReceivedPreviousScholarship')) t.boolean('ReceivedPreviousScholarship').defaultTo(false);
    if (sm.has('PreviousScholarshipName')) t.string('PreviousScholarshipName', 200);
    if (sm.has('PreviousScholarshipAmount')) t.decimal('PreviousScholarshipAmount', 10, 2);
    for (const name of ['FatherAadharFileURL', 'MotherAadharFileURL', 'FatherPayslipFileURL', 'BankStatement6MonthsFileURL']) {
      if (sm.has(name)) t.string(name, 500);
    }
    if (sm.has('PermanentCity')) t.string('PermanentCity', 100);
    if (sm.has('PermanentState')) t.string('PermanentState', 100);
    if (sm.has('PermanentPincode')) t.string('PermanentPincode', 20);
    if (sm.has('IsPermanentSameAsCurrent')) t.boolean('IsPermanentSameAsCurrent').defaultTo(false);
    if (sm.has('AadharCiphertext')) t.text('AadharCiphertext');
    if (sm.has('AadharHash')) t.string('AadharHash', 64);
    if (sm.has('BankAccountCiphertext')) t.text('BankAccountCiphertext');
    if (sm.has('BankIFSCCiphertext')) t.text('BankIFSCCiphertext');
  });

  const appColumns = ['Version', 'SubmittedSnapshot', 'EligibilitySnapshot', 'StageEnteredAt', 'UpdatedAt'];
  const am = await missing(db, 'Applications', appColumns);
  if (am.size) await db.schema.alterTable('Applications', (t) => {
    if (am.has('Version')) t.integer('Version').notNullable().defaultTo(0);
    if (am.has('SubmittedSnapshot')) t.text('SubmittedSnapshot');
    if (am.has('EligibilitySnapshot')) t.text('EligibilitySnapshot');
    if (am.has('StageEnteredAt')) t.specificType('StageEnteredAt', 'DATETIME2').defaultTo(db.fn.now());
    if (am.has('UpdatedAt')) t.specificType('UpdatedAt', 'DATETIME2').defaultTo(db.fn.now());
  });

  const studentDocColumns = [
    'StorageKey', 'OriginalName', 'MimeType', 'SizeBytes', 'Sha256', 'ScanStatus', 'CurrentVersion', 'IsActive',
  ];
  const dm = await missing(db, 'StudentDocuments', studentDocColumns);
  if (dm.size) await db.schema.alterTable('StudentDocuments', (t) => {
    if (dm.has('StorageKey')) t.string('StorageKey', 500);
    if (dm.has('OriginalName')) t.string('OriginalName', 255);
    if (dm.has('MimeType')) t.string('MimeType', 100);
    if (dm.has('SizeBytes')) t.bigInteger('SizeBytes');
    if (dm.has('Sha256')) t.string('Sha256', 64);
    if (dm.has('ScanStatus')) t.string('ScanStatus', 20).defaultTo('Legacy');
    if (dm.has('CurrentVersion')) t.integer('CurrentVersion').notNullable().defaultTo(1);
    if (dm.has('IsActive')) t.boolean('IsActive').notNullable().defaultTo(true);
  });

  const checklistMissing = await missing(db, 'DocumentChecklist', ['DocumentVersionID', 'Version']);
  if (checklistMissing.size) await db.schema.alterTable('DocumentChecklist', (t) => {
    if (checklistMissing.has('DocumentVersionID')) {
      t.bigInteger('DocumentVersionID').references('DocumentVersionID').inTable('DocumentVersions');
    }
    if (checklistMissing.has('Version')) t.integer('Version').notNullable().defaultTo(0);
  });

  const bgMissing = await missing(db, 'BackgroundChecks', ['Version', 'UpdatedAt']);
  if (bgMissing.size) await db.schema.alterTable('BackgroundChecks', (t) => {
    if (bgMissing.has('Version')) t.integer('Version').notNullable().defaultTo(1);
    if (bgMissing.has('UpdatedAt')) t.specificType('UpdatedAt', 'DATETIME2').defaultTo(db.fn.now());
  });

  const paymentMissing = await missing(db, 'Payments', ['IdempotencyKey', 'DestinationCiphertext']);
  if (paymentMissing.size) await db.schema.alterTable('Payments', (t) => {
    if (paymentMissing.has('IdempotencyKey')) t.string('IdempotencyKey', 100);
    if (paymentMissing.has('DestinationCiphertext')) t.text('DestinationCiphertext');
  });
  const auditMissing = await missing(db, 'AuditLogs', ['RequestID']);
  if (auditMissing.size) await db.schema.alterTable('AuditLogs', (t) => t.string('RequestID', 100));
  const notificationMissing = await missing(db, 'Notifications', ['Payload', 'NextAttemptAt']);
  if (notificationMissing.size) await db.schema.alterTable('Notifications', (t) => {
    if (notificationMissing.has('Payload')) t.text('Payload');
    if (notificationMissing.has('NextAttemptAt')) t.specificType('NextAttemptAt', 'DATETIME2');
  });

  if (!await db.schema.hasTable('ApplicationDecisions')) {
    await db.schema.createTable('ApplicationDecisions', (t) => {
      t.bigIncrements('DecisionID').primary();
      t.integer('ApplicationID').notNullable().references('ApplicationID').inTable('Applications');
      t.string('Stage', 30).notNullable(); t.string('Decision', 30).notNullable(); t.string('Reason', 1000);
      t.integer('ActorUserID').notNullable().references('UserID').inTable('Users');
      t.string('ActorRole', 30).notNullable(); t.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
    });
  }
  if (!await db.schema.hasTable('PaymentAttempts')) {
    await db.schema.createTable('PaymentAttempts', (t) => {
      t.bigIncrements('AttemptID').primary();
      t.integer('PaymentID').notNullable().references('PaymentID').inTable('Payments');
      t.integer('AttemptNumber').notNullable(); t.string('Status', 20).notNullable();
      t.string('ReferenceNo', 100); t.string('FailureCode', 100); t.string('FailureReason', 1000);
      t.integer('ActorUserID').notNullable().references('UserID').inTable('Users');
      t.specificType('CreatedAt', 'DATETIME2').defaultTo(db.fn.now());
      t.unique(['PaymentID', 'AttemptNumber'], { indexName: 'uq_payment_attempt_number' });
    });
  }
}

export async function down(): Promise<void> {
  throw new Error('Existing schema upgrade rollback is disabled to protect data.');
}

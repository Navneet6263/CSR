import db from '../config/database';
import { decryptPii, maskValue } from '../utils/piiCrypto';

function metric(row: Record<string, unknown> | undefined) {
  return { count: Number(row?.count ?? 0), amount: Number(row?.amount ?? 0) };
}

function indiaDayBounds(now = new Date()) {
  const offsetMs = 330 * 60 * 1000;
  const india = new Date(now.getTime() + offsetMs);
  const start = Date.UTC(india.getUTCFullYear(), india.getUTCMonth(), india.getUTCDate()) - offsetMs;
  return { start: new Date(start), end: new Date(start + 86_400_000) };
}

export async function getFinanceOverview() {
  const { start, end } = indiaDayBounds();
  const [maker, checker, settledToday, exceptions] = await Promise.all([
    db('Applications').whereIn('Status', ['CSRApproved', 'PaymentFailed'])
      .count('* as count').sum('ScholarshipAmount as amount').first(),
    db('Payments').where({ Status: 'Pending' }).count('* as count').sum('Amount as amount').first(),
    db('Payments').where({ Status: 'Completed' }).where('UpdatedAt', '>=', start).where('UpdatedAt', '<', end)
      .count('* as count').sum('Amount as amount').first(),
    db('Payments').where({ Status: 'Failed' }).count('* as count').sum('Amount as amount').first(),
  ]);
  return { maker: metric(maker), checker: metric(checker),
    settledToday: metric(settledToday), exceptions: metric(exceptions), generatedAt: new Date().toISOString() };
}

export async function getPendingInitiation(limit = 50) {
  const rows = await db('Applications as a')
    .join('Students as st', 'a.StudentID', 'st.StudentID')
    .join('Scholarships as sc', 'a.ScholarshipID', 'sc.ScholarshipID')
    .join('Users as u', 'st.UserID', 'u.UserID')
    .leftJoin('Sponsors as sp', 'a.SponsorID', 'sp.SponsorID')
    .select(
      'a.ApplicationID', 'a.Status', 'a.ScholarshipAmount', 'st.StudentID',
      'st.BankAccountNo', 'st.BankAccountCiphertext', 'st.BankIFSC', 'st.BankIFSCCiphertext',
      'st.BankName', 'st.IsAadhaarLinkedToBank', 'sc.Name as ScholarshipName', 'sp.SponsorName',
      'u.FullName as StudentName', 'a.StageEnteredAt as ApprovedAt',
    )
    .whereIn('a.Status', ['CSRApproved', 'PaymentFailed'])
    .orderBy([{ column: 'a.StageEnteredAt', order: 'asc' }, { column: 'a.ApplicationID', order: 'asc' }])
    .limit(limit);
  return rows.map((row) => {
    const bankAccount = row.BankAccountNo ?? decryptPii(row.BankAccountCiphertext);
    const ifsc = row.BankIFSC ?? decryptPii(row.BankIFSCCiphertext);
    delete row.BankAccountCiphertext;
    delete row.BankIFSCCiphertext;
    return { ...row, BankAccountNo: maskValue(bankAccount), BankIFSC: ifsc ? `${ifsc.slice(0, 4)}***${ifsc.slice(-2)}` : null };
  });
}

export async function getPendingVerifications(checkerId: number, limit = 50) {
  const rows = await db('Payments as p')
    .join('Applications as a', 'p.ApplicationID', 'a.ApplicationID')
    .join('Students as st', 'a.StudentID', 'st.StudentID')
    .join('Users as u', 'st.UserID', 'u.UserID')
    .join('Sponsors as sp', 'p.SponsorID', 'sp.SponsorID')
    .select(
      'p.PaymentID', 'p.Amount', 'p.PaymentType', 'p.Status as PaymentStatus',
      'p.MakerID', 'p.CreatedAt', 'a.ApplicationID', 'a.Status as ApplicationStatus', 'st.BankName',
      'st.BankAccountNo', 'st.BankAccountCiphertext', 'u.FullName as StudentName', 'sp.SponsorName',
    )
    .where('p.Status', 'Pending').whereNot('p.MakerID', checkerId)
    .orderBy([{ column: 'p.CreatedAt', order: 'asc' }, { column: 'p.PaymentID', order: 'asc' }])
    .limit(limit);
  return rows.map((row) => {
    const account = row.BankAccountNo ?? decryptPii(row.BankAccountCiphertext);
    delete row.BankAccountCiphertext;
    return { ...row, BankAccountNo: maskValue(account) };
  });
}

export async function getPaymentHistory(status: 'Completed' | 'Failed', limit = 100) {
  return db('Payments as p').join('Applications as a', 'p.ApplicationID', 'a.ApplicationID')
    .join('Students as st', 'p.StudentID', 'st.StudentID').join('Users as u', 'st.UserID', 'u.UserID')
    .join('Sponsors as sp', 'p.SponsorID', 'sp.SponsorID')
    .leftJoin('Users as maker', 'p.MakerID', 'maker.UserID').leftJoin('Users as checker', 'p.CheckerID', 'checker.UserID')
    .select('p.PaymentID', 'p.ApplicationID', 'p.Amount', 'p.Status', 'p.ReferenceNo',
      'p.CheckerNotes', 'p.UpdatedAt', 'st.UpdatedAt as StudentUpdatedAt', 'st.BankName', 'u.FullName as StudentName',
      'sp.SponsorName', 'maker.FullName as MakerName', 'checker.FullName as CheckerName')
    .where('p.Status', status).orderBy('p.UpdatedAt', 'desc').limit(limit);
}

export async function getFinanceAudit(limit = 100) {
  const rows = await db('AuditLogs as log').leftJoin('Users as actor', 'actor.UserID', 'log.UserID')
    .leftJoin('Payments as payment', 'payment.PaymentID', 'log.EntityID')
    .select('log.LogID', 'log.Action', 'log.EntityID', 'log.CreatedAt', 'log.RequestID',
      'actor.FullName as ActorName', 'actor.Role as ActorRole', 'payment.ApplicationID',
      'payment.Amount', 'payment.ReferenceNo')
    .where({ 'log.EntityType': 'Payment' }).orderBy('log.CreatedAt', 'desc').limit(limit);
  return rows.map((row) => ({
    id: String(row.LogID), timestamp: row.CreatedAt, actor: row.ActorName ?? 'System',
    role: row.ActorRole === 'Admin' ? 'Admin' : row.Action === 'PAYMENT_INITIATED' ? 'Maker'
      : row.Action.startsWith('PAYMENT_') ? 'Checker' : 'System',
    action: String(row.Action).toLowerCase().replace(/_/g, ' '),
    target: row.ApplicationID ? `APP-${row.ApplicationID}` : `PAY-${row.EntityID}`,
    paymentId: Number(row.EntityID), amount: row.Amount == null ? undefined : Number(row.Amount),
    referenceNo: row.ReferenceNo ?? undefined, requestId: row.RequestID,
  }));
}

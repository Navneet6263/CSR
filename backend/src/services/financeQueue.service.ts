import db from '../config/database';
import { decryptPii, maskValue } from '../utils/piiCrypto';
import { numericSearchId, prefixSearchPattern } from '../utils/searchPattern';

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

export async function getPendingInitiation(page = 1, limit = 20, search = '') {
  const query = db('Applications as a')
    .join('Students as st', 'a.StudentID', 'st.StudentID')
    .join('Scholarships as sc', 'a.ScholarshipID', 'sc.ScholarshipID')
    .join('Users as u', 'st.UserID', 'u.UserID')
    .leftJoin('Sponsors as sp', 'a.SponsorID', 'sp.SponsorID')
    .whereIn('a.Status', ['CSRApproved', 'PaymentFailed']);
  if (search.trim()) {
    const needle = prefixSearchPattern(search);
    const searchId = numericSearchId(search);
    query.where((builder) => { builder.where('u.FullName', 'like', needle).orWhere('sc.Name', 'like', needle)
      .orWhere('sp.SponsorName', 'like', needle); if (searchId) builder.orWhere('a.ApplicationID', searchId); });
  }
  const totalRow = await query.clone().clearSelect().clearOrder().countDistinct('a.ApplicationID as count').first();
  const rows = await query.select(
      'a.ApplicationID', 'a.Status', 'a.ScholarshipAmount', 'st.StudentID',
      'st.BankAccountNo', 'st.BankAccountCiphertext', 'st.BankIFSC', 'st.BankIFSCCiphertext',
      'st.BankName', 'st.IsAadhaarLinkedToBank', 'sc.Name as ScholarshipName', 'sp.SponsorName',
      'u.FullName as StudentName', 'a.StageEnteredAt as ApprovedAt',
    )
    .orderBy([{ column: 'a.StageEnteredAt', order: 'asc' }, { column: 'a.ApplicationID', order: 'asc' }])
    .offset((page - 1) * limit).limit(limit);
  const payments = rows.map((row) => {
    const bankAccount = row.BankAccountNo ?? decryptPii(row.BankAccountCiphertext);
    const ifsc = row.BankIFSC ?? decryptPii(row.BankIFSCCiphertext);
    delete row.BankAccountCiphertext;
    delete row.BankIFSCCiphertext;
    return { ...row, BankAccountNo: maskValue(bankAccount), BankIFSC: ifsc ? `${ifsc.slice(0, 4)}***${ifsc.slice(-2)}` : null };
  });
  return { payments, pagination: { page, limit, total: Number(totalRow?.count ?? 0) } };
}

export async function getPendingVerifications(checkerId: number, page = 1, limit = 20, search = '') {
  const query = db('Payments as p')
    .join('Applications as a', 'p.ApplicationID', 'a.ApplicationID')
    .join('Students as st', 'a.StudentID', 'st.StudentID')
    .join('Users as u', 'st.UserID', 'u.UserID')
    .join('Sponsors as sp', 'p.SponsorID', 'sp.SponsorID')
    .where('p.Status', 'Pending').whereNot('p.MakerID', checkerId);
  if (search.trim()) {
    const needle = prefixSearchPattern(search);
    const searchId = numericSearchId(search);
    query.where((builder) => { builder.where('u.FullName', 'like', needle).orWhere('sp.SponsorName', 'like', needle);
      if (searchId) builder.orWhere('a.ApplicationID', searchId).orWhere('p.PaymentID', searchId); });
  }
  const totalRow = await query.clone().clearSelect().clearOrder().countDistinct('p.PaymentID as count').first();
  const rows = await query.select(
      'p.PaymentID', 'p.Amount', 'p.PaymentType', 'p.Status as PaymentStatus',
      'p.MakerID', 'p.CreatedAt', 'a.ApplicationID', 'a.Status as ApplicationStatus', 'st.BankName',
      'st.BankAccountNo', 'st.BankAccountCiphertext', 'u.FullName as StudentName', 'sp.SponsorName',
    )
    .orderBy([{ column: 'p.CreatedAt', order: 'asc' }, { column: 'p.PaymentID', order: 'asc' }])
    .offset((page - 1) * limit).limit(limit);
  const payments = rows.map((row) => {
    const account = row.BankAccountNo ?? decryptPii(row.BankAccountCiphertext);
    delete row.BankAccountCiphertext;
    return { ...row, BankAccountNo: maskValue(account) };
  });
  return { payments, pagination: { page, limit, total: Number(totalRow?.count ?? 0) } };
}

export async function getPaymentHistory(status: 'Completed' | 'Failed', page = 1, limit = 20, search = '') {
  const query = db('Payments as p').join('Applications as a', 'p.ApplicationID', 'a.ApplicationID')
    .join('Students as st', 'p.StudentID', 'st.StudentID').join('Users as u', 'st.UserID', 'u.UserID')
    .join('Sponsors as sp', 'p.SponsorID', 'sp.SponsorID')
    .leftJoin('Users as maker', 'p.MakerID', 'maker.UserID').leftJoin('Users as checker', 'p.CheckerID', 'checker.UserID')
    .where('p.Status', status);
  if (search.trim()) {
    const needle = prefixSearchPattern(search);
    const searchId = numericSearchId(search);
    query.where((builder) => { builder.where('u.FullName', 'like', needle).orWhere('sp.SponsorName', 'like', needle)
      .orWhere('p.ReferenceNo', 'like', needle); if (searchId) builder.orWhere('p.ApplicationID', searchId); });
  }
  const totalRow = await query.clone().clearSelect().clearOrder().countDistinct('p.PaymentID as count').first();
  const payments = await query.select('p.PaymentID', 'p.ApplicationID', 'p.Amount', 'p.Status', 'p.ReferenceNo',
      'p.CheckerNotes', 'p.UpdatedAt', 'st.UpdatedAt as StudentUpdatedAt', 'st.BankName', 'u.FullName as StudentName',
      'sp.SponsorName', 'maker.FullName as MakerName', 'checker.FullName as CheckerName')
    .orderBy('p.UpdatedAt', 'desc').offset((page - 1) * limit).limit(limit);
  return { payments, pagination: { page, limit, total: Number(totalRow?.count ?? 0) } };
}

export async function getFinanceAudit(page = 1, limit = 20, search = '') {
  const query = db('AuditLogs as log').leftJoin('Users as actor', 'actor.UserID', 'log.UserID')
    .leftJoin('Payments as payment', 'payment.PaymentID', 'log.EntityID')
    .where({ 'log.EntityType': 'Payment' });
  if (search.trim()) {
    const needle = prefixSearchPattern(search);
    const searchId = numericSearchId(search);
    query.where((builder) => { builder.where('actor.FullName', 'like', needle).orWhere('log.Action', 'like', needle)
      .orWhere('payment.ReferenceNo', 'like', needle); if (searchId) builder.orWhere('payment.ApplicationID', searchId); });
  }
  const totalRow = await query.clone().clearSelect().clearOrder().countDistinct('log.LogID as count').first();
  const rows = await query.select('log.LogID', 'log.Action', 'log.EntityID', 'log.CreatedAt', 'log.RequestID',
      'actor.FullName as ActorName', 'actor.Role as ActorRole', 'payment.ApplicationID',
      'payment.Amount', 'payment.ReferenceNo')
    .orderBy('log.CreatedAt', 'desc').offset((page - 1) * limit).limit(limit);
  const events = rows.map((row) => ({
    id: String(row.LogID), timestamp: row.CreatedAt, actor: row.ActorName ?? 'System',
    role: row.ActorRole === 'Admin' ? 'Admin' : row.Action === 'PAYMENT_INITIATED' ? 'Maker'
      : row.Action.startsWith('PAYMENT_') ? 'Checker' : 'System',
    action: String(row.Action).toLowerCase().replace(/_/g, ' '),
    target: row.ApplicationID ? `APP-${row.ApplicationID}` : `PAY-${row.EntityID}`,
    paymentId: Number(row.EntityID), amount: row.Amount == null ? undefined : Number(row.Amount),
    referenceNo: row.ReferenceNo ?? undefined, requestId: row.RequestID,
  }));
  return { events, pagination: { page, limit, total: Number(totalRow?.count ?? 0) } };
}

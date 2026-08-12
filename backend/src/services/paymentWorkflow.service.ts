import { Knex } from 'knex';
import db from '../config/database';
import { InitiatePaymentInput, VerifyPaymentInput } from '../validators/finance.validator';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';
import { decryptPii, encryptPii } from '../utils/piiCrypto';
import { writeAudit } from './audit.service';
import { applicationStudentUserId, queueNotification } from './notification.service';
import { WorkflowActor, lockApplication, transitionApplication } from './workflow.service';

async function lockedRow(trx: Knex.Transaction, table: string, key: string, value: number) {
  const allowed = { Payments: 'PaymentID', Sponsors: 'SponsorID' } as const;
  if (allowed[table as keyof typeof allowed] !== key) throw new Error('Invalid lock target.');
  const rows = await trx.raw(`SELECT * FROM ${table} WITH (UPDLOCK, ROWLOCK) WHERE ${key} = ?`, [value]);
  return Array.isArray(rows) ? rows[0] : undefined;
}

async function paymentDestination(trx: Knex.Transaction, application: any, paymentType: 'Direct' | 'Institution') {
  const student = await trx('Students').where({ StudentID: application.StudentID }).first();
  if (!student) throw new NotFoundError('Student profile not found.');
  if (paymentType === 'Institution') {
    if (!student.InstitutionID) throw new ValidationError('Student institution is not configured.');
    const institution = await trx('Institutions').where({ InstitutionID: student.InstitutionID }).first();
    const account = institution && (institution.BankAccountNo ?? decryptPii(institution.BankAccountCiphertext));
    const ifsc = institution && (institution.BankIFSC ?? decryptPii(institution.BankIFSCCiphertext));
    if (!institution?.IsVerified || !account || !ifsc) {
      throw new ValidationError('Institution payment details are not verified.');
    }
    return { institutionId: institution.InstitutionID, account, ifsc, name: institution.Name };
  }
  const account = student.BankAccountNo ?? decryptPii(student.BankAccountCiphertext);
  const ifsc = student.BankIFSC ?? decryptPii(student.BankIFSCCiphertext);
  if (!account || !ifsc || !student.BankName) throw new ValidationError('Student bank details are incomplete.');
  return { institutionId: null, account, ifsc, name: student.BankName };
}

async function nextAttempt(trx: Knex.Transaction, paymentId: number) {
  const row = await trx('PaymentAttempts').where({ PaymentID: paymentId }).max('AttemptNumber as number').first();
  return Number(row?.number ?? 0) + 1;
}

export async function initiatePayment(
  data: InitiatePaymentInput,
  actor: WorkflowActor,
  idempotencyKey: string,
) {
  return db.transaction(async (trx) => {
    const prior = await trx('Payments').where({ ApplicationID: data.appId, IdempotencyKey: idempotencyKey }).first();
    if (prior) {
      if (prior.MakerID !== actor.userId) throw new ForbiddenError('Idempotency key belongs to another request.');
      return { paymentId: prior.PaymentID, applicationId: data.appId, status: prior.Status };
    }
    const application = await lockApplication(trx, data.appId);
    if (!['CSRApproved', 'PaymentFailed'].includes(application.Status)) {
      throw new ConflictError('Application is not approved for payment.');
    }
    if (!application.SponsorID) throw new ValidationError('Application has no sponsor.');
    const expectedAmount = Number(application.ScholarshipAmount);
    if (Math.round(data.amount * 100) !== Math.round(expectedAmount * 100)) {
      throw new ValidationError('Payment amount must match the approved scholarship amount.');
    }
    const sponsor = await lockedRow(trx, 'Sponsors', 'SponsorID', application.SponsorID);
    if (!sponsor || sponsor.Status !== 'Active') throw new ValidationError('Sponsor is not active.');
    const available = Number(sponsor.TotalFund) - Number(sponsor.FundAllocated) - Number(sponsor.FundUtilized);
    if (available < expectedAmount) throw new ConflictError('Sponsor has insufficient available funds.');
    const destination = await paymentDestination(trx, application, data.paymentType);
    let payment = await trx('Payments').where({ ApplicationID: data.appId }).first();
    if (payment && payment.Status !== 'Failed') throw new ConflictError('A payment already exists for this application.');
    const values = {
      Amount: expectedAmount, PaymentType: data.paymentType, Status: 'Pending', MakerID: actor.userId,
      CheckerID: null, ReferenceNo: data.referenceNo, MakerNotes: data.makerNotes || null, CheckerNotes: null,
      IdempotencyKey: idempotencyKey, DestinationCiphertext: encryptPii(JSON.stringify(destination)), UpdatedAt: trx.fn.now(),
    };
    if (payment) {
      await trx('Payments').where({ PaymentID: payment.PaymentID }).update(values);
    } else {
      const inserted = await trx('Payments').insert({ ApplicationID: data.appId, StudentID: application.StudentID,
        InstitutionID: destination.institutionId, SponsorID: application.SponsorID, ...values }).returning('*');
      payment = inserted[0];
    }
    await trx('Sponsors').where({ SponsorID: application.SponsorID })
      .increment('FundAllocated', expectedAmount).update({ UpdatedAt: trx.fn.now() });
    await trx('PaymentAttempts').insert({ PaymentID: payment.PaymentID,
      AttemptNumber: await nextAttempt(trx, payment.PaymentID), Status: 'Pending', ActorUserID: actor.userId });
    await transitionApplication(trx, data.appId, 'PaymentInitiated', actor);
    await writeAudit(trx, { userId: actor.userId, action: 'PAYMENT_INITIATED', entityType: 'Payment',
      entityId: payment.PaymentID, newValue: { applicationId: data.appId, amount: expectedAmount, paymentType: data.paymentType },
      requestId: actor.requestId, ipAddress: actor.ipAddress });
    return { paymentId: payment.PaymentID, applicationId: data.appId, status: 'Pending' };
  });
}

export async function verifyPayment(paymentId: number, actor: WorkflowActor, data: VerifyPaymentInput) {
  return db.transaction(async (trx) => {
    const payment = await lockedRow(trx, 'Payments', 'PaymentID', paymentId);
    if (!payment) throw new NotFoundError('Payment not found.');
    if (payment.Status !== 'Pending') throw new ConflictError('Payment is not pending verification.');
    if (payment.MakerID === actor.userId) throw new ForbiddenError('Checker cannot be the payment maker.');
    if (data.status === 'Completed' && payment.ReferenceNo !== data.referenceNo) {
      throw new ValidationError('Reference does not match the independently recorded bank transaction.');
    }
    const sponsor = await lockedRow(trx, 'Sponsors', 'SponsorID', payment.SponsorID);
    if (!sponsor) throw new NotFoundError('Sponsor not found.');
    const amount = Number(payment.Amount);
    if (Number(sponsor.FundAllocated) < amount) throw new ConflictError('Sponsor allocation is inconsistent.');
    await trx('Payments').where({ PaymentID: paymentId }).update({ CheckerID: actor.userId, Status: data.status,
      ReferenceNo: payment.ReferenceNo, CheckerNotes: data.checkerNotes || null, UpdatedAt: trx.fn.now() });
    const sponsorUpdate = trx('Sponsors').where({ SponsorID: payment.SponsorID }).decrement('FundAllocated', amount);
    if (data.status === 'Completed') sponsorUpdate.increment('FundUtilized', amount);
    await sponsorUpdate.update({ UpdatedAt: trx.fn.now() });
    await trx('PaymentAttempts').insert({ PaymentID: paymentId, AttemptNumber: await nextAttempt(trx, paymentId),
      Status: data.status, ReferenceNo: data.referenceNo || null,
      FailureReason: data.status === 'Failed' ? data.checkerNotes : null, ActorUserID: actor.userId });
    const appStatus = data.status === 'Completed' ? 'PaymentCompleted' : 'PaymentFailed';
    await transitionApplication(trx, payment.ApplicationID, appStatus, actor, {
      reason: data.status === 'Failed' ? data.checkerNotes : undefined,
    });
    await writeAudit(trx, { userId: actor.userId, action: `PAYMENT_${data.status.toUpperCase()}`,
      entityType: 'Payment', entityId: paymentId, oldValue: { status: payment.Status },
      newValue: { status: data.status, referenceNo: data.referenceNo }, requestId: actor.requestId,
      ipAddress: actor.ipAddress });
    const studentUserId = await applicationStudentUserId(trx, payment.ApplicationID);
    if (studentUserId) await queueNotification(trx, studentUserId, 'PAYMENT_STATUS',
      `Scholarship payment status: ${data.status}.`, { applicationId: payment.ApplicationID, status: appStatus });
    return { paymentId, applicationId: payment.ApplicationID, status: data.status };
  });
}

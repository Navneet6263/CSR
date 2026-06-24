import db from '../config/database';
import { AppError } from '../utils/errors';
import { InitiatePaymentInput, VerifyPaymentInput } from '../validators/finance.validator';

export class FinanceService {
  /**
   * Get applications ready for payment initiation
   */
  async getPendingInitiation() {
    return db('Applications as a')
      .join('Students as st', 'a.StudentID', 'st.StudentID')
      .join('Scholarships as sc', 'a.ScholarshipID', 'sc.ScholarshipID')
      .leftJoin('Sponsors as sp', 'a.SponsorID', 'sp.SponsorID')
      .select(
        'a.ApplicationID',
        'a.Status',
        'a.ScholarshipAmount',
        'st.StudentID',
        'st.BankAccountNo',
        'st.BankIFSC',
        'st.BankName',
        'sc.Name as ScholarshipName',
        'sp.SponsorName'
      )
      .where('a.Status', 'CSRApproved');
  }

  /**
   * Maker initiates payment
   */
  async initiatePayment(data: InitiatePaymentInput, makerId: number) {
    return db.transaction(async (trx) => {
      const app = await trx('Applications')
        .where('ApplicationID', data.appId)
        .first();

      if (!app) {
        throw new AppError('Application not found', 404);
      }

      if (app.Status !== 'CSRApproved') {
        throw new AppError('Application is not approved for payment', 400);
      }

      const student = await trx('Students')
        .where('StudentID', app.StudentID)
        .first();

      if (!app.SponsorID) {
        throw new AppError('Application lacks SponsorID, required for payment', 400);
      }

      const [payment] = await trx('Payments').insert({
        ApplicationID: data.appId,
        StudentID: app.StudentID,
        InstitutionID: student?.InstitutionID || null,
        SponsorID: app.SponsorID,
        Amount: data.amount,
        PaymentType: data.paymentType,
        Status: 'Pending',
        MakerID: makerId,
        MakerNotes: data.makerNotes || null,
      }).returning('*');

      // Update Application status
      await trx('Applications')
        .where('ApplicationID', data.appId)
        .update({
          Status: 'PaymentInitiated',
        });

      return { paymentId: payment.PaymentID };
    });
  }

  /**
   * Get payments waiting for verification
   */
  async getPendingVerifications() {
    return db('Payments as p')
      .join('Applications as a', 'p.ApplicationID', 'a.ApplicationID')
      .join('Students as st', 'a.StudentID', 'st.StudentID')
      .select(
        'p.PaymentID',
        'p.Amount',
        'p.PaymentType',
        'p.Status as PaymentStatus',
        'p.MakerID',
        'a.ApplicationID',
        'a.Status as ApplicationStatus',
        'st.BankAccountNo',
        'st.BankIFSC',
        'st.BankName'
      )
      .where('p.Status', 'Pending');
  }

  /**
   * Checker verifies and finalizes payment
   */
  async verifyPayment(paymentId: number, checkerId: number, data: VerifyPaymentInput) {
    return db.transaction(async (trx) => {
      const payment = await trx('Payments')
        .where('PaymentID', paymentId)
        .first();

      if (!payment) {
        throw new AppError('Payment not found', 404);
      }

      if (payment.Status !== 'Pending') {
        throw new AppError('Payment is not pending verification', 400);
      }

      if (payment.MakerID === checkerId) {
        throw new AppError('Checker cannot be the same as Maker', 403);
      }

      // Update Payments
      await trx('Payments')
        .where('PaymentID', paymentId)
        .update({
          CheckerID: checkerId,
          Status: data.status,
          ReferenceNo: data.referenceNo,
          CheckerNotes: data.checkerNotes || null,
          UpdatedAt: db.fn.now()
        });

      // Update Application status
      const appStatus = data.status === 'Completed' ? 'PaymentCompleted' : 'PaymentFailed';
      
      await trx('Applications')
        .where('ApplicationID', payment.ApplicationID)
        .update({
          Status: appStatus,
        });

      return { success: true, paymentId, status: data.status };
    });
  }
}

export const financeService = new FinanceService();

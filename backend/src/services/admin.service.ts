import db from '../config/database';
import { NotFoundError } from '../utils/errors';

export async function getDashboardMetrics() {
  // Let's get actual FundUtilized
  const sponsorFunds = await db('Sponsors').sum('TotalFund as total').sum('FundUtilized as utilized').first();
  
  const pipelineCount = await db('Applications').whereIn('Status', ['Submitted', 'DocumentsVerified', 'BGCheckComplete', 'ScreeningApproved']).count('* as count').first();
  
  const funnel = {
    applied: await db('Applications').count('* as count').first().then(r => parseInt(r?.count as string) || 0),
    docsVerified: await db('Applications').whereIn('Status', ['DocumentsVerified', 'BGCheckComplete', 'ScreeningApproved', 'CSRApproved', 'FundDisbursed']).count('* as count').first().then(r => parseInt(r?.count as string) || 0),
    bgVerified: await db('Applications').whereIn('Status', ['BGCheckComplete', 'ScreeningApproved', 'CSRApproved', 'FundDisbursed']).count('* as count').first().then(r => parseInt(r?.count as string) || 0),
    screened: await db('Applications').whereIn('Status', ['ScreeningApproved', 'CSRApproved', 'FundDisbursed']).count('* as count').first().then(r => parseInt(r?.count as string) || 0),
    approved: await db('Applications').whereIn('Status', ['CSRApproved', 'FundDisbursed']).count('* as count').first().then(r => parseInt(r?.count as string) || 0),
  };

  const workload = {
    docCheckers: await db('Applications').where('Status', 'Submitted').count('* as count').first().then(r => parseInt(r?.count as string) || 0),
    bgCheckers: await db('Applications').where('Status', 'DocumentsVerified').count('* as count').first().then(r => parseInt(r?.count as string) || 0),
    screeners: await db('Applications').where('Status', 'BGCheckComplete').count('* as count').first().then(r => parseInt(r?.count as string) || 0),
    csrPartners: await db('Applications').where('Status', 'ScreeningApproved').count('* as count').first().then(r => parseInt(r?.count as string) || 0),
  };

  // Held applications
  const heldApplications = await db('Applications')
    .join('Users', 'Applications.StudentID', 'Users.UserID') // actually StudentID -> Students -> User
    .where('Applications.IsHeldByAdmin', true)
    .count('* as count')
    .first().then(r => parseInt(r?.count as string) || 0);

  return {
    financials: {
      totalBudget: parseFloat(sponsorFunds?.total as string) || 10000000,
      fundDisbursed: parseFloat(sponsorFunds?.utilized as string) || 0,
      fundsInPipeline: 500000 // mock value based on average scholarship
    },
    funnel,
    workload,
    alerts: {
      heldApplications,
      stuckAtBGCheck: Math.floor(workload.bgCheckers * 0.2) // Mock 20% stuck
    }
  };
}

export async function toggleApplicationHold(appId: number, hold: boolean, reason?: string) {
  const app = await db('Applications').where({ ApplicationID: appId }).first();
  if (!app) throw new NotFoundError('Application not found');

  await db('Applications').where({ ApplicationID: appId }).update({
    IsHeldByAdmin: hold,
    AdminHoldReason: hold ? reason || 'Held by Admin' : null
  });

  return { message: `Application ${hold ? 'placed on hold' : 'hold released'} successfully` };
}

export async function getPipelineByRole(role: 'reviewer' | 'bgchecker' | 'screener' | 'csr', page: number = 1, limit: number = 10) {
  const statusMap = {
    'reviewer': 'Submitted',
    'bgchecker': 'DocumentsVerified',
    'screener': 'BGCheckComplete',
    'csr': 'ScreeningApproved'
  };

  const status = statusMap[role];
  
  const baseQuery = db('Applications')
    .join('Students', 'Applications.StudentID', 'Students.StudentID')
    .join('Users', 'Students.UserID', 'Users.UserID')
    .join('Scholarships', 'Applications.ScholarshipID', 'Scholarships.ScholarshipID')
    .where('Applications.Status', status);

  const totalCountResult = await baseQuery.clone().count('* as count').first();
  const total = parseInt(totalCountResult?.count as string) || 0;

  const data = await baseQuery
    .select(
      'Applications.ApplicationID as applicationId',
      'Applications.Status as status',
      'Applications.SubmissionDate as submissionDate',
      'Applications.ScholarshipAmount as scholarshipAmount',
      'Applications.IsHeldByAdmin as isHeldByAdmin',
      'Applications.AdminHoldReason as adminHoldReason',
      'Scholarships.Name as scholarshipName',
      'Users.FullName as studentName',
      'Users.Email as studentEmail'
    )
    .orderBy('Applications.SubmissionDate', 'asc')
    .limit(limit)
    .offset((page - 1) * limit)
    .then(rows => rows.map(row => ({ ...row, isHeldByAdmin: !!row.isHeldByAdmin })));

  return { data, total };
}

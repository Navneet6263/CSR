import db from '../config/database';

const approvedStatuses = [
  'CSRApproved', 'PaymentPending', 'PaymentInitiated', 'PaymentCompleted',
];

const stages = [
  { key: 'document', stage: 'Document Check', statuses: ['Submitted', 'AutoMatched', 'DocAuditInProgress'], thresholdHours: 24 },
  { key: 'background', stage: 'Background Check', statuses: ['DocAuditComplete', 'BGCheckInProgress'], thresholdHours: 48 },
  { key: 'screening', stage: 'Screening', statuses: ['BGCheckComplete', 'ScreeningPending'], thresholdHours: 24 },
  { key: 'csr', stage: 'CSR Approval', statuses: ['ScreeningApproved', 'CSRPending'], thresholdHours: 24 },
] as const;

const stateCodes: Record<string, string> = {
  'Andhra Pradesh': 'AP', Assam: 'AS', Bihar: 'BR', Chhattisgarh: 'CG', Delhi: 'DL', Goa: 'GA',
  Gujarat: 'GJ', Haryana: 'HR', 'Himachal Pradesh': 'HP', Jharkhand: 'JH', Karnataka: 'KA', Kerala: 'KL',
  'Madhya Pradesh': 'MP', Maharashtra: 'MH', Odisha: 'OD', Punjab: 'PB', Rajasthan: 'RJ',
  Sikkim: 'SK', 'Tamil Nadu': 'TN', Telangana: 'TS', 'Uttar Pradesh': 'UP', Uttarakhand: 'UK',
  'West Bengal': 'WB', 'Jammu and Kashmir': 'JK',
};

function ageHours(value: Date | string | null) {
  if (!value) return 0;
  return Math.max(0, (Date.now() - new Date(value).getTime()) / 3_600_000);
}

export async function getSlaAnalytics() {
  const statuses = stages.flatMap((item) => [...item.statuses]);
  const rows = await db('Applications').select('Status', 'StageEnteredAt', 'SubmissionDate', 'CreatedAt')
    .whereIn('Status', statuses);
  return stages.map((definition) => {
    const ages = rows.filter((row) => definition.statuses.includes(row.Status as never))
      .map((row) => ageHours(row.StageEnteredAt ?? row.SubmissionDate ?? row.CreatedAt));
    const threshold = definition.thresholdHours;
    return {
      key: definition.key, stage: definition.stage, thresholdHours: threshold, total: ages.length,
      averageHours: ages.length ? ages.reduce((sum, value) => sum + value, 0) / ages.length : 0,
      worstHours: ages.length ? Math.max(...ages) : 0,
      onTrack: ages.filter((value) => value <= threshold * 0.75).length,
      atRisk: ages.filter((value) => value > threshold * 0.75 && value <= threshold).length,
      breached: ages.filter((value) => value > threshold).length,
    };
  });
}

export async function getGeoAnalytics() {
  const stateRows = await db('Applications as a').join('Students as s', 's.StudentID', 'a.StudentID')
    .whereNotNull('s.State').whereNot('s.State', '')
    .select('s.State as name').countDistinct('a.StudentID as applicants')
    .select(db.raw(`COUNT(DISTINCT CASE WHEN a.Status IN (${approvedStatuses.map(() => '?').join(',')}) THEN a.StudentID END) AS approved`, approvedStatuses))
    .groupBy('s.State').orderBy('applicants', 'desc');

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86_400_000);
  const cityRows = await db('Applications as a').join('Students as s', 's.StudentID', 'a.StudentID')
    .whereNotNull('s.City').whereNot('s.City', '').whereNotNull('s.State').whereNot('s.State', '')
    .select('s.City as city', 's.State as state').countDistinct('a.StudentID as applicants')
    .select(db.raw(`COUNT(DISTINCT CASE WHEN a.Status IN (${approvedStatuses.map(() => '?').join(',')}) THEN a.StudentID END) AS approved`, approvedStatuses))
    .select(db.raw('COUNT(DISTINCT CASE WHEN a.CreatedAt >= ? THEN a.StudentID END) AS currentPeriod', [thirtyDaysAgo]))
    .select(db.raw('COUNT(DISTINCT CASE WHEN a.CreatedAt >= ? AND a.CreatedAt < ? THEN a.StudentID END) AS previousPeriod', [sixtyDaysAgo, thirtyDaysAgo]))
    .groupBy('s.City', 's.State').orderBy('applicants', 'desc').limit(12);

  return {
    states: stateRows.map((row) => ({ name: row.name, code: stateCodes[row.name] ?? '',
      applicants: Number(row.applicants), approved: Number(row.approved) })),
    cities: cityRows.map((row) => {
      const current = Number(row.currentPeriod); const previous = Number(row.previousPeriod);
      const trend = previous ? Math.round(((current - previous) / previous) * 100) : (current ? 100 : 0);
      return { city: row.city, state: row.state, applicants: Number(row.applicants),
        approved: Number(row.approved), trend };
    }),
  };
}

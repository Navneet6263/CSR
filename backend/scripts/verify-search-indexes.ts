import db from '../src/config/database';

const expected = [
  'idx_users_search_name', 'idx_scholarships_search_name', 'idx_sponsors_search_name',
  'idx_institutions_search_name', 'idx_students_course_search', 'idx_support_ticket_search',
  'idx_announcement_search', 'idx_broadcast_search', 'idx_decision_actor_history',
  'idx_docs_reviewer_type_history', 'idx_bg_officer_type_history', 'idx_audit_action_time',
  'idx_audit_request_time', 'idx_broadcast_audience_time',
];

async function run() {
  const rows = await db('sys.indexes').select('name').whereIn('name', expected);
  const installed = new Set(rows.map((row) => String(row.name)));
  const missing = expected.filter((name) => !installed.has(name));
  if (missing.length) throw new Error(`Missing search indexes: ${missing.join(', ')}`);

  // Warm the connection before measuring the application-visible DB round trip.
  await db.raw('SELECT 1 AS warm');
  const timings: number[] = [];
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const started = performance.now();
    await db('Scholarships as s').join('Sponsors as sp', 'sp.SponsorID', 's.SponsorID')
      .select('s.ScholarshipID', 's.Name', 'sp.SponsorName')
      .where('s.Name', 'like', 'A%').orderBy('s.ApplicationCloseDate', 'asc').limit(12);
    timings.push(Number((performance.now() - started).toFixed(2)));
  }
  const sorted = [...timings].sort((a, b) => a - b);
  console.info(JSON.stringify({ installed: expected.length, missing,
    warmSearchRoundTripMs: { median: sorted[1], min: sorted[0], max: sorted[2] } }));
}

run().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db.destroy());

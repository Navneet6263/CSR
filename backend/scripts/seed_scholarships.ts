import db from '../src/config/database';

async function seedScholarships() {
  console.log('Seeding Scholarships...');

  // Create an Admin Sponsor (SponsorID)
  const admin = await db('Users').where({ Role: 'Admin' }).first();
  if (!admin) throw new Error('Admin user not found. Please run seed.ts first.');

  let sponsor = await db('Sponsors').first();
  if (!sponsor) {
    await db('Sponsors').insert({
      SponsorName: 'TalentBridge Foundation',
      ContactPerson: 'Admin User',
      Email: 'sponsor@test.com',
      Phone: '9876543210',
      TotalFund: 50000000,
      FundAllocated: 0,
      FundUtilized: 0,
      ApprovalPolicy: 'Manual',
      Status: 'Active',
    });
    sponsor = await db('Sponsors').first();
  }
  
  if (!sponsor || !sponsor.SponsorID) throw new Error('Sponsor creation failed');
  const spId = sponsor.SponsorID;

  // 1. Merit-cum-Means Scholarship
  const sch1Ret = await db('Scholarships').insert({
    Name: 'Merit-cum-Means Scholarship 2026',
    Description: 'Financial assistance for economically weaker sections.',
    SponsorID: spId,
    TotalBudget: 5000000,
    PerStudentAmount: 50000,
    ApplicationOpenDate: '2026-01-01',
    ApplicationCloseDate: '2026-12-31',
    MaxApplicants: 1000,
    Status: 'Active',
  }).returning('ScholarshipID');
  const sch1Id = typeof sch1Ret[0] === 'object' ? sch1Ret[0].ScholarshipID : sch1Ret[0];

  // Rules for Sch1: Income < 200000
  await db('EligibilityRules').insert([
    {
      ScholarshipID: sch1Id,
      RuleType: 'Income',
      Operator: 'LT',
      ValueMin: '200000',
      IsRequired: true,
    }
  ]);

  // 2. STEM Girls Scholarship
  const sch2Ret = await db('Scholarships').insert({
    Name: 'STEM Women Leaders Scholarship',
    Description: 'Encouraging young women to pursue engineering and technology.',
    SponsorID: spId,
    TotalBudget: 3000000,
    PerStudentAmount: 75000,
    ApplicationOpenDate: '2026-01-01',
    ApplicationCloseDate: '2026-12-31',
    Status: 'Active',
  }).returning('ScholarshipID');
  const sch2Id = typeof sch2Ret[0] === 'object' ? sch2Ret[0].ScholarshipID : sch2Ret[0];

  // Rules for Sch2: Gender == Female, Course in ['B.Tech', 'B.E.']
  await db('EligibilityRules').insert([
    {
      ScholarshipID: sch2Id,
      RuleType: 'Gender',
      Operator: 'EQ',
      ValueMin: 'Female',
      IsRequired: true,
    },
    {
      ScholarshipID: sch2Id,
      RuleType: 'Course',
      Operator: 'IN',
      ValueList: JSON.stringify(['B.Tech', 'B.E.', 'B.Tech Computer Science']),
      IsRequired: true,
    }
  ]);

  // 3. Open Excellence Scholarship (No strict rules, just age between 18 and 25)
  const sch3Ret = await db('Scholarships').insert({
    Name: 'Open Excellence Scholarship',
    Description: 'General scholarship for excellent students.',
    SponsorID: spId,
    TotalBudget: 10000000,
    PerStudentAmount: 25000,
    ApplicationOpenDate: '2026-01-01',
    ApplicationCloseDate: '2026-12-31',
    Status: 'Active',
  }).returning('ScholarshipID');
  const sch3Id = typeof sch3Ret[0] === 'object' ? sch3Ret[0].ScholarshipID : sch3Ret[0];

  await db('EligibilityRules').insert([
    {
      ScholarshipID: sch3Id,
      RuleType: 'Age',
      Operator: 'BETWEEN',
      ValueMin: '18',
      ValueMax: '25',
      IsRequired: true,
    }
  ]);

  console.log('Successfully seeded 3 scholarships and their eligibility rules!');
  process.exit(0);
}

seedScholarships().catch(console.error);

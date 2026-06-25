import bcrypt from 'bcrypt';
import db from '../src/config/database';

async function seed() {
  console.log('Starting seed process...');

  // 1. Create a common password hash
  const commonPassword = await bcrypt.hash('Student@123', 10);

  // 2. Ensure Sponsor User exists
  let sponsorUser = await db('Users').where('Email', 'sponsor@talentbridge.com').first();
  if (!sponsorUser) {
    const [insertedSponsorUser] = await db('Users').insert({
      FullName: 'HDFC CSR Team',
      Email: 'sponsor@talentbridge.com',
      PasswordHash: commonPassword,
      Role: 'CSRPartner',
      AgentCode: 'SPONSOR',
      IsActive: true
    }).returning('*');
    sponsorUser = insertedSponsorUser;
  }

  // 2.5 Ensure Sponsor entity exists
  let sponsor = await db('Sponsors').where('Email', 'sponsor@talentbridge.com').first();
  if (!sponsor) {
    const [insertedSponsor] = await db('Sponsors').insert({
      SponsorName: 'HDFC Foundation',
      ContactPerson: 'HDFC CSR Team',
      Email: 'sponsor@talentbridge.com',
      Phone: '9876543210',
      TotalFund: 10000000,
      FundAllocated: 0,
      FundUtilized: 0,
      ApprovalPolicy: 'Manual',
      Status: 'Active'
    }).returning('*');
    sponsor = insertedSponsor;
  }

  // 2.7 Ensure Institution exists
  let institution = await db('Institutions').first();
  if (!institution) {
    const [insertedInstitution] = await db('Institutions').insert({
      InstitutionName: 'Delhi Technological University',
      InstitutionType: 'Government',
      ContactPerson: 'Registrar',
      Email: 'registrar@dtu.ac.in',
      Phone: '1122334455',
      State: 'Delhi',
      Status: 'Active'
    }).returning('*');
    institution = insertedInstitution;
  }


  // 3. Create 20 Scholarships
  const scholarshipNames = [
    'HDFC Badhte Kadam Scholarship 2026', 'Tata Motors Shiksha Grant', 'Reliance Foundation UG Scholarship',
    'Wipro Education Initiative', 'Infosys STEM Scholarship', 'SBI Asha Scholarship Program',
    'L&T Engineering Grant', 'Mahindra Rise Scholarship', 'Kotak Kanya Scholarship',
    'Aditya Birla Capital Scholarship', 'Tech Mahindra Smart Academy Grant', 'Godrej Shiksha Scholarship',
    'Bajaj Finserv Scholarship', 'Hero MotoCorp Shiksha', 'HCL Tech Bee Scholarship',
    'Maruti Suzuki Scholarship', 'TCS Ignite Grant', 'ITC Rural Education Grant',
    'ONGC Meritorious Scholarship', 'NTPC Utkarsh Scholarship'
  ];

  const scholarships = [];
  for (let i = 0; i < 20; i++) {
    const [scholarship] = await db('Scholarships').insert({
      SponsorID: sponsor.SponsorID,
      Name: scholarshipNames[i],
      Description: `This is a premium scholarship program aimed at supporting meritorious students. Program: ${scholarshipNames[i]}`,
      TotalBudget: 500000 + (Math.random() * 2000000),
      PerStudentAmount: 10000 + (Math.floor(Math.random() * 40) * 1000),
      ApplicationOpenDate: '2026-01-01',
      ApplicationCloseDate: '2026-12-31',
      MaxApplicants: 500 + Math.floor(Math.random() * 500),
      Status: 'Active'
    }).returning('*');
    scholarships.push(scholarship);

    // Add some random eligibility rules for each
    await db('EligibilityRules').insert({
      ScholarshipID: scholarship.ScholarshipID,
      RuleType: 'Course',
      Operator: 'IN',
      ValueList: JSON.stringify(['B.Tech', 'B.Sc', 'B.Com', 'B.A']),
      IsRequired: true
    });
    
    await db('EligibilityRules').insert({
      ScholarshipID: scholarship.ScholarshipID,
      RuleType: 'MaxAnnualIncome',
      Operator: 'LT',
      ValueMax: '500000',
      IsRequired: true
    });
  }

  // 4. Create 100 Students
  const firstNames = ['Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Rohan', 'Kabir', 'Dhruv', 'Ananya', 'Diya', 'Ishita', 'Sneha', 'Kavya', 'Pooja', 'Riya', 'Neha', 'Nikhil', 'Karan', 'Rahul', 'Rahul'];
  const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Das', 'Patel', 'Reddy', 'Rao', 'Nair'];
  const courses = ['B.Tech', 'B.Sc', 'B.Com', 'B.A', 'BCA', 'MBBS'];

  const students = [];
  for (let i = 1; i <= 100; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `student${i}@test.com`;
    
    // Check if exists
    let user = await db('Users').where('Email', email).first();
    if (!user) {
      const [insertedUser] = await db('Users').insert({
        FullName: `${fn} ${ln}`,
        Email: email,
        PasswordHash: commonPassword,
        Role: 'Student',
        AgentCode: `STU${i}`,
        IsActive: true
      }).returning('*');
      user = insertedUser;
    }

    let studentProfile = await db('Students').where('UserID', user.UserID).first();
    if (!studentProfile) {
      const [insertedStudent] = await db('Students').insert({
        UserID: user.UserID,
        // Phone: `98765${Math.floor(10000 + Math.random() * 90000)}`, // Phone is in Users table
        AadharNumber: `12345678${Math.floor(1000 + Math.random() * 9000)}`,
        DOB: '2004-05-15',
        Gender: Math.random() > 0.5 ? 'Male' : 'Female',
        Category: ['General', 'OBC', 'SC', 'ST'][Math.floor(Math.random() * 4)],
        Address: `${Math.floor(Math.random() * 100)} Main Street, Area`,
        City: 'Delhi',
        State: 'Delhi',
        Pincode: '110001',
        FatherName: `Mr. ${ln}`,
        MotherName: `Mrs. ${ln}`,
        AnnualFamilyIncome: 100000 + Math.floor(Math.random() * 400000),
        FamilySize: Math.floor(2 + Math.random() * 5),
        InstitutionID: institution.InstitutionID,
        Course: courses[Math.floor(Math.random() * courses.length)],
        EnrollmentYear: 2024,
        CurrentSemesterOrYear: '3',
        TenthMarks: 75 + Math.random() * 20,
        TwelfthMarks: 75 + Math.random() * 20,
        BankAccountNo: `123456789${Math.floor(100 + Math.random() * 900)}`,
        BankIFSC: 'SBIN0001234',
        BankName: 'State Bank of India',
        // New extended fields
        IsHosteller: Math.random() > 0.5,
        DistanceFromHome: Math.floor(10 + Math.random() * 500),
        HasGapYear: Math.random() > 0.8,
        ReceivedPreviousScholarship: Math.random() > 0.7,
        StatementOfPurpose: 'I want to study hard and contribute to society.',
        ExtracurricularActivities: 'Football, Chess, Debating',
        IsAadhaarLinkedToBank: true,
        IsEKYCVerified: true
      }).returning('*');
      studentProfile = insertedStudent;
    }
    students.push(studentProfile);
  }

  // 5. Create Applications
  // Put them in "Submitted" status so they show up for Review
  console.log('Creating applications...');
  for (let s of students) {
    // Each student applies to 2 random scholarships
    const sch1 = scholarships[Math.floor(Math.random() * scholarships.length)];
    const sch2 = scholarships[Math.floor(Math.random() * scholarships.length)];

    const apply = async (scholarshipId: number) => {
      const existing = await db('Applications').where({ StudentID: s.StudentID, ScholarshipID: scholarshipId }).first();
      if (!existing) {
        await db('Applications').insert({
          StudentID: s.StudentID,
          ScholarshipID: scholarshipId,
          Status: 'Submitted', // Submitted means they are waiting for screening/review
          SubmissionDate: new Date()
        });
      }
    };

    await apply(sch1.ScholarshipID);
    if (sch1.ScholarshipID !== sch2.ScholarshipID) {
      await apply(sch2.ScholarshipID);
    }
  }

  console.log('Seed completed successfully!');
  console.log('Test Accounts:');
  console.log('- student1@test.com ... student100@test.com (Password: Student@123)');
  console.log('- sponsor@talentbridge.com (Password: Student@123)');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});

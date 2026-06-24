# CSR Scholarship Management System — Design Document
## Part 1 of 2: Architecture, Database & Core Modules

> **For AI Agents — Read This First**
> This is a 2-part design document. Read PART 1 first, then PART 2.
> Part 1 covers: System Overview → Workflow → Database (12 tables) → Eligibility Engine → Document Audit → Background Check
> Part 2 covers: Screening & Approval → Disbursement → Dashboards → UI → APIs → Tech Stack

---

## Index

```
PART 1
├── Chapter 1  — System Overview & User Roles
├── Chapter 2  — End-to-End Lifecycle Workflow
├── Chapter 3  — Database Design (12 Tables, SQL Server)
├── Chapter 4  — Eligibility Configuration & Auto-Matching Engine
├── Chapter 5  — Document Audit & Re-Upload Loop
└── Chapter 6  — Background Check Module
```

---

## Chapter 1 — System Overview & User Roles

### What is this System?

The **CSR Scholarship Management System** is an enterprise-grade digital platform that handles the complete end-to-end lifecycle of scholarship applications:

- Student self-registration & eligibility-based auto-matching
- Multi-stage review: document audit → background check → screening
- CSR partner approval
- Fund disbursement (to student bank account OR institution account)
- Every decision logged for full auditability

---

### Guiding Principles

| Principle | Description |
|---|---|
| Transparency | Students always see exactly where their application stands |
| Auditability | Every approval, rejection, and payment logged with who/what/when |
| Data Privacy | Sensitive data is access-controlled and encrypted at rest |
| Configurability | Eligibility rules are configurable by admin — not hard-coded |
| Separation of Duties | Review, screening, approval, disbursement are enforced as distinct roles |

---

### User Roles (8 Roles)

```
┌─────────────────────────────────────────────────────────────────┐
│                        SYSTEM USERS                             │
├───────────────────┬─────────────────────────────────────────────┤
│ Student           │ Self-register, upload docs, track status    │
│ Agent             │ Field rep — registers students in bulk      │
│ Doc Reviewer      │ Audits documents, triggers re-upload        │
│ BG Check Officer  │ Conducts verification, records pass/fail    │
│ Screening Officer │ Final accept/reject decision                │
│ CSR Partner       │ Approves shortlist, views fund utilization  │
│ Admin             │ Configures rules, manages all stages        │
│ Finance Officer   │ Executes disbursement (maker-checker)       │
└───────────────────┴─────────────────────────────────────────────┘
```

> **Key Rule:** Separation of duties is enforced — same user CANNOT be Doc Reviewer AND Screening Officer on the same case.

---

## Chapter 2 — End-to-End Lifecycle Workflow

### 8-Stage Flow (Normal Path)

```
Stage 1          Stage 2          Stage 3          Stage 4
Student    ──►  Profile &     ──►  Auto        ──►  Document
Registration    Documents         Matching          Audit
                                     │                 │
                               [Ineligible?]    [Doc Rejected?]
                                     │                 │
                                  Flagged ◄────  Re-upload Loop
                                                      │
Stage 5          Stage 6          Stage 7          Stage 8
Background  ──►  Screening   ──►  CSR Partner ──►  Fund
Check            Decision         Approval          Disbursement
    │                │                │
 [Fail?]       [Rejected?]      [Declined?]
    │                │                │
 Route to       Notify          Re-pool to
 Screening      Student         Alt. Scholarship
```

---

### Stage Summary Table

| Stage | Name | Description |
|---|---|---|
| 1 | Student Registration | Email/phone OTP, identity verification, account setup |
| 2 | Profile & Documents | Personal, family income, education info. All docs uploaded |
| 3 | Auto-Matching | System matches student profile against active scholarship eligibility rules |
| 4 | Document Audit | Reviewer checks each doc. Rejected docs trigger re-upload loop |
| 5 | Background Check | BG Officer records verification findings. Pass → Screening |
| 6 | Screening Decision | Screening Officer makes final accept/reject. Cannot be same as Doc Reviewer |
| 7 | CSR Partner Approval | Shortlisted students sent to CSR partner for Approve / Decline / Defer |
| 8 | Fund Disbursement | Finance disburses to student bank or institution. Maker-checker workflow |

---

### Exception & Decision Points

| Exception | What Happens |
|---|---|
| Eligibility Fail at Auto-Match | Application flagged; student notified with specific reason |
| Document Rejected at Audit | Checklist item reopened; student re-uploads; cycle repeats |
| Background Check Fail | Routed to screening for rejection with mandatory documented reason |
| Screening Reject | Student notified with reason; case closed |
| Partner Decline | Returned to admin; candidate may be re-pooled for alternate scholarship |
| Disbursement Failure | Finance retries or corrects details; status stays `Initiated` until resolved |

---

## Chapter 3 — Database Design (SQL Server, 12 Tables)

### Entity Relationship Overview

```
                        ┌──────────────┐
                ┌───────│ Scholarships │───────┐
                │       └──────┬───────┘       │
                │              │               │
        ┌───────▼──────┐  ┌───▼────────────┐  │
        │EligibilityRules│  │  Applications  │◄─┘
        └──────────────┘  │   (CORE TABLE) │
                          └───┬────────────┘
              ┌───────────────┼───────────────────────┐
              │               │                       │
     ┌────────▼────┐  ┌───────▼──────┐   ┌───────────▼──────┐
     │  Documents  │  │BackgroundChks│   │    Payments       │
     │  Checklist  │  └──────────────┘   └───────────────────┘
     └─────────────┘
              │
   ┌──────────┼──────────┐
   │          │          │
┌──▼──┐  ┌───▼──┐  ┌────▼──────┐
│Users│  │Studs │  │Institutions│
└─────┘  └──────┘  └───────────┘

Also: Sponsors, Agents, AuditLogs, Notifications
Total: 12 Tables
```

---

### Table 1 — Users

All system users across every role.

```sql
CREATE TABLE Users (
  UserID         INT IDENTITY(1,1) PRIMARY KEY,
  FullName       NVARCHAR(150) NOT NULL,
  Email          NVARCHAR(200) NOT NULL UNIQUE,
  Phone          NVARCHAR(20),
  PasswordHash   NVARCHAR(255) NOT NULL,
  Role           NVARCHAR(30) NOT NULL
                 CHECK (Role IN ('Student','Agent','DocReviewer','BGCheckOfficer',
                                 'ScreeningOfficer','CSRPartner','Admin','Finance')),
  AgentCode      NVARCHAR(20) UNIQUE,
  SponsorID      INT REFERENCES Sponsors(SponsorID),
  IsActive       BIT DEFAULT 1,
  CreatedAt      DATETIME2 DEFAULT GETDATE(),
  UpdatedAt      DATETIME2 DEFAULT GETDATE()
);
```

> 8 roles enforced via CHECK constraint. Same user cannot be DocReviewer AND ScreeningOfficer on same case — enforced in application logic.

> **Knex type rule:** `table.increments('id')` → SQL Server mein `INT IDENTITY(1,1)` banega. `Email` aur `AgentCode` ke liye `table.unique([...])` migration mein hi likhna. See Chapter 16 in PART 2.

---

### Table 2 — Students

Extended student profile — personal, family, and education details.

```sql
CREATE TABLE Students (
  StudentID           INT IDENTITY(1,1) PRIMARY KEY,
  UserID              INT NOT NULL REFERENCES Users(UserID),
  AadharNumber        NVARCHAR(20),
  DOB                 DATE,
  Gender              NVARCHAR(10),
  Category            NVARCHAR(50),      -- General/OBC/SC/ST
  Address             NVARCHAR(500),
  City                NVARCHAR(100),
  State               NVARCHAR(100),
  Pincode             NVARCHAR(10),
  AnnualFamilyIncome  DECIMAL(15,2),
  FamilySize          INT,
  Course              NVARCHAR(200),
  InstitutionID       INT REFERENCES Institutions(InstitutionID),
  EnrollmentYear      INT,
  BankAccountNo       NVARCHAR(50),
  BankIFSC            NVARCHAR(20),
  BankName            NVARCHAR(100),
  CreatedAt           DATETIME2 DEFAULT GETDATE()
);
```

---

### Table 3 — Applications (Core Table)

Full application lifecycle tracking with 18 status values.

```sql
CREATE TABLE Applications (
  ApplicationID        INT IDENTITY(1,1) PRIMARY KEY,
  StudentID            INT NOT NULL REFERENCES Students(StudentID),
  AgentID              INT REFERENCES Agents(AgentID),
  ScholarshipID        INT NOT NULL REFERENCES Scholarships(ScholarshipID),
  SubmissionDate       DATETIME2 DEFAULT GETDATE(),
  Status               NVARCHAR(40) DEFAULT 'Draft'
                       CHECK (Status IN (
                         'Draft','Submitted','AutoMatched','EligibilityFailed',
                         'DocAuditInProgress','DocAuditComplete',
                         'BGCheckInProgress','BGCheckComplete',
                         'ScreeningPending','ScreeningApproved','ScreeningRejected',
                         'CSRPending','CSRApproved','CSRDeclined',
                         'PaymentPending','PaymentInitiated','PaymentCompleted','Cancelled'
                       )),
  AssignedDocReviewer  INT REFERENCES Users(UserID),
  AssignedBGOfficer    INT REFERENCES Users(UserID),
  AssignedScreener     INT REFERENCES Users(UserID),
  ScholarshipAmount    DECIMAL(10,2),
  SponsorID            INT REFERENCES Sponsors(SponsorID),
  AdminApprovedBy      INT REFERENCES Users(UserID),
  AdminApprovedAt      DATETIME2,
  Notes                NVARCHAR(MAX),
  CreatedAt            DATETIME2 DEFAULT GETDATE()
);
```

> 18 status values cover every lifecycle stage. Separate `Assigned*` columns enforce separation of duties at DB level.

---

### Table 4 — EligibilityRules

Admin-configurable criteria per scholarship — no code change needed.

```sql
CREATE TABLE EligibilityRules (
  RuleID       INT IDENTITY(1,1) PRIMARY KEY,
  ScholarshipID INT NOT NULL REFERENCES Scholarships(ScholarshipID),
  RuleType     NVARCHAR(50) NOT NULL
               CHECK (RuleType IN ('MaxAnnualIncome','MinAge','MaxAge',
                                   'Gender','Category','State','Course',
                                   'MinGrade','InstitutionType')),
  Operator     NVARCHAR(10),          -- 'LT','GT','EQ','IN','BETWEEN'
  ValueMin     NVARCHAR(200),
  ValueMax     NVARCHAR(200),
  ValueList    NVARCHAR(MAX),         -- JSON array for IN operator
  IsRequired   BIT DEFAULT 1,
  CreatedAt    DATETIME2 DEFAULT GETDATE()
);
```

---

### Table 5 — DocumentChecklist

Required documents per application with audit tracking and re-upload cycle.

```sql
CREATE TABLE DocumentChecklist (
  ChecklistID     INT IDENTITY(1,1) PRIMARY KEY,
  ApplicationID   INT NOT NULL REFERENCES Applications(ApplicationID),
  DocumentType    NVARCHAR(50) NOT NULL
                  CHECK (DocumentType IN ('Aadhar','PAN','IncomeCertificate',
                                          'CasteCertificate','EducationProof',
                                          'BankProof','PhotoID','Other')),
  FileURL         NVARCHAR(500),
  UploadedAt      DATETIME2,
  ReviewedBy      INT REFERENCES Users(UserID),
  ReviewedAt      DATETIME2,
  Status          NVARCHAR(20) DEFAULT 'Pending'
                  CHECK (Status IN ('Pending','Uploaded','Verified',
                                    'Rejected','ReUploadRequested')),
  RejectionReason NVARCHAR(500),
  ReUploadCount   INT DEFAULT 0,
  CreatedAt       DATETIME2 DEFAULT GETDATE()
);
```

> `ReUploadCount` tracks how many times a doc was rejected. `RejectionReason` shown to student so they know exactly what to fix.

---

### Table 6 — BackgroundChecks

Structured verification results per application.

```sql
CREATE TABLE BackgroundChecks (
  CheckID       INT IDENTITY(1,1) PRIMARY KEY,
  ApplicationID INT NOT NULL REFERENCES Applications(ApplicationID),
  OfficerID     INT NOT NULL REFERENCES Users(UserID),
  CheckType     NVARCHAR(50),   -- 'Identity','Address','IncomeVerification'
  Result        NVARCHAR(20)
                CHECK (Result IN ('Pass','Fail','Inconclusive','Pending')),
  Notes         NVARCHAR(MAX),
  EvidenceURL   NVARCHAR(500),
  CompletedAt   DATETIME2,
  CreatedAt     DATETIME2 DEFAULT GETDATE()
);
```

---

### Tables 7–12 — Quick Reference

| Table | Key Columns |
|---|---|
| **Scholarships** | ScholarshipID, Name, SponsorID, TotalBudget, PerStudentAmount, ApplicationWindow (open/close), Status, MaxApplicants |
| **Institutions** | InstitutionID, Name, Type (School/College/University), District, State, BankAccountNo, BankIFSC, IsVerified |
| **Sponsors** | SponsorID, SponsorName, ContactPerson, Email, TotalFund, FundAllocated, FundUtilized, ApprovalPolicy (Auto/Manual), Status |
| **Payments** | PaymentID, ApplicationID, StudentID or InstitutionID, SponsorID, Amount, PaymentType (Direct/Institution), Status, ReferenceNo, MakerID, CheckerID |
| **AuditLogs** | LogID, UserID, Action, EntityType, EntityID, OldValue (JSON), NewValue (JSON), IPAddress, CreatedAt |
| **Notifications** | NotificationID, UserID, Type, Channel (Email/SMS/InApp), Message, IsSent, SentAt, RetryCount, CreatedAt |

---

## Chapter 4 — Eligibility Configuration & Auto-Matching Engine

### How Admin Configures Rules

Admin creates per-scholarship eligibility rules via UI — no code change needed.

**Example rules for one scholarship:**

| Rule | Type | Operator | Value |
|---|---|---|---|
| Family income below 3 lakhs | MaxAnnualIncome | LT | 300000 |
| Reserved category only | Category | IN | ["SC","ST","OBC"] |
| Geography filter | State | EQ | Maharashtra |
| Course filter | Course | IN | ["Engineering","Medicine","Law"] |
| Age band | MinAge / MaxAge | BETWEEN | 17 – 25 |

---

### Auto-Matching Engine Logic (Node.js)

```js
// autoMatcher.js — runs when student submits profile
async function matchStudentToScholarships(studentID) {
  const student = await getStudentProfile(studentID);
  const scholarships = await getActiveScholarships();

  for (const scholarship of scholarships) {
    const rules = await getEligibilityRules(scholarship.ScholarshipID);
    let eligible = true;
    let failReasons = [];

    for (const rule of rules) {
      const passed = evaluateRule(student, rule);
      if (!passed) {
        eligible = false;
        failReasons.push(rule.RuleType + ': criteria not met');
      }
    }

    if (eligible) {
      await createApplication(studentID, scholarship.ScholarshipID);
      // Application Status = 'AutoMatched'
    } else {
      await logIneligibility(studentID, scholarship.ScholarshipID, failReasons);
      // Reasons shown on student dashboard
    }
  }
}
```

---

## Chapter 5 — Document Audit & Re-Upload Loop

### Flow Diagram

```
Reviewer         Doc           Student         System
Opens       ──►  Rejected  ──►  Notified   ──►  Status =
Checklist        (with           (Email +        ReUploadRequested
                  reason)        SMS, 7-day       + ReUploadCount++
                                 deadline)
                                    │
                              Student logs in,
                              sees reason,
                              uploads new file
                                    │
                              Status = Pending
                              Reviewer notified ──► Cycle repeats
                                    │
                              All docs Verified?
                                    │
                                   YES
                                    │
                              Status = DocAuditComplete
                              → Move to Background Check
```

---

### Step-by-Step Process

| Step | Action | Detail |
|---|---|---|
| 1 | Reviewer opens checklist | Sees all docs: Pending / Uploaded / Verified / Rejected / ReUploadRequested |
| 2 | Review each document | Check clarity, correctness, validity (not expired, correct format) |
| 3 | Verify or Reject | Verify → mark Verified. Reject → mandatory rejection reason required |
| 4 | Student notified | Email + SMS with exact reason + 7-day re-upload deadline |
| 5 | Student re-uploads | Logs in, sees flagged doc with reason, uploads corrected version |
| 6 | Audit resumes | Status → Pending. Reviewer notified. `ReUploadCount` incremented |
| 7 | Audit complete | ALL docs Verified → status auto-updates to `DocAuditComplete` |

---

## Chapter 6 — Background Check Module

### Workflow

```
DocAuditComplete
      │
      ▼
Assigned to BG Officer ──────────────────────────────────┐
(system auto-assigns OR admin manually assigns)          │
      │                                                  │
      ▼                                                  │
Conduct Verification                                     │
(Identity / Address / Income — per CheckType)            │
      │                                                  │
      ▼                                                  │
Record Result per check type                             │
(Pass / Fail / Inconclusive + EvidenceURL)               │
      │                                                  │
   ┌──┴────────────────┐                                 │
  Pass              Fail / Inconclusive                  │
   │                    │                                │
   ▼                    ▼                                │
BGCheckComplete   Routed to Screening             Escalate to Admin ◄─┘
   │              Officer with mandatory                 (Inconclusive)
   ▼              notes — system does NOT
Screening         auto-reject
Pending
```

### Key Rules

- BG Officer is a **separate role** from Doc Reviewer — separation of duties enforced
- Each application can have **multiple check records** (one per CheckType)
- `Fail` result requires mandatory `Notes` — cannot submit without it
- `Inconclusive` → officer can request more time or escalate to admin

---

> **Continue in PART 2** → Screening, CSR Approval, Disbursement, Dashboards, UI, APIs, Tech Stack

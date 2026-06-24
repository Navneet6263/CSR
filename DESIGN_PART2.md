# CSR Scholarship Management System — Design Document
## Part 2 of 2: Approval, Disbursement, Dashboards & Tech Stack

> **For AI Agents — Read This First**
> This is Part 2 of 2. You MUST read PART 1 first before this file.
> Part 1 covers: System Overview → Workflow → Database → Eligibility Engine → Document Audit → Background Check
> Part 2 covers: Screening & CSR Approval → Disbursement → Dashboards → UI Design → Compliance → SLA → Notifications → APIs → Tech Stack

---

## Index

```
PART 2
├── Chapter 7  — Screening Decision & CSR Partner Approval
├── Chapter 8  — Fund Disbursement (Student & Institution)
├── Chapter 9  — Dashboard Design (5 Role-Based Views)
├── Chapter 10 — UI Design (Screen by Screen)
├── Chapter 11 — Separation of Duties & Compliance
├── Chapter 12 — SLA Reporting & Audit Export
├── Chapter 13 — Notification System
├── Chapter 14 — API Design Overview (35+ Endpoints)
├── Chapter 15 — Tech Stack & Deployment
└── Chapter 16 — Knex Migration Guidelines (SQL Server)
```

---

## Chapter 7 — Screening Decision & CSR Partner Approval

### Screening Decision

```
Input: DocAuditComplete + BGCheckComplete results
Who:   Screening Officer
Rule:  CANNOT be the same person as AssignedDocReviewer on this case

         Screening Officer Reviews
                   │
         ┌─────────┴──────────┐
    Approved               Rejected
         │                    │
  Status =              Status = ScreeningRejected
  ScreeningApproved      Student notified with reason
         │                    Case closed
  → CSR Partner          (appeal path: future phase)
    Approval
```

---

### CSR Partner Approval Workflow

```
Admin creates Shortlist
(ScreeningApproved applications for specific sponsor)
         │
         ▼
Shortlist locked → Sent to CSR Partner
(Email with dashboard link)
         │
         ▼
Partner reviews each student:
Name | College | Amount | Eligibility Summary | Doc Status
(Bank details NOT visible — data privacy)
         │
    ┌────┼────────────┐
    │              │             │
 Approve        Decline        Defer
    │              │             │
 Status =      Status =      SLA clock
 CSRApproved   CSRDeclined   tracks time
    │              │
 Payment       Admin can
 Queue         re-pool student
               for alternate
               scholarship
```

| Action | Status Change | Next Step |
|---|---|---|
| Approve | `CSRApproved` | Student enters payment queue |
| Decline | `CSRDeclined` | Admin can re-pool for alternate scholarship |
| Defer | Stays `CSRPending` | SLA clock running; partner reviews later |

---

## Chapter 8 — Fund Disbursement

### Two Disbursement Modes

```
CSR Sponsor (e.g. ITC)
        │
        ▼
Platform Fund Pool
        │
   ┌────┴─────────────────┐
   │                      │
   ▼                      ▼
Direct to Student    To Institution
(Student BankAccountNo   (Institutions.BankAccountNo
 + BankIFSC from         + BankIFSC from
 Students table)         Institutions table)

Used when:               Used when:
Student is primary       Tuition fee paid directly
beneficiary              to school/college
                         Student does NOT receive cash
```

---

### Maker-Checker Payment Workflow

```
Step 1 — Maker Initiates
Finance Officer (Maker) selects CSRApproved applications
Sets: PaymentType (Direct/Institution) + verifies amount
Submits for approval
        │
        ▼
Step 2 — Checker Reviews
Second Finance Officer (CANNOT be same as Maker)
Reviews payment batch — Approve or Return
        │
        ▼
Step 3 — Checker Approves
Status → PaymentInitiated
Bank transfer file generated
        │
        ▼
Step 4 — Bank Transfer
Finance team executes via banking system
Uploads confirmation + transaction reference
        │
        ▼
Step 5 — Status Updated
Status → PaymentCompleted
ReferenceNo recorded
Receipt auto-generated
        │
        ▼
Step 6 — Student Notified
Email + SMS: amount, bank transfer date, reference number
```

**Failure Handling:** If transfer fails → status stays `Initiated` → Finance officer corrects details and retries → all retries logged in AuditLogs.

---

## Chapter 9 — Dashboard Design (5 Role-Based Views)

### Student Dashboard

```
┌─────────────────────────────────────────────────────┐
│ Application Status Timeline                          │
│  [Registered] → [Docs Uploaded] → [Doc Audit] →    │
│  [BG Check] → [Screening] → [CSR Approval] → [Paid]│
├─────────────────────────────────────────────────────┤
│ Document Checklist                                   │
│  Aadhar: ✅ Verified | Income Cert: ❌ Rejected     │
│  → Re-upload Prompt with rejection reason + deadline│
├─────────────────────────────────────────────────────┤
│ Matched Scholarships | Messages | Payment Status    │
└─────────────────────────────────────────────────────┘
```

| Widget | Description |
|---|---|
| Application Status Timeline | Visual step indicator — current stage highlighted |
| Document Checklist | Each doc: Pending / Uploaded / Verified / Rejected with reason |
| Re-upload Prompt | Flagged docs shown with rejection reason and deadline |
| Matched Scholarships | Scholarships auto-matched to profile |
| Messages & Clarifications | Reviewer requests with response deadline |
| Payment Status | Amount, bank reference, date (after disbursement) |

---

### Agent Dashboard

| Widget | Description |
|---|---|
| My Students Summary | Registered / Submitted / Approved / Rejected counts |
| Student List Table | All students via agent code with current status |
| Bulk Registration | Upload CSV to register multiple students at once |
| Approval Rate KPI | % of agent's students getting approved |
| Commission Tracker | Commission earned per approved scholarship |
| Pending Follow-ups | Students with incomplete applications |

---

### Admin Console Dashboard

```
Funnel Overview:
Registered → Applied → AutoMatched → DocAuditComplete
→ BGCheckComplete → ScreeningApproved → CSRApproved → Funded
(drop-off count shown at each arrow)
```

| Widget | Description |
|---|---|
| Funnel Overview | Total at each stage + drop-off counts |
| Stage Bottlenecks | Which stage has most stuck applications + how long |
| Eligibility Configuration | Add/edit/delete scholarship rules without code |
| CSR Partner Management | Create shortlists, track partner response times |
| Override Controls | Override any stage decision with logged mandatory reason |
| SLA Violations | Applications past SLA threshold highlighted in red |
| Audit Log Viewer | Searchable log of every action in the system |

---

### CSR Partner Dashboard

| Widget | Description |
|---|---|
| Fund Overview | Total provided / allocated / utilized / remaining (progress bars) |
| Shortlist Review | Students pending approval with eligibility summary |
| Beneficiary List | Students approved and funded from their pool |
| Fund Distribution | Breakdown by region, institution type (pie chart) |
| Disbursement Timeline | Line chart of payments over time |
| Audit Export | Download full audit report per beneficiary for CSR compliance |

---

### Finance Dashboard

| Widget | Description |
|---|---|
| Payment Queue | All `CSRApproved` applications ready for disbursement |
| Maker Actions | Select students, set payment type, submit for checker |
| Checker Review | Approve or return payment batches |
| Payment History | All transactions with status + reference numbers |
| Failed Payments | Failed transfers with retry option |
| Reconciliation Report | Match payments to bank statements |

---

## Chapter 10 — UI Design (Screen by Screen)

### Design System

| Element | Value | Reason |
|---|---|---|
| Primary Color | `#5b2c6f` (Purple) | Trust, education, professionalism |
| Accent | `#2e86c1` (Blue) | CTAs, interactive, info links |
| Success | `#0e6251` (Teal) | Verified, approved, completed |
| Warning | `#f39c12` (Gold) | Pending review, SLA warning |
| Danger | `#c0392b` (Red) | Rejected, failed, overdue |
| Font | Inter / Geist Sans | Clean, readable at all sizes |
| Card Radius | 8px | Professional |
| Sidebar | 280px fixed | Room for labels + icons |

---

### Login Screen

```
┌──────────────────────────────┐
│   [Logo] CSR Scholarship     │  ← Purple gradient background
│         System               │
│                              │
│  Email: [________________]   │
│  Password: [_____________]   │
│                              │
│  [Login]  [Student Register] │
│  Agent Login link            │
└──────────────────────────────┘
After login → redirect to role-specific dashboard
```

---

### Student — Multi-Step Application Form

```
[Step 1] ──── [Step 2] ──── [Step 3] ──── [Step 4] ──── [Step 5]
Personal      Education    Family         Bank           Documents
Details       Details      Income         Details        Upload
                             │
                        Live eligibility
                        preview shown here
                        based on active rules

Final: Full summary → [Submit Application] → Success screen + Application ID
```

| Step | Fields |
|---|---|
| Step 1 — Personal | Name, DOB, Gender, Category, Address |
| Step 2 — Education | Course (autocomplete), Institution (from DB), Enrollment year |
| Step 3 — Family Income | Annual income. Live eligibility preview shown based on rules |
| Step 4 — Bank Details | Account no + IFSC + re-enter confirmation. Auto-validates IFSC |
| Step 5 — Documents | Drag-drop upload per document type. Progress per file |

---

### Document Audit Screen (Reviewer)

```
┌──────────────────┬─────────────────────────────────┐
│ Application Card │ Checklist Grid                  │
│ Student name     │ [Aadhar ✅] [PAN ⏳] [Income ❌]│
│ Applied date     │                                 │
│ Scholarship      │ Click doc → Full-screen preview │
│ Urgency badge    │ [Verify] [Reject: reason input] │
└──────────────────┴─────────────────────────────────┘
Top: Progress bar — X of Y documents verified
Auto-email preview shown before confirming rejection
```

---

### Background Check Screen

```
┌─────────────────────────────────────────────────┐
│ Check Type     │ Result          │ Evidence      │
│ Identity       │ [Pass▼]         │ [Upload]      │
│ Address        │ [Inconclusive▼] │ [Upload]      │
│ Income Verif.  │ [Fail▼]         │ [Upload]      │
│                │ Notes: [required on Fail]        │
│                                                   │
│ [Submit Results] ← enabled only when all filled  │
│                                                   │
│ Fail path: Warning modal                         │
│ "This will route case for rejection. Confirm?"   │
└─────────────────────────────────────────────────┘
```

---

### CSR Partner — Approval Screen

```
┌──────────────────────────────────────────────────────┐
│ [Select All] [Approve All] [Decline Selected]        │
├───────────┬──────────┬────────┬──────────────────────┤
│ Student   │ College  │ Amount │ Eligibility | DocStatus│
├───────────┴──────────┴────────┴──────────────────────┤
│ Click row → Side panel: eligibility summary,        │
│ college details, doc checklist status               │
│ NO bank details shown (privacy)                     │
│ Comment box per decision. Full audit trail.         │
└──────────────────────────────────────────────────────┘
```

---

## Chapter 11 — Separation of Duties & Compliance

### Enforcement Rules

```
Rule 1 — Doc Reviewer vs Screening Officer
When assigning Screener to a case:
System checks AssignedDocReviewer on that application
→ BLOCKS same user from being AssignedScreener

Rule 2 — Payment Maker vs Checker
Finance Checker who approves a batch
→ CANNOT be same user who initiated (Maker) that batch
→ Enforced in payment submission API

Rule 3 — Admin Override
Admin CAN override any stage but MUST log mandatory reason
→ Override actions highlighted in AuditLogs
→ Visible to CSR Partner in audit export

Rule 4 — CSR Partner Scope
Partner sees aggregated data only
→ CANNOT see individual student bank details
→ CANNOT access admin configuration screens
```

---

### Audit Logging

Every key action written to `AuditLogs`:

| Field | Content |
|---|---|
| UserID | Who performed the action |
| Action | What was done (e.g. `DOC_REJECTED`, `PAYMENT_APPROVED`) |
| EntityType | Which table was affected |
| EntityID | Which record ID |
| OldValue | JSON snapshot before change |
| NewValue | JSON snapshot after change |
| IPAddress | From where |
| CreatedAt | Exact timestamp |

---

## Chapter 12 — SLA Reporting & Audit Export

### SLA Reports Available

| Report | Description |
|---|---|
| Funnel Report | Registered → Applied → AutoMatched → DocAuditComplete → BGCheckComplete → ScreeningApproved → CSRApproved → Funded. Drop-off at each stage |
| Stage Turnaround | Avg / min / max days per stage. SLA target (configurable). % within SLA. Broken down by reviewer, team, region |
| Reviewer Performance | Applications handled, avg review time, approval rate, SLA compliance rate |
| Bottleneck Alert | Flags applications stuck at same stage > SLA_THRESHOLD days. Admin gets daily digest |
| Disbursement Reconciliation | All payments: AppID, student, amount, date, bank reference, payment type. Exportable |
| Diversity Coverage | Beneficiaries by Category (SC/ST/OBC/General), State, income band, institution type — privacy-aggregated, no PII |

---

### Audit Export for CSR Partner

Downloadable as **CSV + PDF** — auto-generated per sponsor.

**Per beneficiary, the export contains:**

```
Student name | College | Category | Scholarship Amount | Payment Date | Reference No
Eligibility evidence: which rules met + proof (e.g. income cert verified by Officer X on Date Y)
Document verification: each doc, verified by whom, on what date
Background check: result, officer, date
Screening decision: officer, date, notes
CSR partner approval: which partner representative, date
```

---

## Chapter 13 — Notification System

| Trigger | When | Channel | Recipient | Message |
|---|---|---|---|---|
| Account Created | On registration | Email | Student | Welcome + login link + application guide |
| Application Submitted | On submit | Email + In-App | Student | Confirms submission. Shows application ID |
| Doc Rejected | On doc rejection | Email + SMS | Student | Which doc, exact reason, re-upload deadline (7 days) |
| All Docs Verified | Audit complete | In-App | Student | Documents verified. Moving to background check |
| BG Check Done | Check complete | In-App | Student | Verification done. Moving to screening |
| Screening Approved | Approved | Email | Student | Shortlisted for scholarship. Awaiting sponsor approval |
| Screening Rejected | Rejected | Email | Student | Application declined with reason |
| CSR Partner Approved | Partner approves | Email + SMS | Student | Scholarship confirmed! Payment in process |
| Payment Completed | After transfer | Email + SMS | Student | Amount, bank reference, date |
| SLA Alert | Past SLA threshold | Email | Admin | X applications stuck at Y stage for Z days |
| Shortlist Ready | Admin creates shortlist | Email | CSR Partner | Shortlist link with count of students pending approval |
| New Assignment | Case assigned | Email + In-App | Reviewer / Officer | Application link, deadline, student summary |

> Total: **12 notification events** covering all lifecycle stages.

---

## Chapter 14 — API Design Overview

> **Base URL:** `/api/v1/`
> **Auth:** JWT Bearer Token on ALL endpoints
> **Rate Limit:** 100 req/min per user
> **Response Format:** `{ success, data, message }`

---

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register student or agent |
| POST | `/auth/login` | Login — returns JWT token |
| POST | `/auth/forgot-password` | Send OTP reset email/SMS |

---

### Students & Profile

| Method | Endpoint | Description |
|---|---|---|
| GET | `/students/me` | Get own profile |
| PUT | `/students/me` | Update profile details |
| GET | `/students/:id/eligibility` | Check eligibility against all active scholarships |

---

### Applications

| Method | Endpoint | Description |
|---|---|---|
| POST | `/applications` | Create draft application |
| POST | `/applications/:id/submit` | Submit for review |
| GET | `/applications/:id` | Get full application with all stage statuses |
| GET | `/applications/my` | Student's own applications |
| GET | `/applications` | Admin: list all with filters |

---

### Document Audit

| Method | Endpoint | Description |
|---|---|---|
| POST | `/documents/upload` | Upload document to checklist item |
| PATCH | `/documents/:id/verify` | Mark document verified |
| PATCH | `/documents/:id/reject` | Reject with reason — triggers student notification |

---

### Background Check

| Method | Endpoint | Description |
|---|---|---|
| POST | `/bgchecks` | Record background check result |
| GET | `/bgchecks/:applicationId` | Get all checks for an application |

---

### Screening & CSR

| Method | Endpoint | Description |
|---|---|---|
| POST | `/screening/:id/approve` | Screening Officer approves application |
| POST | `/screening/:id/reject` | Screening Officer rejects with reason |
| POST | `/csr/shortlists` | Admin creates shortlist for CSR partner |
| POST | `/csr/:id/approve` | CSR Partner approves student |
| POST | `/csr/:id/decline` | CSR Partner declines student |

---

### Disbursement

| Method | Endpoint | Description |
|---|---|---|
| POST | `/payments/initiate` | Finance Maker submits payment batch |
| POST | `/payments/:id/approve` | Finance Checker approves batch |
| POST | `/payments/:id/confirm` | Upload bank confirmation + reference number |
| GET | `/payments` | List all payments with filters |

---

### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/funnel` | Stage-by-stage funnel counts |
| GET | `/reports/sla` | SLA/turnaround per stage and reviewer |
| GET | `/reports/disbursement` | Payment history and reconciliation |
| GET | `/reports/diversity` | Coverage by category, region, income band |
| GET | `/reports/audit-export` | Full audit report per beneficiary (sponsor use) |

> **Total: 35+ REST endpoints** covering every module.

---

## Chapter 15 — Tech Stack & Deployment

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 + Tailwind CSS | SSR, fast, production-ready, mobile-responsive |
| UI Components | shadcn/ui + Lucide Icons | Professional, accessible, consistent design |
| Charts | Recharts + Chart.js | Flexible React-native charts for dashboards |
| Backend | Node.js + Express.js | Fast async runtime, huge ecosystem |
| Database | Microsoft SQL Server | Enterprise ACID, perfect for multi-role transactions |
| Query Builder | Knex.js | Full SQL control, SQL Server compatible |
| Auth | JWT + bcrypt | Stateless auth, secure password hashing |
| File Upload | Multer + AWS S3 | Scalable secure document storage |
| Email | Nodemailer + SendGrid | Reliable delivery with HTML templates |
| SMS | Twilio / MSG91 | India-friendly SMS gateway |
| Background Jobs | Bull Queue + Redis | Async auto-matching, notification queues |
| Validation | Joi + Zod | Input validation, type safety on all APIs |
| Monitoring | Sentry + Datadog | Error tracking, performance, uptime alerts |
| Deployment | Vercel (FE) + Render/AWS (BE) | Zero-config CI/CD, scalable cloud hosting |

---

### Deployment Architecture

```
User Browser
     │
     ▼
Vercel (Next.js Frontend)
     │ API calls (/api/v1/*)
     ▼
Render / AWS EC2 (Node.js + Express Backend)
     │              │              │
     ▼              ▼              ▼
SQL Server      Redis          AWS S3
(Main DB)    (Bull Queue)   (Documents)
                  │
                  ▼
          Background Jobs:
          - Auto-matching engine
          - Notification dispatcher
          - SLA alert scheduler
```

---

---

## Chapter 16 — Knex Migration Guidelines (SQL Server)

> **For AI Agents:** Migration files banane se PEHLE ye poora chapter padho. Galat types use karne se SQL Server silently wrong schema bana deta hai.

---

### Rule 1 — Primary Key / Auto-Increment

```js
// ✅ Knex mein likho — SQL Server mein INT IDENTITY(1,1) ban jayega
table.increments('id');

// ❌ Mat karo
table.integer('id').primary();  // IDENTITY nahi banega
```

---

### Rule 2 — NVARCHAR(MAX) / Long Text Columns

Jab bhi `Notes`, `OldValue`, `NewValue`, `ValueList`, `Message` jaisi fields hon:

```js
// ✅ Sahi — NVARCHAR(MAX) banega SQL Server mein
table.specificType('Notes', 'NVARCHAR(MAX)');
table.specificType('OldValue', 'NVARCHAR(MAX)');
table.specificType('ValueList', 'NVARCHAR(MAX)');

// ⚠️ Ye bhi kaam karta hai but less explicit
table.text('Notes');

// ❌ Galat — SQL Server mein VARCHAR(255) ban jayega
table.string('Notes');           // length limit ho jaayegi
table.string('Notes', 'MAX');   // Knex ye parse nahi karta
```

---

### Rule 3 — Indexes (Migration file mein hi likhna)

Indexes baad mein alag migration se add karna avoid karo — table create karte waqt hi likho:

```js
exports.up = function(knex) {
  return knex.schema.createTable('Applications', (table) => {
    table.increments('id');
    table.integer('ScholarshipID').notNullable();
    table.string('Status', 40).defaultTo('Draft');
    table.integer('StudentID').notNullable();
    table.datetime2('CreatedAt').defaultTo(knex.fn.now());

    // ✅ Indexes inline — table create hote hi ban jaate hain
    table.index(['ScholarshipID', 'Status']);  // filtering ke liye
    table.index(['StudentID']);                // student ke applications fetch karne ke liye
  });
};
```

---

### Rule 4 — Unique Constraints

```js
// Users table mein
table.string('Email', 200).notNullable();
table.unique(['Email']);        // ✅ duplicate email block karega

table.string('AgentCode', 20);
table.unique(['AgentCode']);    // ✅ agent code duplicate nahi hoga
```

---

### Rule 5 — DATETIME2 (SQL Server specific)

```js
// ✅ SQL Server ke liye
table.specificType('CreatedAt', 'DATETIME2').defaultTo(knex.fn.now());
table.specificType('UpdatedAt', 'DATETIME2').defaultTo(knex.fn.now());

// ⚠️ table.timestamp() kaam karta hai but DATETIME2 prefer karo SQL Server mein
```

---

### Rule 6 — DECIMAL columns

```js
// ✅ Sahi
table.decimal('AnnualFamilyIncome', 15, 2);
table.decimal('ScholarshipAmount', 10, 2);
table.decimal('TotalBudget', 15, 2);

// ❌ Galat — precision loss hoga
table.float('AnnualFamilyIncome');
```

---

### Table-wise Index Reference

| Table | Index Columns | Type | Reason |
|---|---|---|---|
| Users | `Email` | unique | Login lookup |
| Users | `AgentCode` | unique | Agent identification |
| Students | `UserID` | index | Profile fetch |
| Applications | `ScholarshipID`, `Status` | index | Dashboard filters |
| Applications | `StudentID` | index | Student's own apps |
| EligibilityRules | `ScholarshipID` | index | Auto-match engine reads this |
| DocumentChecklist | `ApplicationID` | index | Checklist load per application |
| BackgroundChecks | `ApplicationID` | index | BG results per application |
| Payments | `ApplicationID` | index | Payment status lookup |
| AuditLogs | `EntityType`, `EntityID` | index | Audit viewer search |
| Notifications | `UserID`, `IsSent` | index | Pending notification queue |

> **Detail mein:** `backend/MIGRATION_GUIDE.md` dekho — har table ka complete migration template wahan hai.

---

## Document Summary

This 2-part document covers the complete technical design of the CSR Scholarship Management System:

| Area | Detail |
|---|---|
| Database | 12 SQL Server tables with full schema |
| User Roles | 8 distinct roles with separation of duties enforcement |
| Lifecycle | 8-stage end-to-end flow with 18 application status values |
| Auto-Matching | Runtime eligibility engine — admin-configurable, no code change |
| Document Audit | Re-upload loop with `ReUploadCount` tracking |
| Background Check | Structured per-check-type verification with evidence upload |
| Screening & Approval | Separation of duties + CSR partner Approve/Decline/Defer |
| Disbursement | Two modes (Direct/Institution) + Maker-Checker workflow |
| Dashboards | 5 role-based views with role-specific widgets |
| Compliance | Audit logging on every action, separation of duties enforced at DB + API layer |
| SLA Reporting | Bottleneck detection + CSR audit export (CSV + PDF) |
| Notifications | 12 events across Email / SMS / In-App |
| APIs | 35+ REST endpoints, JWT auth, rate-limited |
| Tech Stack | Next.js + Node.js + SQL Server + Redis + AWS S3 |

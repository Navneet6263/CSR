# Knex Migration Guide — SQL Server
## CSR Scholarship Management System

> **For AI Agents:** Migration file likhne se PEHLE ye file padho.
> Full design context ke liye: `DESIGN_PART1.md` (Ch. 3) aur `DESIGN_PART2.md` (Ch. 16) dekho.

---

## Index

```
├── Rule 1  — Primary Key / Auto-Increment
├── Rule 2  — NVARCHAR(MAX) columns
├── Rule 3  — Indexes (inline likhna)
├── Rule 4  — Unique Constraints
├── Rule 5  — DATETIME2
├── Rule 6  — DECIMAL
├── Table Index Reference (sabke liye)
└── Migration File Order (dependency sequence)
```

---

## Rule 1 — Primary Key

```js
table.increments('id');  // → INT IDENTITY(1,1) PRIMARY KEY
```

---

## Rule 2 — Long Text / NVARCHAR(MAX)

```js
// ✅ Sahi
table.specificType('Notes', 'NVARCHAR(MAX)');
table.specificType('OldValue', 'NVARCHAR(MAX)');
table.specificType('ValueList', 'NVARCHAR(MAX)');
table.text('Notes');                  // ⚠️ kaam karta hai, less explicit

// ❌ Galat — VARCHAR(255) ban jayega
table.string('Notes');
table.string('Notes', 'MAX');         // Knex parse nahi karta
```

Affected columns: `Notes`, `OldValue`, `NewValue`, `ValueList`, `Message`, `Address`, `Description`

---

## Rule 3 — Indexes (table create karte waqt hi likho)

```js
// ✅ Inline — same migration mein
table.index(['ScholarshipID', 'Status']);
table.index(['StudentID']);

// ❌ Baad mein alag migration — avoid karo jab tak zarurat na ho
```

---

## Rule 4 — Unique Constraints

```js
table.unique(['Email']);
table.unique(['AgentCode']);
```

---

## Rule 5 — DATETIME2

```js
// ✅ SQL Server preferred
table.specificType('CreatedAt', 'DATETIME2').defaultTo(knex.fn.now());
table.specificType('UpdatedAt', 'DATETIME2').defaultTo(knex.fn.now());
```

---

## Rule 6 — DECIMAL

```js
// ✅ Sahi — precision loss nahi hoga
table.decimal('AnnualFamilyIncome', 15, 2);
table.decimal('ScholarshipAmount', 10, 2);

// ❌ Galat
table.float('AnnualFamilyIncome');
```

---

## Table Index Reference

| Table | Column(s) | Type | Reason |
|---|---|---|---|
| Users | `Email` | unique | Login lookup |
| Users | `AgentCode` | unique | Agent identification |
| Students | `UserID` | index | Profile fetch |
| Applications | `ScholarshipID`, `Status` | index | Dashboard filters |
| Applications | `StudentID` | index | Student's own apps |
| EligibilityRules | `ScholarshipID` | index | Auto-match engine |
| DocumentChecklist | `ApplicationID` | index | Checklist load |
| BackgroundChecks | `ApplicationID` | index | BG results fetch |
| Payments | `ApplicationID` | index | Payment lookup |
| AuditLogs | `EntityType`, `EntityID` | index | Audit search |
| Notifications | `UserID`, `IsSent` | index | Pending queue |

---

## Migration File Order (Dependency Sequence)

Dependencies ki wajah se is order mein banao — foreign keys baad waale tables mein hain:

```
1.  001_create_sponsors
2.  002_create_institutions
3.  003_create_users          ← depends on sponsors
4.  004_create_agents         ← depends on users
5.  005_create_students       ← depends on users, institutions
6.  006_create_scholarships   ← depends on sponsors
7.  007_create_eligibility_rules ← depends on scholarships
8.  008_create_applications   ← depends on students, agents, scholarships, users, sponsors
9.  009_create_document_checklist ← depends on applications, users
10. 010_create_background_checks  ← depends on applications, users
11. 011_create_payments       ← depends on applications, students, institutions, sponsors, users
12. 012_create_audit_logs     ← depends on users
13. 013_create_notifications  ← depends on users
```

> `knex migrate:latest` is order mein files run karega — timestamp prefix use karo filenames mein (e.g. `20240101000001_create_sponsors.ts`)

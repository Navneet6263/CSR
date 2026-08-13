# Clean database bootstrap

This creates a clean SQL Server database, applies every versioned table/index migration, and creates only the initial Admin user. Do not run demo seed commands.

## 1. Create the empty database

Run `backend/scripts/create-database.sql` while connected to SQL Server as an account allowed to create databases. If the provider creates databases from its panel, create `ShikshavrittiDB` there instead.

## 2. Point the backend to it

Set these values in `backend/.env`:

```env
DB_HOST=your-sql-host
DB_PORT=1433
DB_NAME=ShikshavrittiDB
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_ENCRYPT=true
DB_TRUST_SERVER_CERT=false
```

## 3. Create all tables, columns, constraints, and indexes

```bash
cd /home/ubuntu/shikshavritti/backend
npm ci
npm run build
npm run migrate
npm run migrate:status
```

Do not run `npm run seed`, `seed-data.ts`, `seed-documents.ts`, or `seed_scholarships.ts`. Those contain development/demo data.

## 4. Create the only initial account

The password must contain at least 10 characters, uppercase, lowercase, a number, and a special character. It is bcrypt-hashed before insertion and the Admin must change it after the first login.

```bash
read -s -p "Initial Admin password: " BOOTSTRAP_ADMIN_PASSWORD
echo
export BOOTSTRAP_ADMIN_PASSWORD
export BOOTSTRAP_ADMIN_EMAIL='Navneet.kumar@greencall.co.in'
export BOOTSTRAP_ADMIN_NAME='Navneet Kumar'
npm run bootstrap:admin
unset BOOTSTRAP_ADMIN_PASSWORD BOOTSTRAP_ADMIN_EMAIL BOOTSTRAP_ADMIN_NAME
```

The bootstrap refuses to run if `Users` already contains any record. Running it again is safe: an existing Admin is reported and its password is not overwritten.

## 5. Verify the clean database

```sql
USE [ShikshavrittiDB];

SELECT name AS TableName
FROM sys.tables
ORDER BY name;

SELECT UserID, FullName, Email, Role, IsActive, MustChangePassword, CreatedAt
FROM dbo.Users;

SELECT
  (SELECT COUNT(*) FROM dbo.Users) AS Users,
  (SELECT COUNT(*) FROM dbo.Students) AS Students,
  (SELECT COUNT(*) FROM dbo.Sponsors) AS Sponsors,
  (SELECT COUNT(*) FROM dbo.Scholarships) AS Scholarships,
  (SELECT COUNT(*) FROM dbo.Applications) AS Applications,
  (SELECT COUNT(*) FROM dbo.Payments) AS Payments;
```

Expected result: `Users = 1`; all listed business tables = `0`. Migration metadata and the initial Admin audit event are expected system records.

## User columns relevant to the initial Admin

`UserID`, `FullName`, `Email`, `Phone`, `PasswordHash`, `Role`, `AgentCode`, `SponsorID`, `FinanceFunction`, `IsActive`, `MustChangePassword`, `TokenVersion`, `CreatedAt`, and `UpdatedAt`.

No raw password column exists. `PasswordHash` contains bcrypt data only.

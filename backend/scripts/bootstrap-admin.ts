import bcrypt from 'bcrypt';
import db from '../src/config/database';
import { strongPassword } from '../src/validators/auth.validator';
import { writeAudit } from '../src/services/audit.service';

const email = (process.env.BOOTSTRAP_ADMIN_EMAIL ?? 'Navneet.kumar@greencall.co.in').trim().toLowerCase();
const fullName = (process.env.BOOTSTRAP_ADMIN_NAME ?? 'Navneet Kumar').trim();
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? '';

async function bootstrap() {
  if (!await db.schema.hasTable('Users')) throw new Error('Users table is missing. Run npm run migrate first.');
  if (!await db.schema.hasTable('AuditLogs')) throw new Error('AuditLogs table is missing. Complete all migrations first.');

  const existing = await db('Users').whereRaw('LOWER(Email) = ?', [email]).first();
  if (existing) {
    if (existing.Role !== 'Admin') throw new Error(`${email} exists but is not an Admin account.`);
    console.info(`Admin already exists: ${email} (UserID ${existing.UserID}). No password was changed.`);
    return;
  }

  const validation = strongPassword.safeParse(password);
  if (!validation.success) {
    const details = validation.error.issues.map((issue) => issue.message).join('; ');
    throw new Error(`BOOTSTRAP_ADMIN_PASSWORD is invalid: ${details}`);
  }
  const userCount = await db('Users').count<{ count: number | string }[]>({ count: '*' }).first();
  if (Number(userCount?.count ?? 0) !== 0) {
    throw new Error('Bootstrap stopped: Users is not empty. Create additional admins through an approved admin workflow.');
  }

  const user = await db.transaction(async (trx) => {
    const inserted = await trx('Users').insert({
      FullName: fullName, Email: email, Phone: null,
      PasswordHash: await bcrypt.hash(password, 12), Role: 'Admin', AgentCode: null,
      SponsorID: null, FinanceFunction: null, IsActive: true, MustChangePassword: true,
    }).returning(['UserID', 'FullName', 'Email', 'Role']);
    await writeAudit(trx, {
      userId: inserted[0].UserID, action: 'INITIAL_ADMIN_BOOTSTRAPPED', entityType: 'User',
      entityId: inserted[0].UserID, newValue: { email, role: 'Admin', mustChangePassword: true },
    });
    return inserted[0];
  });
  console.info(`Initial Admin created: ${user.Email} (UserID ${user.UserID}). Password change is required at first login.`);
}

bootstrap().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}).finally(() => db.destroy());

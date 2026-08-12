import nodemailer from 'nodemailer';
import { Knex } from 'knex';
import db from '../config/database';
import { config } from '../config/env';

interface ResetPayload { name: string; resetUrl: string }

export function queueEmail(trx: Knex.Transaction, recipient: string, template: string, payload: object) {
  return trx('EmailOutbox').insert({ RecipientEmail: recipient, TemplateName: template,
    PayloadJson: JSON.stringify(payload), Status: 'Pending', AvailableAt: new Date() });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);
}

function render(template: string, raw: string) {
  const payload = JSON.parse(raw) as ResetPayload;
  if (template !== 'PASSWORD_RESET') throw new Error('Unsupported email template.');
  const url = escapeHtml(payload.resetUrl); const name = escapeHtml(payload.name);
  return { subject: 'Reset your TalentBridge password',
    text: `Hello ${payload.name}, reset your password using this link: ${payload.resetUrl}. It expires in 30 minutes.`,
    html: `<p>Hello ${name},</p><p>Use the secure link below to reset your password. It expires in 30 minutes.</p><p><a href="${url}">Reset password</a></p><p>If you did not request this, ignore this email.</p>` };
}

async function claimBatch() {
  return db.transaction(async (trx) => {
    const rows = await trx.raw(`SELECT TOP (10) * FROM EmailOutbox WITH (UPDLOCK, READPAST, ROWLOCK)
      WHERE Status = 'Pending' AND AvailableAt <= SYSUTCDATETIME() ORDER BY EmailID`);
    const batch = Array.isArray(rows) ? rows : [];
    if (batch.length) await trx('EmailOutbox').whereIn('EmailID', batch.map((row) => row.EmailID))
      .update({ Status: 'Processing', UpdatedAt: new Date() });
    return batch as Array<Record<string, any>>;
  });
}

export async function processEmailOutbox() {
  if (!config.smtp.host || !config.smtp.user || !config.smtp.pass || !config.smtp.from) return;
  const transport = nodemailer.createTransport({ host: config.smtp.host, port: config.smtp.port,
    secure: config.smtp.secure, auth: { user: config.smtp.user, pass: config.smtp.pass },
    pool: true, maxConnections: 3, connectionTimeout: 10_000, socketTimeout: 20_000 });
  const batch = await claimBatch();
  for (const email of batch) {
    try {
      const body = render(email.TemplateName, email.PayloadJson);
      await transport.sendMail({ from: config.smtp.from, to: email.RecipientEmail, ...body });
      await db('EmailOutbox').where({ EmailID: email.EmailID }).update({ Status: 'Sent', SentAt: new Date(), UpdatedAt: new Date() });
    } catch (error) {
      const attempts = Number(email.Attempts ?? 0) + 1; const terminal = attempts >= 5;
      await db('EmailOutbox').where({ EmailID: email.EmailID }).update({ Status: terminal ? 'Failed' : 'Pending',
        Attempts: attempts, LastError: error instanceof Error ? error.message.slice(0, 1000) : 'Delivery failed',
        AvailableAt: new Date(Date.now() + Math.min(60, 2 ** attempts) * 60_000), UpdatedAt: new Date() });
    }
  }
  transport.close();
}

export function startEmailWorker() {
  if (!config.smtp.host) return undefined;
  let processing = false;
  const run = async () => {
    if (processing) return;
    processing = true;
    try { await processEmailOutbox(); }
    catch (error) { console.error('Email outbox error', error); }
    finally { processing = false; }
  };
  void run();
  const timer = setInterval(() => void run(), 10_000);
  timer.unref(); return timer;
}

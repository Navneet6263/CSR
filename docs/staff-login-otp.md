# Staff email OTP sign-in

Student accounts continue to use password login. Every non-student role must complete a second step using a six-digit OTP sent to the registered email address.

Security controls:

- no access or refresh session is issued before OTP verification;
- OTP is stored only as an HMAC-SHA256 hash;
- each code expires after 10 minutes and can be used once;
- five incorrect attempts lock the challenge;
- requesting a new OTP invalidates the previous challenge;
- resend is restricted to once per 60 seconds and auth endpoints are rate limited;
- successful staff OTP verification is written to the audit log.

Production requires working `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` values. The existing email-outbox worker delivers and retries OTP email jobs.

Deployment order:

```bash
cd /home/ubuntu/shikshavritti
git pull origin master

cd backend
npm ci
npm run migrate
npm run build
pm2 restart shikshavritti-backend --update-env

cd ../frontend
npm ci
NODE_OPTIONS="--max-old-space-size=1536" npm run build
pm2 restart shikshavritti-frontend --update-env
pm2 save
```

Confirm `024_staff_login_otp.ts` appears under completed migrations using `npm run migrate:status`.

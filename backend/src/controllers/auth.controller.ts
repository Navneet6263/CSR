import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import {
  loginUser, registerUser, revokeSession, rotateRefreshToken,
} from '../services/auth.service';
import { resendStaffOtp, verifyStaffOtp } from '../services/staffOtp.service';
import { clearSessionCookies, setSessionCookies } from '../services/authTokens.service';
import { sendSuccess } from '../utils/response';
import { AuthError } from '../utils/errors';
import db from '../config/database';
import { LoginInput, RegisterInput } from '../validators/auth.validator';
import { changePassword, requestPasswordReset, resetPassword } from '../services/password.service';
import { requestActor } from '../utils/requestActor';

function clientMeta(req: Request) {
  return { ipAddress: req.ip, userAgent: req.header('user-agent') };
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const meta = clientMeta(req);
    const result = await registerUser(req.body as RegisterInput, meta.ipAddress, meta.userAgent);
    setSessionCookies(res, result.tokens);
    sendSuccess(res, { user: result.user, csrfToken: result.tokens.csrfToken }, 'Account created.', 201);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body as LoginInput;
    const meta = clientMeta(req);
    const result = await loginUser(data.email, data.password, meta.ipAddress, meta.userAgent);
    if ('otpRequired' in result) { sendSuccess(res, result, 'OTP sent to your registered email.'); return; }
    setSessionCookies(res, result.tokens);
    sendSuccess(res, { user: result.user, csrfToken: result.tokens.csrfToken, otpRequired: false }, 'Login successful.');
  } catch (error) {
    next(error);
  }
}

export async function verifyLoginOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const meta = clientMeta(req); const result = await verifyStaffOtp(req.body.challengeId, req.body.code, meta.ipAddress, meta.userAgent);
    setSessionCookies(res, result.tokens);
    sendSuccess(res, { user: result.user, csrfToken: result.tokens.csrfToken, otpRequired: false }, 'OTP verified.');
  } catch (error) { next(error); }
}

export async function resendLoginOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { const meta = clientMeta(req); sendSuccess(res,
    await resendStaffOtp(req.body.challengeId, meta.ipAddress, meta.userAgent), 'A new OTP was sent.'); }
  catch (error) { next(error); }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[config.cookies.refresh];
    if (!token) throw new AuthError('Refresh session is missing.');
    const tokens = await rotateRefreshToken(token);
    setSessionCookies(res, tokens);
    sendSuccess(res, { csrfToken: tokens.csrfToken }, 'Session refreshed.');
  } catch (error) {
    clearSessionCookies(res);
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.user) await revokeSession(req.user.sessionId);
    clearSessionCookies(res);
    sendSuccess(res, null, 'Logged out.');
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await db('Users').select('UserID', 'FullName', 'Email', 'Phone', 'Role', 'SponsorID', 'FinanceFunction', 'MustChangePassword')
      .where({ UserID: req.user!.userId, IsActive: true }).first();
    if (!user) throw new AuthError('Session user is unavailable.');
    sendSuccess(res, { id: user.UserID, userId: user.UserID, fullName: user.FullName,
      email: user.Email, phone: user.Phone, role: user.Role, sponsorId: user.SponsorID,
      financeFunction: user.FinanceFunction,
      mustChangePassword: Boolean(user.MustChangePassword) }, 'Session is active.');
  } catch (error) { next(error); }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await requestPasswordReset(req.body.email, req.ip);
    sendSuccess(res, null, 'If the account exists, reset instructions will be sent.');
  } catch (error) { next(error); }
}

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { await resetPassword(req.body.token, req.body.newPassword); clearSessionCookies(res);
    sendSuccess(res, null, 'Password reset successfully. Sign in again.'); }
  catch (error) { next(error); }
}

export async function changePasswordHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { await changePassword(req.user!.userId, req.body.currentPassword, req.body.newPassword, requestActor(req));
    clearSessionCookies(res); sendSuccess(res, null, 'Password changed. Sign in again.'); }
  catch (error) { next(error); }
}

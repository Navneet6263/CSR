import { Router } from 'express';
import { changePasswordHandler, forgotPassword, login, logout, me, refresh, register, resendLoginOtp, resetPasswordHandler, verifyLoginOtp } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authRateLimit } from '../middleware/security';
import { validateBody } from '../middleware/validate';
import { changePasswordSchema, forgotPasswordSchema, loginSchema, registerSchema, resendLoginOtpSchema, resetPasswordSchema, verifyLoginOtpSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', authRateLimit, validateBody(registerSchema), register);
router.post('/login', authRateLimit, validateBody(loginSchema), login);
router.post('/login/verify-otp', authRateLimit, validateBody(verifyLoginOtpSchema), verifyLoginOtp);
router.post('/login/resend-otp', authRateLimit, validateBody(resendLoginOtpSchema), resendLoginOtp);
router.post('/refresh', authRateLimit, refresh);
router.post('/forgot-password', authRateLimit, validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authRateLimit, validateBody(resetPasswordSchema), resetPasswordHandler);
router.post('/change-password', authenticate, validateBody(changePasswordSchema), changePasswordHandler);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export default router;

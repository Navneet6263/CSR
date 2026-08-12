import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { config } from './config/env';
import { checkDatabase } from './config/database';
import { requestContext } from './middleware/requestContext';
import { apiRateLimit, responseCompression, securityHeaders } from './middleware/security';
import { verifyCsrf } from './middleware/csrf';
import { errorHandler } from './middleware/errorHandler';
import { sendError } from './utils/response';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import scholarshipRoutes from './routes/scholarship.routes';
import applicationRoutes from './routes/application.routes';
import institutionRoutes from './routes/institution.routes';
import verificationRoutes from './routes/verification.routes';
import screeningRoutes from './routes/screening.routes';
import financeRoutes from './routes/finance.routes';
import adminRoutes from './routes/admin.routes';
import documentRoutes from './routes/document.routes';
import notificationRoutes from './routes/notification.routes';
import publicRoutes from './routes/public.routes';
import supportRoutes from './routes/support.routes';

const logger = pino({ level: config.logLevel });
const app = express();

app.disable('x-powered-by');
app.disable('etag');
app.set('trust proxy', config.trustProxy);
app.use(requestContext);
app.use(pinoHttp({ logger, redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'] }));
app.use(securityHeaders);
app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Origin is not allowed by CORS.'));
  },
}));
app.use(responseCompression);
app.use('/api/v1', (_req: Request, res: Response, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use(cookieParser());
app.use(express.json({ limit: '1mb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(apiRateLimit);
app.use(verifyCsrf);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/health/ready', async (_req: Request, res: Response) => {
  try {
    await checkDatabase();
    res.status(200).json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not-ready' });
  }
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/scholarships', scholarshipRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/institutions', institutionRoutes);
app.use('/api/v1/verify', verificationRoutes);
app.use('/api/v1/screening', screeningRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/support', supportRoutes);

app.use((_req: Request, res: Response) => sendError(res, 'Route not found', 404));
app.use(errorHandler);

export default app;

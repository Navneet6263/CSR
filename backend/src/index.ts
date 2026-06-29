import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import scholarshipRoutes from './routes/scholarship.routes';
import applicationRoutes from './routes/application.routes';
import institutionRoutes from './routes/institution.routes';
import verificationRoutes from './routes/verification.routes';
import screeningRoutes from './routes/screening.routes';
import financeRoutes from './routes/finance.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/errorHandler';
import { sendError } from './utils/response';

const app = express();

// ─── Global Middleware ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── Request Logger ─────────────────────────────────────────────────────────
app.use((req: Request, _res: Response, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Scholarship Management API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/scholarships', scholarshipRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/institutions', institutionRoutes);
app.use('/api/v1/verify', verificationRoutes);
app.use('/api/v1/screening', screeningRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/admin', adminRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  sendError(res, 'Route not found', 404);
});

// ─── Global Error Handler (must be last) ────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  console.log(`Health check: http://localhost:${config.port}/health`);
});

export default app;

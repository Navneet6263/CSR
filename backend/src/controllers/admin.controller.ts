import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import * as adminService from '../services/admin.service';

export async function getDashboardMetricsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const metrics = await adminService.getDashboardMetrics();
    sendSuccess(res, metrics, 'Dashboard metrics retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function toggleApplicationHoldHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const appId = parseInt(req.params.id as string, 10);
    const { hold, reason } = req.body;
    const result = await adminService.toggleApplicationHold(appId, hold, reason);
    sendSuccess(res, result, 'Hold status updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function getRolePipelineHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const role = req.params.role as 'reviewer' | 'bgchecker' | 'screener' | 'csr';
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const pipeline = await adminService.getPipelineByRole(role, page, limit);
    sendSuccess(res, pipeline, `Pipeline for ${role} retrieved successfully`);
  } catch (error) {
    next(error);
  }
}

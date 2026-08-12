import { Request } from 'express';
import { AuthError } from './errors';
import { WorkflowActor } from '../services/workflow.service';

export function requestActor(req: Request): WorkflowActor {
  if (!req.user) throw new AuthError('Authentication required.');
  return {
    userId: req.user.userId,
    role: req.user.role,
    requestId: req.res?.locals.requestId,
    ipAddress: req.ip,
  };
}

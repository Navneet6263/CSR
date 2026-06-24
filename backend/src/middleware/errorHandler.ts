import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Already sent a response — don't send another
  if (res.headersSent) {
    return;
  }

  // Known operational errors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Unexpected errors
  console.error('[UnhandledError]', err);
  sendError(res, 'Internal Server Error', 500);
}

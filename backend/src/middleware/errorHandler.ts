import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';

interface SqlError extends Error {
  number?: number;
  code?: string;
}

const transientDatabaseCodes = new Set(['ECONNRESET', 'ECONNREFUSED', 'ETIMEOUT', 'ESOCKET']);

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (res.headersSent) return;

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }
  if (err instanceof multer.MulterError) {
    sendError(res, err.code === 'LIMIT_FILE_SIZE' ? 'File exceeds the 5 MB limit.' : 'Invalid upload.', 400);
    return;
  }

  const sqlError = err as SqlError;
  if (sqlError.number === 2601 || sqlError.number === 2627) {
    sendError(res, 'This record already exists.', 409);
    return;
  }
  if (sqlError.number === 547) {
    sendError(res, 'This operation conflicts with related data.', 409);
    return;
  }
  if (sqlError.name === 'KnexTimeoutError' || (sqlError.code && transientDatabaseCodes.has(sqlError.code))) {
    req.log?.warn({ err, requestId: res.locals.requestId }, 'Database temporarily unavailable');
    res.setHeader('Retry-After', '2');
    sendError(res, 'Database is temporarily unavailable. Please retry.', 503);
    return;
  }

  req.log?.error({ err, requestId: res.locals.requestId }, 'Unhandled request error');
  sendError(res, 'Internal Server Error', 500);
}

import { Response } from 'express';
import { IApiResponse } from '../types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): void {
  const body: IApiResponse<T> = { success: true, data, message };
  res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  message: string = 'Internal Server Error',
  statusCode: number = 500
): void {
  const body: IApiResponse = { success: false, data: null, message };
  res.status(statusCode).json(body);
}

import { Request, Response, NextFunction } from 'express';
import { financeService } from '../services/finance.service';
import { sendSuccess } from '../utils/response';

export const getPendingInitiation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await financeService.getPendingInitiation();
    sendSuccess(res, data, 'Fetched pending initiation applications successfully');
  } catch (error) {
    next(error);
  }
};

export const initiatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const makerId = req.user!.userId;
    const data = await financeService.initiatePayment(req.body, makerId);
    sendSuccess(res, data, 'Payment initiated successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getPendingVerifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await financeService.getPendingVerifications();
    sendSuccess(res, data, 'Fetched pending verifications successfully');
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const checkerId = req.user!.userId;
    const paymentId = parseInt(req.params.id as string, 10);
    const data = await financeService.verifyPayment(paymentId, checkerId, req.body);
    sendSuccess(res, data, 'Payment verified successfully');
  } catch (error) {
    next(error);
  }
};

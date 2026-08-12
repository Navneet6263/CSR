import { NextFunction, Request, Response } from 'express';
import { getUserNotifications, markAllNotificationsRead, markNotificationRead } from '../services/notification.service';
import { ValidationError } from '../utils/errors';
import { sendSuccess } from '../utils/response';

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getUserNotifications(req.user!.userId)); } catch (error) { next(error); }
}

export async function readAllNotifications(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await markAllNotificationsRead(req.user!.userId)); } catch (error) { next(error); }
}

export async function readNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const notificationId = Number(req.params.id);
    if (!Number.isInteger(notificationId) || notificationId < 1) throw new ValidationError('Invalid notification id.');
    sendSuccess(res, await markNotificationRead(notificationId, req.user!.userId));
  } catch (error) { next(error); }
}

import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import * as docAuditService from '../services/documentAudit.service';
import * as bgCheckService from '../services/backgroundCheck.service';
import { DocReviewInput, BgCheckInput } from '../validators/verification.validator';
import db from '../config/database';
import { NotFoundError } from '../utils/errors';

export async function getDocsPending(req: Request, res: Response, next: NextFunction) {
  try {
    const apps = await docAuditService.getPendingReviewApplications();
    sendSuccess(res, apps, 'Pending review applications retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function reviewDoc(req: Request, res: Response, next: NextFunction) {
  try {
    const checklistId = parseInt(req.params.id as string, 10);
    const reviewerId = req.user!.userId;
    const { status, rejectionReason } = req.body as DocReviewInput;

    const result = await docAuditService.reviewDocument(checklistId, reviewerId, status, rejectionReason);
    sendSuccess(res, result, 'Document reviewed successfully');
  } catch (error) {
    next(error);
  }
}

export async function getReUploads(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const student = await db('Students').where({ UserID: userId }).first();
    if (!student) throw new NotFoundError('Student profile not found');

    const docs = await docAuditService.getStudentReUploads(student.StudentID);
    sendSuccess(res, docs, 'Re-upload requests retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function uploadDoc(req: Request, res: Response, next: NextFunction) {
  try {
    const { applicationId, documentType, fileUrl } = req.body;
    
    const userId = req.user!.userId;
    const student = await db('Students').where({ UserID: userId }).first();
    if (!student) throw new NotFoundError('Student profile not found');

    const app = await db('Applications').where({ ApplicationID: applicationId, StudentID: student.StudentID }).first();
    if (!app) throw new NotFoundError('Application not found for this student');

    const result = await docAuditService.uploadDocument(applicationId, documentType, fileUrl);
    sendSuccess(res, result, 'Document uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getBGChecksPending(req: Request, res: Response, next: NextFunction) {
  try {
    const apps = await bgCheckService.getPendingBGChecks();
    sendSuccess(res, apps, 'Pending background checks retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function submitBGCheck(req: Request, res: Response, next: NextFunction) {
  try {
    const applicationId = parseInt(req.params.applicationId as string, 10);
    const officerId = req.user!.userId;
    const { checkType, result, notes, evidenceUrl } = req.body as BgCheckInput;

    const bgCheck = await bgCheckService.submitBGCheck(
      applicationId, officerId, checkType, result, notes, evidenceUrl
    );

    sendSuccess(res, bgCheck, 'Background check submitted successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getAppDocs(req: Request, res: Response, next: NextFunction) {
  try {
    const applicationId = parseInt(req.params.id as string, 10);
    const docs = await docAuditService.getApplicationDocs(applicationId);
    
    // Also get student basic details for the UI header
    const studentData = await db('Applications as a')
      .join('Students as s', 's.StudentID', 'a.StudentID')
      .join('Users as u', 'u.UserID', 's.UserID')
      .join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID')
      .select('u.FullName as name', 'u.Email as email', 'u.Phone as phone', 'a.ApplicationID as applicationId', 'sc.Name as scholarship', 's.AadharNumber as aadhar', 's.AnnualFamilyIncome as income', 's.*')
      .where('a.ApplicationID', applicationId)
      .first();

    sendSuccess(res, { student: studentData, docs }, 'Application documents retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getReviewerLogsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const reviewerId = req.user!.userId;
    const logs = await docAuditService.getReviewerLogs(reviewerId);
    sendSuccess(res, logs, 'Reviewer logs retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getStatsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const reviewerId = req.user!.userId;
    const stats = await docAuditService.getReviewerStats(reviewerId);
    sendSuccess(res, stats, 'Reviewer stats retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getBGCheckDetailsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const applicationId = parseInt(req.params.applicationId as string, 10);
    const details = await bgCheckService.getBGCheckDetails(applicationId);
    sendSuccess(res, details, 'Background check details retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getBGOfficerLogsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const officerId = req.user!.userId;
    const logs = await bgCheckService.getBGOfficerLogs(officerId);
    sendSuccess(res, logs, 'Officer logs retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getBGOfficerStatsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const officerId = req.user!.userId;
    const stats = await bgCheckService.getBGOfficerStats(officerId);
    sendSuccess(res, stats, 'Officer stats retrieved successfully');
  } catch (error) {
    next(error);
  }
}

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { config } from '../config/env';
import { ValidationError } from '../utils/errors';

const incomingRoot = path.join(config.privateUploadRoot, '.incoming');
fs.mkdirSync(incomingRoot, { recursive: true });

const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const scholarshipSourceMimeTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  'application/csv',
]);
const logoMimeTypes = new Set(['image/jpeg', 'image/png']);
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, incomingRoot),
  filename: (_req, _file, callback) => callback(null, crypto.randomUUID()),
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 5 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new ValidationError('Only PDF, JPEG, and PNG documents are allowed.'));
      return;
    }
    callback(null, true);
  },
});

export const scholarshipSourceUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 5 },
  fileFilter: (_req, file, callback) => {
    if (!scholarshipSourceMimeTypes.has(file.mimetype)) {
      callback(new ValidationError('Only PDF, DOCX, XLSX, CSV, and TXT source files are allowed.'));
      return;
    }
    callback(null, true);
  },
});

export const sponsorLogoUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 2 },
  fileFilter: (_req, file, callback) => {
    if (!logoMimeTypes.has(file.mimetype)) {
      callback(new ValidationError('Only PNG and JPEG logos are allowed.'));
      return;
    }
    callback(null, true);
  },
});

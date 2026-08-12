import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { config } from '../config/env';

const incomingRoot = path.join(config.privateUploadRoot, '.incoming');
fs.mkdirSync(incomingRoot, { recursive: true });

const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, incomingRoot),
  filename: (_req, _file, callback) => callback(null, crypto.randomUUID()),
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 5 },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new Error('Only PDF, JPEG, and PNG documents are allowed.'));
      return;
    }
    callback(null, true);
  },
});

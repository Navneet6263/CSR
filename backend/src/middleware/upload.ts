import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Save to /uploads/students/<userId>/
    const userId = req.user?.userId;
    if (!userId) return cb(new Error('Unauthorized'), '');

    const dest = path.join(process.cwd(), 'uploads', 'students', String(userId));
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Naming: <docType>.<ext>
    const docType = req.body.docType || 'unknown';
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `${docType}${ext}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

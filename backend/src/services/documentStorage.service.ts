import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { config } from '../config/env';
import { ValidationError } from '../utils/errors';
import { scanDocument, validateFileSignature } from './documentScanner.service';

interface UploadedFile { path: string; mimetype: string; }

const aliases: Record<string, string> = {
  aadhar: 'aadhaar_card', identity: 'aadhaar_card', aadhaar_card: 'aadhaar_card',
  passportphoto: 'photo', photo: 'photo', income: 'income_cert', income_cert: 'income_cert',
  caste: 'caste_cert', castecertificate: 'caste_cert', caste_cert: 'caste_cert',
  domicilecertificate: 'domicile_cert', domicile_cert: 'domicile_cert',
  education: 'marksheet_10', academic10th: 'marksheet_10', marksheet_10: 'marksheet_10',
  academic12th: 'marksheet_12', marksheet_12: 'marksheet_12', bonafide: 'bonafide',
  bank: 'passbook', bankpassbook: 'passbook', passbook: 'passbook', recommendation: 'recommendation',
  fatheraadhar: 'father_aadhaar', father_aadhaar: 'father_aadhaar',
  motheraadhar: 'mother_aadhaar', mother_aadhaar: 'mother_aadhaar',
  fatherpayslip: 'father_payslip', father_payslip: 'father_payslip',
  bankstatement: 'bank_statement', bank_statement: 'bank_statement',
};

export function normalizeDocumentType(value: string): string {
  const key = value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  const normalized = aliases[key];
  if (!normalized) throw new ValidationError('Unsupported document type.');
  return normalized;
}

function extensionFor(mimeType: string): string {
  if (mimeType === 'application/pdf') return '.pdf';
  if (mimeType === 'image/png') return '.png';
  return '.jpg';
}

async function sha256(filePath: string): Promise<string> {
  const hash = crypto.createHash('sha256');
  await pipeline(fs.createReadStream(filePath), hash);
  return hash.digest('hex');
}

export async function secureUploadedFile(
  file: UploadedFile,
  studentId: number,
  documentType: string,
) {
  await validateFileSignature(file.path, file.mimetype);
  const scanStatus = await scanDocument(file.path);
  const digest = await sha256(file.path);
  const storageKey = path.join('students', String(studentId), documentType, `${crypto.randomUUID()}${extensionFor(file.mimetype)}`);
  const destination = path.resolve(config.privateUploadRoot, storageKey);
  if (!destination.startsWith(`${config.privateUploadRoot}${path.sep}`)) throw new ValidationError('Invalid storage path.');
  await fs.promises.mkdir(path.dirname(destination), { recursive: true });
  await fs.promises.rename(file.path, destination);
  return { storageKey, destination, digest, scanStatus };
}

export function resolveStorageKey(storageKey: string): string {
  const resolved = path.resolve(config.privateUploadRoot, storageKey);
  if (!resolved.startsWith(`${config.privateUploadRoot}${path.sep}`)) throw new ValidationError('Invalid storage path.');
  return resolved;
}

export async function removeStoredFile(filePath: string): Promise<void> {
  await fs.promises.rm(filePath, { force: true });
}

import fs from 'fs';
import net from 'net';
import { config } from '../config/env';
import { ValidationError } from '../utils/errors';

export async function validateFileSignature(filePath: string, mimeType: string): Promise<void> {
  const handle = await fs.promises.open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(8);
    await handle.read(buffer, 0, buffer.length, 0);
    const valid = mimeType === 'application/pdf'
      ? buffer.subarray(0, 5).toString() === '%PDF-'
      : mimeType === 'image/jpeg'
        ? buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
        : buffer.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    if (!valid) throw new ValidationError('File content does not match its declared type.');
  } finally {
    await handle.close();
  }
}

export async function scanDocument(filePath: string): Promise<'Clean' | 'Validated'> {
  if (!config.clamav.host) return 'Validated';
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(config.clamav.port, config.clamav.host);
    const stream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 });
    let response = '';
    const fail = (error: Error) => {
      stream.destroy();
      socket.destroy();
      reject(new ValidationError(`Document security scan failed: ${error.message}`));
    };
    socket.setTimeout(15_000, () => fail(new Error('scanner timeout')));
    socket.on('connect', () => {
      socket.write('zINSTREAM\0');
      stream.on('data', (chunk: Buffer) => {
        const size = Buffer.alloc(4);
        size.writeUInt32BE(chunk.length);
        socket.write(size);
        socket.write(chunk);
      });
      stream.on('end', () => socket.write(Buffer.alloc(4)));
      stream.on('error', fail);
    });
    socket.on('data', (chunk) => { response += chunk.toString(); });
    socket.on('end', () => {
      if (response.includes('FOUND')) return reject(new ValidationError('Uploaded document contains malware.'));
      if (!response.includes('OK')) return reject(new ValidationError('Document scanner returned an invalid response.'));
      resolve('Clean');
    });
    socket.on('error', fail);
  });
}

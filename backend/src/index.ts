import http from 'http';
import app from './app';
import { config } from './config/env';
import { closeDatabase } from './config/database';
import { startEmailWorker } from './services/emailOutbox.service';

const server = http.createServer(app);
server.keepAliveTimeout = 65_000;
server.headersTimeout = 70_000;
server.requestTimeout = 30_000;

server.listen(config.port, () => {
  console.info(`Scholarship API listening on port ${config.port}`);
  startEmailWorker();
});

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.info(`${signal} received; shutting down gracefully.`);

  const forceTimer = setTimeout(() => process.exit(1), 15_000);
  forceTimer.unref();
  server.close(async () => {
    await closeDatabase();
    clearTimeout(forceTimer);
    process.exit(0);
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('unhandledRejection', (error) => console.error('Unhandled rejection', error));
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception', error);
  void shutdown('uncaughtException');
});

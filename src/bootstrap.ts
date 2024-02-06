import { serve } from '@hono/node-server';
import { app } from './app';
import { logger } from './logger';

const server = serve(
  {
    port: 2000,
    fetch: app.fetch,
  },
  (addr) => logger.info(`Listening on ${addr.address}:${addr.port}`),
);

process.on('SIGTERM', async () => {
  logger.info('Shutting down: Heard SIGTERM');
  server.close();

  const message = await Promise.race([
    new Promise((resolve) =>
      setTimeout(
        // This is more so a warning. Orchestrator will likely go down a restart path we don't like if we throw.
        () => resolve('Timed out waiting for connections to close'),
        10_000,
      ),
    ),
    new Promise<void>((resolve) => {
      server.on('close', () => {
        logger.info('Connections closed. Goodbye!');
        resolve();
      });
    }),
  ]);

  if (message) {
    logger.info(message);
  }

  process.exit(0);
});

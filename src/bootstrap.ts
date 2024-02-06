import { serve } from '@hono/node-server';
import { app } from './app';

const server = serve(
  {
    port: 2000,
    fetch: app.fetch,
  },
  (addr) => console.log(`[server] Listening on ${addr.address}:${addr.port}`),
);

process.on('SIGTERM', async () => {
  console.log('[server] Shutting down: Heard SIGTERM');
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
        console.log('[server] Connections closed. Goodbye!');
        resolve();
      });
    }),
  ]);

  if (message) {
    console.log(`[server] ${message}`);
  }

  process.exit(0);
});

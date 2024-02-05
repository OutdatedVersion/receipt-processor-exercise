import { serve } from '@hono/node-server';
import { app } from './app';

serve(
  {
    port: 2000,
    fetch: app.fetch,
  },
  (addr) => console.log(`[server] listening on ${addr.address}:${addr.port}`),
);

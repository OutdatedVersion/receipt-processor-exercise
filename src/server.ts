import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const server = new Hono();

server.get('/', (ctx) => {
  return ctx.json({ hi: true });
});

serve({
  port: 2000,
  fetch: server.fetch,
});

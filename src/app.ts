import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ProcessedReceipt, Storage, receiptSchema } from './types';
import { DefaultRules, applyRules } from './rules';
import { randomUUID } from 'crypto';

const storage: Storage = Object.freeze({ receipts: new Map() });

const receipts = new Hono()
  .post('/process', zValidator('json', receiptSchema), async (ctx) => {
    const receipt = ctx.req.valid('json');

    const rulesOutput = applyRules(receipt, DefaultRules);
    const processedReceipt: ProcessedReceipt = {
      id: randomUUID(),
      pointsAwarded: rulesOutput.pointsAwarded,
      ledger: rulesOutput.ledger,
      receipt,
    };

    storage.receipts.set(processedReceipt.id, processedReceipt);

    return ctx.json({
      id: processedReceipt.id,
    });
  })
  .get(
    '/:id/points',
    zValidator('param', z.object({ id: z.string().uuid() })),
    (ctx) => {
      const id = ctx.req.valid('param').id;
      const processed = storage.receipts.get(id);

      if (!processed) {
        return ctx.json(
          { success: false, message: 'Receipt not found', data: { id } },
          { status: 404 },
        );
      }

      return ctx.json({
        points: processed.pointsAwarded,
      });
    },
  );

const health = new Hono().get('/', (ctx) => ctx.text('hi'));

export const app = new Hono();
const routes = app.route('/receipts', receipts).route('/health', health);
export type Routes = typeof routes;

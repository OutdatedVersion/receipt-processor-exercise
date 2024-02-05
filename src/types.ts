import { z } from 'zod';

export type ProcessedReceiptLedgerEntry = {
  ruleName: string;
  ruleVersion: number;
  pointsAwarded: number;
};

export type ProcessedReceipt = {
  id: string;
  pointsAwarded: number;
  ledger: ProcessedReceiptLedgerEntry[];
  receipt: Receipt;
};

export type Storage = {
  receipts: Map<string, ProcessedReceipt>;
};

const money = z.coerce.number().positive().finite();
export const receiptSchema = z.object({
  // Deviation: I added `&` to allow provided examples
  // ref https://github.com/fetch-rewards/receipt-processor-challenge/pull/11#issuecomment-1927953077
  retailer: z.string().regex(/^[\w\s-&]+$/),
  // TODO: check against yaml spec
  purchaseDate: z.string().regex(/\d{4}-\d{2}-\d{2}/),
  // TODO: check against yaml spec
  purchaseTime: z.string().regex(/\d{2}:\d{2}/),
  // TODO: does not strictly match spec
  total: money,
  items: z.array(
    z.object({
      shortDescription: z.string().regex(/^[\w\s-]+$/),
      price: money,
    }),
  ),
});
export type Receipt = z.infer<typeof receiptSchema>;

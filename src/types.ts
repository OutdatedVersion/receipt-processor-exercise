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

// Deviation: Accept numbers and strings. Be on the lookout for number truncation.
const money = z.coerce.number().positive().finite();
export const receiptSchema = z.object({
  // Deviation: I added `&` to allow provided examples
  // ref https://github.com/fetch-rewards/receipt-processor-challenge/pull/11#issuecomment-1927953077
  retailer: z.string().regex(/^[\w\s-&]+$/),
  // I'm just gonna let anything close enough through here. Logic handling dates is tested to support invalid dates.
  // Probably want to figure out why we're not using a combined date/time
  purchaseDate: z.string().regex(/\d{4}-\d{2}-\d{2}/),
  // Deviation: I'm not allowing seconds even though YAML's `format: time` can do 12/24 hour with seconds
  // Deviation: Let's invalid times through. Logic handling times knows what to do with it.
  //            Consider full date/time as a fix to avoid writing parsing logic?
  purchaseTime: z.string().regex(/\d{2}:\d{2}/),
  total: money,
  items: z
    .array(
      z.object({
        shortDescription: z.string().regex(/^[\w\s-]+$/),
        price: money,
      }),
    )
    .min(1),
});
export type Receipt = z.infer<typeof receiptSchema>;

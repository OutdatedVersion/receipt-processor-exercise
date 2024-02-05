import { parse, parseISO } from 'date-fns';
import type { ProcessedReceiptLedgerEntry, Receipt } from './types';

type Rule = {
  name: string;
  version: number;
  apply: (receipt: Receipt) => number;
};

export const alphanumericRule: Rule = {
  name: 'Point per alphanumeric character in retailer name',
  version: 1,
  apply: (receipt) => {
    const sum = receipt.retailer
      .match(/[a-z0-9]+/gi)
      ?.reduce((sum, match) => sum + match.length, 0);

    return sum ?? 0;
  },
};

export const totalMultipleOfPoint25Rule: Rule = {
  name: 'Lump points if total is a multiple of 0.25',
  version: 1,
  apply: (receipt) => {
    return receipt.total % 0.25 === 0 ? 25 : 0;
  },
};

export const roundDollarAmountTotalRule: Rule = {
  name: 'Lump points if total is round dollar amount (no cents)',
  version: 1,
  apply: (receipt) => {
    return receipt.total % 1 === 0 ? 50 : 0;
  },
};

export const everyTwoItemsRule: Rule = {
  name: 'Points for every 2 items',
  version: 1,
  apply: (receipt) => {
    return 5 * Math.floor(receipt.items.length / 2);
  },
};

export const oddPurchaseDateRule: Rule = {
  name: "Lump points if purchase date's day-of-month is odd number",
  version: 1,
  apply: (receipt) => {
    const purchaseDate = parseISO(receipt.purchaseDate);
    // @ts-ignore it is ok to pass a date here
    if (isNaN(purchaseDate)) {
      return 0;
    }
    const isEvenDate = purchaseDate.getDate() % 2 === 0;
    return isEvenDate ? 0 : 6;
  },
};

export const lateAfternoonPurchaseTimeRule: Rule = {
  name: 'Lump points if purchase time is between 2:00pm and 4:00pm',
  version: 1,
  apply: (receipt) => {
    const purchaseTime = parse(receipt.purchaseTime, 'HH:mm', new Date());
    // I'm assuming `purchaseTime` is in the timezone of wherever the purchase was made (i.e. local time)
    const hour = purchaseTime.getHours();
    // I did inclusive since asking people to wait until 2:01 seems funky
    return hour >= 14 && hour <= 16 ? 10 : 0;
  },
};

export const itemDescriptionLengthRule: Rule = {
  name: 'Points for every item with a description whose length is a multiple of 3',
  version: 1,
  apply: (receipt) => {
    return receipt.items
      .filter((item) => item.shortDescription.trim().length % 3 === 0)
      .reduce(
        (totalPoints, item) => totalPoints + Math.ceil(item.price * 0.2),
        0,
      );
  },
};

export const DefaultRules = Object.freeze([
  alphanumericRule,
  totalMultipleOfPoint25Rule,
  roundDollarAmountTotalRule,
  everyTwoItemsRule,
  oddPurchaseDateRule,
  lateAfternoonPurchaseTimeRule,
  itemDescriptionLengthRule,
]);

export const applyRules = (
  receipt: Receipt,
  rules: readonly Rule[],
): { pointsAwarded: number; ledger: ProcessedReceiptLedgerEntry[] } => {
  return rules.reduce(
    (result, rule) => {
      const pointsFromRule = rule.apply(receipt);
      if (pointsFromRule > 0) {
        result.pointsAwarded += pointsFromRule;
        result.ledger.push({
          ruleName: rule.name,
          ruleVersion: rule.version,
          pointsAwarded: pointsFromRule,
        });
      }

      return result;
    },
    { pointsAwarded: 0, ledger: [] as ProcessedReceiptLedgerEntry[] },
  );
};

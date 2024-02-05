import { describe, expect, it } from 'vitest';
import {
  alphanumericRule,
  applyRules,
  DefaultRules,
  everyTwoItemsRule,
  oddPurchaseDateRule,
  roundDollarAmountTotalRule,
  totalMultipleOfPoint25Rule,
} from './rules';
import { receiptSchema } from './types';

describe('rules overview', () => {
  it('matches the target example', () => {
    const receipt = receiptSchema.parse({
      retailer: 'Target',
      purchaseDate: '2022-01-01',
      purchaseTime: '13:01',
      items: [
        {
          shortDescription: 'Mountain Dew 12PK',
          price: '6.49',
        },
        {
          shortDescription: 'Emils Cheese Pizza',
          price: '12.25',
        },
        {
          shortDescription: 'Knorr Creamy Chicken',
          price: '1.26',
        },
        {
          shortDescription: 'Doritos Nacho Cheese',
          price: '3.35',
        },
        {
          shortDescription: '   Klarbrunn 12-PK 12 FL OZ  ',
          price: '12.00',
        },
      ],
      total: '35.35',
    });

    const result = applyRules(receipt, DefaultRules);

    expect(result.pointsAwarded).toBe(28);
    expect(result.ledger).toMatchSnapshot();
  });

  it('matches the M&M example', () => {
    const receipt = receiptSchema.parse({
      retailer: 'M&M Corner Market',
      purchaseDate: '2022-03-20',
      purchaseTime: '14:33',
      items: [
        {
          shortDescription: 'Gatorade',
          price: '2.25',
        },
        {
          shortDescription: 'Gatorade',
          price: '2.25',
        },
        {
          shortDescription: 'Gatorade',
          price: '2.25',
        },
        {
          shortDescription: 'Gatorade',
          price: '2.25',
        },
      ],
      total: '9.00',
    });

    const result = applyRules(receipt, DefaultRules);

    expect(result.pointsAwarded).toBe(109);
    expect(result.ledger).toMatchSnapshot();
  });
});

describe('individual rules', () => {
  describe('alphanumeric', () => {
    it('works', () => {
      expect(
        // @ts-expect-error
        alphanumericRule.apply({
          retailer: ' h1&%$ ',
        }),
      ).toBe(2);
    });
  });

  describe('multiple of 0.25', () => {
    it.each([0, -50])('does not explode for %s', (total) => {
      // @ts-expect-error
      totalMultipleOfPoint25Rule.apply({
        total,
      });
    });

    it.each([3.51, 33.33])('works for negative cases: %s', (total) => {
      expect(
        // @ts-expect-error
        totalMultipleOfPoint25Rule.apply({
          total,
        }),
      ).toBe(0);
    });

    it.each([2, 40, 600, 4.5])('works for positive cases: %s', (total) => {
      expect(
        // @ts-expect-error
        totalMultipleOfPoint25Rule.apply({
          total,
        }),
      ).toBe(25);
    });
  });

  describe('round dollar total', () => {
    it.each([0, -520])('does not explode for %s', (total) => {
      // @ts-expect-error
      roundDollarAmountTotalRule.apply({
        total,
      });
    });

    it.each([4.2, 3.51, 33.33])('works for negative cases: %s', (total) => {
      expect(
        // @ts-expect-error
        roundDollarAmountTotalRule.apply({
          total,
        }),
      ).toBe(0);
    });

    it.each([50, 259372, 1, 2])('works for positive cases: %s', (total) => {
      expect(
        // @ts-expect-error
        roundDollarAmountTotalRule.apply({
          total,
        }),
      ).toBe(50);
    });
  });

  describe('every two items', () => {
    it('is ok with empty items', () => {
      expect(
        // @ts-expect-error
        everyTwoItemsRule.apply({ items: [] }),
      ).toBe(0);
    });

    it('works', () => {
      expect(
        // @ts-expect-error
        everyTwoItemsRule.apply({
          items: [{ price: 1, shortDescription: 'idk' }],
        }),
      ).toBe(0);

      expect(
        // @ts-expect-error
        everyTwoItemsRule.apply({
          items: [
            { price: 1, shortDescription: 'idk' },
            { price: 2, shortDescription: 'yeah' },
          ],
        }),
      ).toBe(5);

      expect(
        // @ts-expect-error
        everyTwoItemsRule.apply({
          items: [
            { price: 1, shortDescription: 'idk' },
            { price: 2, shortDescription: 'yeah' },
            { price: 7, shortDescription: 'yes' },
            { price: 24, shortDescription: 'nope' },
          ],
        }),
      ).toBe(10);
    });
  });

  describe('odd purchase date', () => {
    it('does not explode on junk', () => {
      expect(
        // @ts-expect-error
        oddPurchaseDateRule.apply({ purchaseDate: 'um' }),
      ).toBe(0);
      expect(
        // @ts-expect-error
        oddPurchaseDateRule.apply({ purchaseDate: '10-10-1998' }),
      ).toBe(0);
    });

    it('works', () => {
      expect(
        // @ts-expect-error
        oddPurchaseDateRule.apply({ purchaseDate: '2000-01-01' }),
      ).toBe(6);
      expect(
        // @ts-expect-error
        oddPurchaseDateRule.apply({ purchaseDate: '2000-01-02' }),
      ).toBe(0);
    });
  });
});

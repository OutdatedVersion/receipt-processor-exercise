import { describe, it, expect } from 'vitest';
import { hc } from 'hono/client';
import type { Routes } from '../../src/app';

const api = hc<Routes>(
  process.env.TEST_SERVER_BASE_URL ?? 'http://127.0.0.1:2000/',
);

describe('end to end', () => {
  it.each([
    {
      name: 'target readme',
      points: 28,
      receipt: {
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
      },
    },
    {
      name: 'target examples dir',
      points: 31,
      receipt: {
        retailer: 'Target',
        purchaseDate: '2022-01-02',
        purchaseTime: '13:13',
        total: '1.25',
        items: [{ shortDescription: 'Pepsi - 12-oz', price: '1.25' }],
      },
    },
    {
      name: 'm&m',
      points: 109,
      receipt: {
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
      },
    },
    {
      name: 'walgreens',
      points: 15,
      receipt: {
        retailer: 'Walgreens',
        purchaseDate: '2022-01-02',
        purchaseTime: '08:13',
        total: '2.65',
        items: [
          { shortDescription: 'Pepsi - 12-oz', price: '1.25' },
          { shortDescription: 'Dasani', price: '1.40' },
        ],
      },
    },
  ])('passes example: $name', async (testCase) => {
    const result = await api.receipts.process.$post({
      // @ts-expect-error
      json: testCase.receipt,
    });

    const resp = await result.json();

    expect(resp).toEqual({
      id: expect.any(String),
    });

    const pointsGet = await api.receipts[':id'].points.$get({
      param: {
        id: resp.id,
      },
    });

    expect(pointsGet.status).toBe(200);
    expect(await pointsGet.json()).toStrictEqual({
      points: testCase.points,
    });
  });
});

describe('POST /receipts/process', () => {
  it('does validation', async () => {
    const result = await api.receipts.process.$post({
      // @ts-expect-error
      json: {},
    });
    expect(result.status).toBe(400);
  });
});

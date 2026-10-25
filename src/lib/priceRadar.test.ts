import { describe, expect, it } from 'vitest';
import { analyzePriceRadar } from './priceRadar';
const now = new Date('2026-10-25T12:00:00Z');
const own = [
  { sku: 'A-1', title: 'Ägghållare', priceSek: 100, active: true },
  { sku: 'B-1', title: 'Fodertråg', priceSek: 200, active: false },
];
const base = { sku: 'A-1', competitor: 'Exempelbutik', priceSek: 80,
  stock: 'in_stock' as const, checkedAt: '2026-10-25T10:00:00Z' };
describe('Aurora PriceRadar pilot', () => {
  it('reports a cheaper product matched by exact SKU', () => {
    expect(analyzePriceRadar(own, [base], { now })).toEqual([
      expect.objectContaining({ sku: 'A-1', kind: 'competitor_cheaper', differenceSek: 20, differencePct: 20 }),
    ]);
  });
  it('separates out-of-stock from purchasable cheaper products', () => {
    expect(analyzePriceRadar(own, [{ ...base, stock: 'out_of_stock' }], { now })[0].kind)
      .toBe('competitor_out_of_stock');
  });
  it('rejects stale, future and invalid observations', () => {
    expect(analyzePriceRadar(own, [{ ...base, checkedAt: '2026-10-19T10:00:00Z' }], { now })).toEqual([]);
    expect(analyzePriceRadar(own, [{ ...base, checkedAt: '2026-11-01T10:00:00Z' }], { now })).toEqual([]);
    expect(analyzePriceRadar(own, [{ ...base, priceSek: -1 }], { now })).toEqual([]);
  });
  it('never guesses SKU matches or reports inactive products', () => {
    expect(analyzePriceRadar(own, [{ ...base, sku: 'A1' }, { ...base, sku: 'B-1' }], { now })).toEqual([]);
  });
  it('excludes unknown stock and negligible price changes', () => {
    expect(analyzePriceRadar(own, [{ ...base, priceSek: 98 }, { ...base, stock: 'unknown' }], { now })).toEqual([]);
  });
  it('deduplicates identical observations', () => {
    expect(analyzePriceRadar(own, [base, base], { now })).toHaveLength(1);
  });
  it('rejects invalid configuration', () => {
    expect(analyzePriceRadar(own, [base], { now, maxAgeHours: 0 })).toEqual([]);
    expect(analyzePriceRadar([{ ...own[0], priceSek: NaN }], [base], { now })).toEqual([]);
  });
});

/**
 * Read-only competitor price analysis. Requires authorised, SKU-mapped SEK observations.
 * Never scrapes, fetches, or automatically adjusts product prices.
 */
export type PriceProduct = { sku: string; title: string; priceSek: number; active: boolean };
export type CompetitorObservation = {
  sku: string; competitor: string; priceSek: number;
  stock: 'in_stock' | 'out_of_stock' | 'unknown'; checkedAt: string
};
export type PriceRadarFinding = {
  sku: string; title: string; competitor: string; ourPriceSek: number;
  competitorPriceSek: number; differenceSek: number; differencePct: number;
  stock: CompetitorObservation['stock']; checkedAt: string;
  kind: 'competitor_cheaper' | 'competitor_out_of_stock'
};
const validSku = (s: string) => typeof s === 'string' && s.trim().length > 0 && s.length <= 100;
const validPrice = (v: number) => Number.isFinite(v) && v > 0 && v < 1000000;
/** Exact-SKU comparisons with strict data freshness and deduplication. */
export function analyzePriceRadar(
  own: readonly PriceProduct[],
  observations: readonly CompetitorObservation[],
  options: { now?: Date; maxAgeHours?: number; minDifferencePct?: number } = {},
): PriceRadarFinding[] {
  const now = options.now ?? new Date();
  const maxAgeHours = options.maxAgeHours ?? 24;
  const minDifferencePct = options.minDifferencePct ?? 5;
  if (!Number.isFinite(now.valueOf()) || !(maxAgeHours > 0 && maxAgeHours <= 168) ||
    !(minDifferencePct >= 0 && minDifferencePct <= 100)) return [];
  const bySku = new Map(own.filter(p => p.active && validSku(p.sku) && validPrice(p.priceSek))
    .map(p => [p.sku.trim(), p]));
  const results: PriceRadarFinding[] = [];
  const dedup = new Set<string>();
  for (const o of observations) {
    if (!validSku(o.sku) || !o.competitor?.trim() || o.competitor.length > 120 ||
      !validPrice(o.priceSek)) continue;
    const product = bySku.get(o.sku.trim());
    if (!product) continue;
    const checked = Date.parse(o.checkedAt);
    if (!Number.isFinite(checked) || checked > now.valueOf() ||
      now.valueOf() - checked > maxAgeHours * 3600000) continue;
    if (!['in_stock','out_of_stock','unknown'].includes(o.stock)) continue;
    const key = o.sku + '\0' + o.competitor;
    if (dedup.has(key)) continue;
    dedup.add(key);
    const differenceSek = Math.round((product.priceSek - o.priceSek) * 100) / 100;
    const differencePct = Math.round(differenceSek / product.priceSek * 1000) / 10;
    const kind = o.stock === 'out_of_stock' ? 'competitor_out_of_stock' :
      (o.stock === 'in_stock' && differencePct >= minDifferencePct ? 'competitor_cheaper' : null);
    if (!kind) continue;
    results.push({
      sku:o.sku.trim(), title:product.title, competitor:o.competitor.trim(),
      ourPriceSek:product.priceSek, competitorPriceSek:o.priceSek, differenceSek,
      differencePct, stock:o.stock, checkedAt:o.checkedAt, kind,
    });
  }
  return results.sort((a,b) => a.kind === b.kind ? b.differencePct - a.differencePct :
    (a.kind === 'competitor_cheaper' ? -1 : 1));
}

// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { managementInput } from '../../supabase/functions/admin-portfolio/management';

describe('project management boundary', () => {
  it('accepts a scoped plan without changing project identity or URLs', () => {
    expect(managementInput({ note: ' Internal ', nextAction: ' Call owner ', followupDate: '2026-10-08' }, 2)).toEqual({ management: { note: 'Internal', nextAction: 'Call owner', followupDate: '2026-10-08' }, version: 2 });
    expect(() => managementInput({ note: '', nextAction: '', followupDate: null, url: 'https://example.com' }, 0)).toThrow();
  });
  it('rejects invalid dates, oversized notes and invalid revisions', () => {
    for (const followupDate of ['2026-02-30', 'tomorrow', '', undefined]) expect(() => managementInput({ note: '', nextAction: '', followupDate }, 0)).toThrow();
    for (const version of [-1, '1', NaN, 1.5]) expect(() => managementInput({ note: '', nextAction: '', followupDate: null }, version)).toThrow();
    expect(() => managementInput({ note: 'a'.repeat(2001), nextAction: '', followupDate: null }, 0)).toThrow();
  });
});

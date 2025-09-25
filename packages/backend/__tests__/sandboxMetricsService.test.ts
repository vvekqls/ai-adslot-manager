import {
  ingestSandboxMetric,
  getSandboxSummaries,
  getSandboxAdSlots,
  resetSandboxMetrics
} from '../src/services/sandboxMetricsService.js';

describe('sandboxMetricsService', () => {
  beforeEach(() => {
    resetSandboxMetrics();
  });

  it('aggregates sandbox metrics and computes score', () => {
    ingestSandboxMetric({
      slotId: 'sandbox-1',
      cls: 0.04,
      lcp: 2500,
      fid: 18,
      tbt: 120,
      adLoadTime: 2100,
      timeoutRate: 0.2,
      viewability: 0.65,
      sandboxConfig: {
        name: 'Sandbox Inline',
        placement: 'inline',
        sizes: [{ width: 300, height: 250 }],
        prebidTimeoutMs: 800,
        lazyLoad: true,
        order: 999
      }
    });

    ingestSandboxMetric({
      slotId: 'sandbox-1',
      cls: 0.02,
      lcp: 2300,
      fid: 14,
      tbt: 90,
      adLoadTime: 1800,
      timeoutRate: 0.15,
      viewability: 0.68,
      sandboxConfig: {
        name: 'Sandbox Inline',
        placement: 'inline',
        sizes: [{ width: 300, height: 250 }],
        prebidTimeoutMs: 800,
        lazyLoad: true,
        order: 999
      }
    });

    const summaries = getSandboxSummaries();
    expect(summaries).toHaveLength(1);
    const summary = summaries[0];

    expect(summary.samples).toBe(2);
    expect(summary.avgCls).toBeCloseTo(0.03);
    expect(summary.origin).toBe('sandbox');
    expect(summary.performanceScore).toBeGreaterThan(0);
    expect(summary.performanceScore).toBeLessThanOrEqual(100);

    const sandboxSlots = getSandboxAdSlots();
    expect(sandboxSlots).toEqual([
      {
        id: 'sandbox-1',
        name: 'Sandbox Inline',
        placement: 'inline',
        sizes: [{ width: 300, height: 250 }],
        prebidTimeoutMs: 800,
        lazyLoad: true,
        order: 999
      }
    ]);
  });
});

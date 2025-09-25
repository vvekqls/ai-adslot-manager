import { RulesEngine } from '../src/rulesEngine/index.js';
import type { SlotMetricSummary } from '../src/services/metricsService.js';
import type { AdSlotConfig } from '../src/rulesEngine/index.js';

describe('RulesEngine', () => {
  const engine = new RulesEngine();

  const metrics: SlotMetricSummary[] = [
    {
      slotId: 'slot-1',
      avgCls: 0.15,
      avgLcp: 2800,
      avgFid: 20,
      avgTbt: 150,
      avgAdLoadTime: 3200,
      avgTimeoutRate: 0.25,
      avgViewability: 0.4,
      samples: 10
    }
  ];

  const adSlots: AdSlotConfig[] = [
    {
      id: 'slot-1',
      name: 'Top Inline',
      placement: 'inline',
      sizes: ['300x250'],
      prebidTimeoutMs: 1200,
      lazyLoad: false,
      order: 1
    }
  ];

  it('should generate actionable recommendations for problematic metrics', () => {
    const recommendations = engine.evaluate({ metrics, adSlots });

    expect(recommendations).toHaveLength(4);
    const actions = recommendations.map((rec) => rec.action);
    expect(actions).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Reorder slot'),
        expect.stringContaining('Increase Prebid timeout'),
        expect.stringContaining('Enable lazy loading'),
        expect.stringContaining('Audit creatives')
      ])
    );
  });
});

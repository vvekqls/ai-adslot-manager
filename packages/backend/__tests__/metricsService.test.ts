import { prisma } from '../src/prismaClient.js';
import { getSlotMetricsSummary } from '../src/services/metricsService.js';

jest.mock('../src/services/sandboxMetricsService.js', () => ({
  getSandboxSummaries: jest.fn(() => [])
}));

describe('metricsService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('aggregates metrics correctly', async () => {
    jest.spyOn(prisma.metric, 'groupBy').mockResolvedValueOnce([
      {
        slotId: 'slot-1',
        _avg: {
          cls: 0.02,
          lcp: 1800,
          fid: 12,
          tbt: 60,
          adLoadTime: 1500,
          timeoutRate: 0.05,
          viewability: 0.7
        },
        _count: { slotId: 5 }
      }
    ] as any);

    const summary = await getSlotMetricsSummary();
    expect(summary).toEqual([
      {
        slotId: 'slot-1',
        avgCls: 0.02,
        avgLcp: 1800,
        avgFid: 12,
        avgTbt: 60,
        avgAdLoadTime: 1500,
        avgTimeoutRate: 0.05,
        avgViewability: 0.7,
        samples: 5,
        origin: 'catalog',
        performanceScore: 86
      }
    ]);
  });
});

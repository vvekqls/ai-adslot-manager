import express from 'express';
import request from 'supertest';

import { metricsRouter } from '../src/routes/metrics.js';
import { getAdSlotById } from '../src/services/adSlotService.js';
import { recordMetric } from '../src/services/metricsService.js';
import { generateRecommendations } from '../src/services/recommendationService.js';
import { ingestSandboxMetric } from '../src/services/sandboxMetricsService.js';

jest.mock('../src/services/adSlotService.js', () => ({
  getAdSlotById: jest.fn()
}));

jest.mock('../src/services/metricsService.js', () => ({
  recordMetric: jest.fn()
}));

jest.mock('../src/services/recommendationService.js', () => ({
  generateRecommendations: jest.fn()
}));

jest.mock('../src/services/sandboxMetricsService.js', () => ({
  ingestSandboxMetric: jest.fn(() => ({
    slotId: 'sandbox-12345',
    avgCls: 0.02,
    avgLcp: 2100,
    avgFid: 15,
    avgTbt: 50,
    avgAdLoadTime: 1600,
    avgTimeoutRate: 1,
    avgViewability: 0.6,
    samples: 1,
    origin: 'sandbox',
    performanceScore: 55
  }))
}));

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/metrics', metricsRouter);
  return app;
};

describe('metricsRouter', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (generateRecommendations as jest.MockedFunction<typeof generateRecommendations>).mockResolvedValue([]);
  });

  it('persists metrics for managed ad slots', async () => {
    (getAdSlotById as jest.MockedFunction<typeof getAdSlotById>).mockResolvedValueOnce({ id: 'slot-1' } as any);
    (recordMetric as jest.MockedFunction<typeof recordMetric>).mockResolvedValueOnce({ id: 'metric-1' } as any);

    const response = await request(createApp()).post('/metrics').send({
      slotId: '00000000-0000-0000-0000-000000000001',
      cls: 0.01,
      lcp: 1800,
      fid: 12,
      tbt: 40,
      adLoadTime: 1500,
      timeoutRate: 0,
      viewability: 0.75
    });

    expect(response.status).toBe(201);
    expect(recordMetric).toHaveBeenCalledTimes(1);
    expect(generateRecommendations).toHaveBeenCalledTimes(1);
  });

  it('acknowledges sandbox metrics without persisting', async () => {
    (getAdSlotById as jest.MockedFunction<typeof getAdSlotById>).mockResolvedValueOnce(null);

    const response = await request(createApp()).post('/metrics').send({
      slotId: 'sandbox-12345',
      cls: 0.02,
      lcp: 2100,
      fid: 15,
      tbt: 50,
      adLoadTime: 1600,
      timeoutRate: 1,
      viewability: 0.6,
      sandboxConfig: {
        name: 'Sandbox Inline',
        placement: 'inline',
        sizes: [{ width: 300, height: 250 }],
        prebidTimeoutMs: 800,
        lazyLoad: true,
        order: 999
      }
    });

    expect(response.status).toBe(202);
    expect(recordMetric).not.toHaveBeenCalled();
    expect(generateRecommendations).toHaveBeenCalledTimes(1);
    expect(ingestSandboxMetric).toHaveBeenCalledTimes(1);
    expect(response.body.summary.performanceScore).toBe(55);
  });

  it('rejects metrics for unknown slots', async () => {
    (getAdSlotById as jest.MockedFunction<typeof getAdSlotById>).mockResolvedValueOnce(null);

    const response = await request(createApp()).post('/metrics').send({
      slotId: '00000000-0000-0000-0000-000000000099',
      cls: 0.02,
      lcp: 2100,
      fid: 15,
      tbt: 50,
      adLoadTime: 1600,
      timeoutRate: 0.25,
      viewability: 0.6
    });

    expect(response.status).toBe(404);
    expect(recordMetric).not.toHaveBeenCalled();
    expect(generateRecommendations).not.toHaveBeenCalled();
  });
});


import express from 'express';
import request from 'supertest';
import { aiRouter } from '../src/routes/ai.js';
import {
  generateRecommendations,
  listRecommendations
} from '../src/services/recommendationService.js';

jest.mock('../src/services/recommendationService.js', () => ({
  generateRecommendations: jest.fn(),
  listRecommendations: jest.fn()
}));

const createTestApp = () => {
  const app = express();
  app.use('/ai', aiRouter);
  return app;
};

describe('AI routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns stored recommendations by default', async () => {
    (listRecommendations as jest.MockedFunction<typeof listRecommendations>).mockResolvedValueOnce([
      {
        slotId: 'slot-1',
        action: 'Keep hero slot prioritized',
        rationale: 'Hero slot is fast and highly viewable.',
        priority: 'medium'
      }
    ]);

    const response = await request(createTestApp()).get('/ai/recommend');

    expect(response.status).toBe(200);
    expect(response.body.recommendations).toHaveLength(1);
    expect(listRecommendations).toHaveBeenCalledTimes(1);
    expect(generateRecommendations).not.toHaveBeenCalled();
  });

  it('regenerates when refresh query flag is provided', async () => {
    (generateRecommendations as jest.MockedFunction<typeof generateRecommendations>).mockResolvedValueOnce([
      {
        slotId: 'slot-2',
        action: 'Extend Prebid timeout',
        rationale: 'Bids are timing out; allow additional auction time.',
        priority: 'high'
      }
    ]);

    const response = await request(createTestApp()).get('/ai/recommend').query({ refresh: 'true' });

    expect(response.status).toBe(200);
    expect(response.body.recommendations).toHaveLength(1);
    expect(generateRecommendations).toHaveBeenCalledTimes(1);
    expect(listRecommendations).not.toHaveBeenCalled();
  });

  it('regenerates automatically when no cached recommendations exist', async () => {
    (listRecommendations as jest.MockedFunction<typeof listRecommendations>).mockResolvedValueOnce([]);
    (generateRecommendations as jest.MockedFunction<typeof generateRecommendations>).mockResolvedValueOnce([
      {
        slotId: 'slot-3',
        action: 'Lazy-load below-the-fold units',
        rationale: 'Improve LCP by deferring offscreen ads.',
        priority: 'low'
      }
    ]);

    const response = await request(createTestApp()).get('/ai/recommend');

    expect(response.status).toBe(200);
    expect(listRecommendations).toHaveBeenCalledTimes(1);
    expect(generateRecommendations).toHaveBeenCalledTimes(1);
    expect(response.body.recommendations).toHaveLength(1);
  });
});

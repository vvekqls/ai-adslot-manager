import { Router } from 'express';
import { getSlotMetricsSummary } from '../services/metricsService.js';

export const analyticsRouter = Router();

analyticsRouter.get('/summary', async (_req, res) => {
  const summary = await getSlotMetricsSummary();
  res.json(summary);
});

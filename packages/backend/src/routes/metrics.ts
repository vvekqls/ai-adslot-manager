import { Router } from 'express';
import { metricPayloadSchema } from '../types/metrics.js';
import { recordMetric } from '../services/metricsService.js';

export const metricsRouter = Router();

metricsRouter.post('/', async (req, res) => {
  const parseResult = metricPayloadSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parseResult.error.flatten() });
  }

  const metric = await recordMetric(parseResult.data);
  res.status(201).json(metric);
});

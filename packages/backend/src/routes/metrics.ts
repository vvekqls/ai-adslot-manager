import { Router } from 'express';
import { metricPayloadSchema } from '../types/metrics.js';
import { recordMetric } from '../services/metricsService.js';
import { generateRecommendations } from '../services/recommendationService.js';
import { logger } from '../logger.js';
import { getAdSlotById } from '../services/adSlotService.js';
import { ingestSandboxMetric } from '../services/sandboxMetricsService.js';

export const metricsRouter = Router();

metricsRouter.post('/', async (req, res) => {
  const parseResult = metricPayloadSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parseResult.error.flatten() });
  }

  const { slotId } = parseResult.data;

  const slot = await getAdSlotById(slotId);
  if (!slot) {
    if (slotId.startsWith('sandbox-')) {
      const summary = ingestSandboxMetric(parseResult.data);
      logger.info(
        `Recorded sandbox metric for ${slotId}; keeping in-memory aggregates available for dashboard previews.`
      );
      void generateRecommendations().catch((error) => {
        logger.error(
          `Failed to refresh AI recommendations after sandbox metric ingestion: ${(error as Error).message}`
        );
      });
      return res
        .status(202)
        .json({ message: 'Sandbox metric captured for dashboard previews.', summary });
    }

    return res.status(404).json({ message: `Ad slot ${slotId} was not found.` });
  }

  const metric = await recordMetric(parseResult.data);
  res.status(201).json(metric);

  void generateRecommendations().catch((error) => {
    logger.error(`Failed to refresh AI recommendations after metric ingestion: ${(error as Error).message}`);
  });
});

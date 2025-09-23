import { Router } from 'express';
import { metricsRouter } from './metrics.js';
import { analyticsRouter } from './analytics.js';
import { aiRouter } from './ai.js';
import { adSlotsRouter } from './slots.js';

export const router = Router();

router.use('/metrics', metricsRouter);
router.use('/analytics', analyticsRouter);
router.use('/ai', aiRouter);
router.use('/ad-slots', adSlotsRouter);
